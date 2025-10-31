import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { ToDoItem } from "@/components/ToDoItem";
import { ToDo } from "@/types/todo";
import { Task, TaskPriority } from "@/types/task";
import { toast } from "sonner";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

interface ToDoListProps {
  todos: ToDo[];
  onAddToDo: (title: string) => void;
  onToggleToDo: (id: string) => void;
  onDeleteToDo: (id: string) => void;
  onUpdateTimeSpent: (id: string, timeSpent: number) => void;
  onToggleTimer: (id: string) => void;
  onConvertToTask: (task: Omit<Task, "id" | "createdAt">) => void;
  existingTags?: string[];
}

export const ToDoList = ({
  todos,
  onAddToDo,
  onToggleToDo,
  onDeleteToDo,
  onUpdateTimeSpent,
  onToggleTimer,
  onConvertToTask,
  existingTags = [],
}: ToDoListProps) => {
  const [newToDoTitle, setNewToDoTitle] = useState("");
  const [todoToConvert, setTodoToConvert] = useState<ToDo | null>(null);

  const handleAddToDo = () => {
    if (newToDoTitle.trim()) {
      onAddToDo(newToDoTitle.trim());
      setNewToDoTitle("");
    }
  };

  const handleConvertToTask = (todo: ToDo) => {
    setTodoToConvert(todo);
  };

  const handleCreateTaskFromToDo = (task: Omit<Task, "id" | "createdAt">) => {
    onConvertToTask(task);
    if (todoToConvert) {
      onDeleteToDo(todoToConvert.id);
    }
    setTodoToConvert(null);
    toast.success("Converted to scheduled task!");
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">To-Dos</h2>
          <span className="text-sm text-muted-foreground">
            ({activeTodos.length} active)
          </span>
        </div>
      </div>
      
      <Card className="p-6 space-y-4">

        {/* Quick Add */}
        <div className="flex gap-2">
          <Input
            value={newToDoTitle}
            onChange={(e) => setNewToDoTitle(e.target.value)}
            placeholder="Add a to-do..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddToDo();
              }
            }}
          />
          <Button onClick={handleAddToDo} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Active To-Dos */}
        {activeTodos.length > 0 && (
          <div className="space-y-2">
            {activeTodos.map((todo) => (
              <ToDoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggleToDo}
                onDelete={onDeleteToDo}
                onConvertToTask={handleConvertToTask}
                onUpdateTimeSpent={onUpdateTimeSpent}
                onToggleTimer={onToggleTimer}
              />
            ))}
          </div>
        )}

        {/* Completed To-Dos */}
        {completedTodos.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Completed ({completedTodos.length})
            </summary>
            <div className="space-y-2 mt-2">
              {completedTodos.map((todo) => (
                <ToDoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggleToDo}
                  onDelete={onDeleteToDo}
                  onConvertToTask={handleConvertToTask}
                  onUpdateTimeSpent={onUpdateTimeSpent}
                  onToggleTimer={onToggleTimer}
                />
              ))}
            </div>
          </details>
        )}

        {activeTodos.length === 0 && completedTodos.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No to-dos yet. Add one above to get started!
          </p>
        )}
      </Card>

      {todoToConvert && (
        <CreateTaskDialog
          open={!!todoToConvert}
          onOpenChange={(open) => !open && setTodoToConvert(null)}
          onCreateTask={handleCreateTaskFromToDo}
          existingTags={existingTags}
          initialTitle={todoToConvert.title}
        />
      )}
    </>
  );
};
