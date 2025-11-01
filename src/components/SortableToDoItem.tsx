import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <ToDoItem
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        onConvertToTask={onConvertToTask}
        onUpdateTimeSpent={onUpdateTimeSpent}
        onToggleTimer={onToggleTimer}
      />
    </div>
  );
};
