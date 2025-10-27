import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TaskItem } from "@/components/TaskItem";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Task } from "@/types/task";

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get all unique tags from tasks for autocomplete
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)));

  const handleCreateTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Filter tasks by category
  const filteredTasks = selectedCategory
    ? tasks.filter((task) => task.categoryId === selectedCategory)
    : tasks;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Tasks</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 min-h-[44px]">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center border-2 border-gold bg-card">
          <p className="text-muted-foreground mb-4">
            {selectedCategory 
              ? "No tasks in this category. Create a new task!"
              : "No tasks yet. Create your first task to get started!"}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 bg-gold text-accent-foreground hover:bg-gold/90 border-2 border-copper min-h-[44px]">
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateTask={handleCreateTask}
        existingTags={allTags}
      />
    </div>
  );
};
