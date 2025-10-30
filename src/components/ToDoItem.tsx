import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Timer, ArrowRight, Trash2 } from "lucide-react";
import { ToDo } from "@/types/todo";
import { cn } from "@/lib/utils";

interface ToDoItemProps {
  todo: ToDo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onConvertToTask: (todo: ToDo) => void;
  onUpdateTimeSpent: (id: string, timeSpent: number) => void;
  onToggleTimer: (id: string) => void;
}

export const ToDoItem = ({
  todo,
  onToggle,
  onDelete,
  onConvertToTask,
  onUpdateTimeSpent,
  onToggleTimer,
}: ToDoItemProps) => {
  const [localTimeSpent, setLocalTimeSpent] = useState(todo.timeSpent || 0);

  useEffect(() => {
    if (!todo.isTimerRunning) return;

    const interval = setInterval(() => {
      setLocalTimeSpent((prev) => {
        const newTime = prev + 1;
        onUpdateTimeSpent(todo.id, newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [todo.isTimerRunning, todo.id, onUpdateTimeSpent]);

  useEffect(() => {
    setLocalTimeSpent(todo.timeSpent || 0);
  }, [todo.timeSpent]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border transition-colors hover:border-gold",
        todo.completed && "opacity-60"
      )}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "break-words",
          todo.completed && "line-through text-muted-foreground"
        )}>
          {todo.title}
        </p>
        {localTimeSpent > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Time spent: {formatTime(localTimeSpent)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            todo.isTimerRunning && "text-gold"
          )}
          onClick={() => onToggleTimer(todo.id)}
        >
          <Timer className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onConvertToTask(todo)}
          title="Convert to Task"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:text-destructive"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
