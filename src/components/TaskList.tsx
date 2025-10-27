import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TaskItem } from "@/components/TaskItem";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export const TaskList = ({ tasks, onUpdateTasks }: TaskListProps) => {
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
    onUpdateTasks([...tasks, newTask]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    onUpdateTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Filter tasks by category
  const filteredTasks = selectedCategory
    ? tasks.filter((task) => task.categoryId === selectedCategory)
    : tasks;

  // Smart sorting: time first, then priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First, sort by date and time if both tasks have dates
    if (a.dueDate && b.dueDate) {
      const dateCompare = a.dueDate.getTime() - b.dueDate.getTime();
      
      // If dates are the same, compare times if available
      if (dateCompare === 0) {
        if (a.dueTime && b.dueTime) {
          return a.dueTime.localeCompare(b.dueTime);
        }
        // If one has time and other doesn't, prioritize the one with time
        if (a.dueTime && !b.dueTime) return -1;
        if (!a.dueTime && b.dueTime) return 1;
      }
      
      // If dates are different, return date comparison
      if (dateCompare !== 0) return dateCompare;
    }
    
    // If only one has a date, it comes first
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // If neither has a date OR dates/times are equal, sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

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
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              existingTags={allTags}
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
