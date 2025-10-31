import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ToDoItem } from "./ToDoItem";
import { ToDo } from "@/types/todo";

interface SortableToDoItemProps {
  todo: ToDo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onConvertToTask: (todo: ToDo) => void;
  onUpdateTimeSpent: (id: string, timeSpent: number) => void;
  onToggleTimer: (id: string) => void;
}

export const SortableToDoItem = ({
  todo,
  onToggle,
  onDelete,
  onConvertToTask,
  onUpdateTimeSpent,
  onToggleTimer,
}: SortableToDoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="pl-8">
        <ToDoItem
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onConvertToTask={onConvertToTask}
          onUpdateTimeSpent={onUpdateTimeSpent}
          onToggleTimer={onToggleTimer}
        />
      </div>
    </div>
  );
};
