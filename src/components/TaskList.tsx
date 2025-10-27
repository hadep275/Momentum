import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, CheckSquare, ListTodo } from "lucide-react";
import { TaskItem } from "@/components/TaskItem";
import { HabitItem } from "@/components/HabitItem";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { EditHabitDialog } from "@/components/EditHabitDialog";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Task, Habit } from "@/types/task";
import { isSameDay, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskListProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
  hideCompletedHabits: boolean;
}

export const TaskList = ({ tasks, onUpdateTasks, habits, onUpdateHabits, hideCompletedHabits }: TaskListProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateHabitDialogOpen, setIsCreateHabitDialogOpen] = useState(false);
  const [isNewItemSheetOpen, setIsNewItemSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

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

  const handleCreateHabit = (habit: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    onUpdateHabits([...habits, newHabit]);
    setIsCreateHabitDialogOpen(false);
    setIsNewItemSheetOpen(false);
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    onUpdateHabits(habits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)));
  };

  const handleDeleteHabit = (habitId: string) => {
    onUpdateHabits(habits.filter((h) => h.id !== habitId));
  };

  const handleToggleHabitComplete = (habitId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCompletedToday = habit.completions.some((c) => c.date === today);

    const updatedHabit: Habit = {
      ...habit,
      completions: isCompletedToday
        ? habit.completions.filter((c) => c.date !== today)
        : [...habit.completions, { date: today }],
    };

    onUpdateHabits(habits.map((h) => (h.id === habitId ? updatedHabit : h)));
  };

  const openNewTaskDialog = () => {
    setIsNewItemSheetOpen(false);
    setIsCreateDialogOpen(true);
  };

  const openNewHabitDialog = () => {
    setIsNewItemSheetOpen(false);
    setIsCreateHabitDialogOpen(true);
  };

  // Filter tasks: only show today's tasks
  const today = new Date();
  const todaysTasks = tasks.filter((task) => 
    task.dueDate && isSameDay(task.dueDate, today)
  );

  // Filter habits: only show habits for today's day of week
  const todayDayOfWeek = today.getDay();
  const todaysHabits = habits.filter((habit) =>
    habit.daysOfWeek.includes(todayDayOfWeek)
  );

  const todayFormatted = format(today, "yyyy-MM-dd");
  const habitsWithCompletion = todaysHabits.map((habit) => ({
    habit,
    isCompletedToday: habit.completions.some((c) => c.date === todayFormatted),
  }));

  // Filter habits by category
  const filteredHabits = selectedCategory
    ? habitsWithCompletion.filter((h) => h.habit.categoryId === selectedCategory)
    : habitsWithCompletion;

  // Filter out completed habits if the setting is enabled
  const visibleHabits = hideCompletedHabits
    ? filteredHabits.filter((h) => !h.isCompletedToday)
    : filteredHabits;

  // Filter by category
  const filteredTasks = selectedCategory
    ? todaysTasks.filter((task) => task.categoryId === selectedCategory)
    : todaysTasks;

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
        <div>
          <h2 className="text-2xl font-semibold">Today's Focus</h2>
          <p className="text-sm text-muted-foreground">Tasks and habits for today</p>
        </div>
        <Button 
          onClick={() => setIsNewItemSheetOpen(true)} 
          size="icon"
          className="h-12 w-12 rounded-full min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div>
        <h3 className="text-lg font-semibold mb-3">Tasks</h3>
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center border-2 border-dashed bg-card">
            <p className="text-muted-foreground text-sm">
              {selectedCategory 
                ? "No tasks in this category for today."
                : todaysTasks.length === 0 
                  ? "No tasks scheduled for today."
                  : "No tasks in this category for today."}
            </p>
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
      </div>

      {/* Daily Habits Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Daily Habits</h3>
        {visibleHabits.length === 0 ? (
          <Card className="p-8 text-center border-2 border-dashed bg-card">
            <p className="text-muted-foreground text-sm">
              {selectedCategory 
                ? "No habits in this category for today."
                : todaysHabits.length === 0 
                  ? "No habits scheduled for today."
                  : "No habits to show."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {visibleHabits.map(({ habit, isCompletedToday }) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompletedToday={isCompletedToday}
                onToggleComplete={handleToggleHabitComplete}
                onEdit={setEditingHabit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Item Dialog */}
      <Dialog open={isNewItemSheetOpen} onOpenChange={setIsNewItemSheetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Card 
              className="p-6 cursor-pointer hover:border-gold transition-all hover:shadow-lg"
              onClick={openNewTaskDialog}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <ListTodo className="w-8 h-8 text-gold" />
                <div>
                  <h4 className="font-semibold">Task</h4>
                  <p className="text-xs text-muted-foreground">One-time or scheduled</p>
                </div>
              </div>
            </Card>
            <Card 
              className="p-6 cursor-pointer hover:border-gold transition-all hover:shadow-lg"
              onClick={openNewHabitDialog}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <CheckSquare className="w-8 h-8 text-gold" />
                <div>
                  <h4 className="font-semibold">Habit</h4>
                  <p className="text-xs text-muted-foreground">Recurring routine</p>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateTask={handleCreateTask}
        existingTags={allTags}
      />

      <CreateHabitDialog
        open={isCreateHabitDialogOpen}
        onOpenChange={setIsCreateHabitDialogOpen}
        onCreateHabit={handleCreateHabit}
      />

      <EditHabitDialog
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
        habit={editingHabit}
        onUpdateHabit={handleUpdateHabit}
      />
    </div>
  );
};
