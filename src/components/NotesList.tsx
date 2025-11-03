import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { NoteItem } from "@/components/NoteItem";
import { Note } from "@/types/note";
import { Plus } from "lucide-react";

interface NotesListProps {
  notes: Note[];
  onAddNote: () => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesList = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: NotesListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by updated date
    return filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery]);

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes..."
          />
        </div>
        <Button onClick={onAddNote} size="icon">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {filteredAndSortedNotes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? (
            <>No notes found matching "{searchQuery}"</>
          ) : (
            <>No notes yet. Create your first note!</>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={onUpdateNote}
              onDelete={onDeleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};
