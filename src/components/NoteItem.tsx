import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceTextarea } from "@/components/VoiceTextarea";
import { Pin, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";

interface NoteItemProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

export const NoteItem = ({ note, onUpdate, onDelete }: NoteItemProps) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  const autoSave = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    const timeout = setTimeout(() => {
      onUpdate(note.id, { 
        title, 
        content,
        updatedAt: new Date().toISOString()
      });
    }, 500);
    setSaveTimeout(timeout);
  }, [title, content, note.id, onUpdate, saveTimeout]);

  useEffect(() => {
    if (title !== note.title || content !== note.content) {
      autoSave();
    }
  }, [title, content]);

  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    autoResizeTextarea();
  };

  const togglePin = () => {
    onUpdate(note.id, { isPinned: !note.isPinned });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Auto-resize textarea based on content
  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current && !isExpanded) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isExpanded]);

  // Auto-resize on content change
  useEffect(() => {
    autoResizeTextarea();
  }, [content, autoResizeTextarea]);

  return (
    <Card className={cn(
      "p-4 space-y-3 transition-colors",
      note.isPinned && "border-primary bg-primary/5"
    )}>
      <div className="flex items-start gap-2">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="flex-1 font-medium"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpand}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePin}
          className={cn(note.isPinned && "text-primary")}
        >
          <Pin className={cn("h-4 w-4", note.isPinned && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <VoiceTextarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing or use voice input..."
        className={cn(
          "resize-none transition-all",
          isExpanded ? "min-h-[400px] max-h-[600px] overflow-y-auto" : "min-h-[120px] max-h-[300px] overflow-hidden"
        )}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated {new Date(note.updatedAt).toLocaleString()}</span>
        <span className="text-muted-foreground/70">{content.length} characters</span>
      </div>
    </Card>
  );
};
