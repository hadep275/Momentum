import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { SortableToDoItem } from "@/components/SortableToDoItem";
import { ToDo } from "@/types/todo";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ToDoListProps {
  todos: ToDo[];
  onAddToDo: (title: string) => void;
  onToggleToDo: (id: string) => void;
  onDeleteToDo: (id: string) => void;
  onUpdateTimeSpent: (id: string, timeSpent: number) => void;
  onToggleTimer: (id: string) => void;
  onConvertToTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onUpdateToDos: (todos: ToDo[]) => void;
  existingTags?: string[];
  searchQuery?: string;
}

export const ToDoList = ({
  todos,
  onAddToDo,
  onToggleToDo,
  onDeleteToDo,
  onUpdateTimeSpent,
  onToggleTimer,
  onConvertToTask,
  onUpdateToDos,
  existingTags = [],
  searchQuery = "",
}: ToDoListProps) => {
  const [newToDoTitle, setNewToDoTitle] = useState("");
  const [todoToConvert, setTodoToConvert] = useState<ToDo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEndActive = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = activeTodos.findIndex((todo) => todo.id === over.id);

      const newActiveTodos = [...activeTodos];
      const [removed] = newActiveTodos.splice(oldIndex, 1);
      newActiveTodos.splice(newIndex, 0, removed);

      onUpdateToDos([...newActiveTodos, ...completedTodos]);
    }
  };

  const handleDragEndCompleted = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = completedTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = completedTodos.findIndex((todo) => todo.id === over.id);

      const newCompletedTodos = [...completedTodos];
      const [removed] = newCompletedTodos.splice(oldIndex, 1);
      newCompletedTodos.splice(newIndex, 0, removed);

      onUpdateToDos([...activeTodos, ...newCompletedTodos]);
    }
  };

  // Filter todos by search query
  const filteredTodos = searchQuery.trim()
    ? todos.filter((todo) => {
        const query = searchQuery.toLowerCase();
        return todo.title.toLowerCase().includes(query);
      })
    : todos;

  const activeTodos = filteredTodos.filter(todo => !todo.completed);
  const completedTodos = filteredTodos.filter(todo => todo.completed);

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndActive}
          >
            <SortableContext
              items={activeTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {activeTodos.map((todo) => (
                  <SortableToDoItem
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
            </SortableContext>
          </DndContext>
        )}

        {/* Completed To-Dos */}
        {completedTodos.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Completed ({completedTodos.length})
            </summary>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndCompleted}
            >
              <SortableContext
                items={completedTodos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 mt-2">
                  {completedTodos.map((todo) => (
                    <SortableToDoItem
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
              </SortableContext>
            </DndContext>
          </details>
        )}

        {activeTodos.length === 0 && completedTodos.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery.trim()
              ? "No to-dos found matching your search."
              : "No to-dos yet. Add one above to get started!"}
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
