import { useState, useEffect } from "react";
import { Calendar } from "@/components/Calendar";
import { TaskList } from "@/components/TaskList";
import { Analytics } from "@/components/Analytics";
import { AppSettings } from "@/components/AppSettings";
import { InstallPWA } from "@/components/InstallPWA";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListTodo, CalendarDays, BarChart3, Settings } from "lucide-react";
import { Task, Habit } from "@/types/task";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";

const TASKS_STORAGE_KEY = "momentum-tasks";
const HABITS_STORAGE_KEY = "momentum-habits";
const SETTINGS_STORAGE_KEY = "momentum-settings";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hideCompletedHabits, setHideCompletedHabits] = useState(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        return settings.hideCompletedHabits || false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage on initial render
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((task: any) => ({
          ...task,
          priority: task.priority || "medium", // Default to medium if missing
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(), // Default to today if missing
        }));
      } catch (e) {
        console.error("Failed to parse stored tasks:", e);
        return [];
      }
    }
    return [];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    // Load habits from localStorage on initial render
    const stored = localStorage.getItem(HABITS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((habit: any) => ({
          ...habit,
          createdAt: new Date(habit.createdAt),
        }));
      } catch (e) {
        console.error("Failed to parse stored habits:", e);
        return [];
      }
    }
    return [];
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ hideCompletedHabits })
    );
  }, [hideCompletedHabits]);

  // Initialize notification scheduler
  useNotificationScheduler(tasks, habits);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 border-b-2 border-gold pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gold drop-shadow-lg">
                Momentum
              </h1>
              <p className="text-foreground mt-2 text-lg">Build your best self, one day at a time</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="text-muted-foreground hover:text-gold"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsContent value="tasks" className="space-y-4">
            <TaskList 
              tasks={tasks} 
              onUpdateTasks={setTasks}
              habits={habits}
              onUpdateHabits={setHabits}
              hideCompletedHabits={hideCompletedHabits}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Calendar 
              tasks={tasks} 
              habits={habits} 
              onUpdateTasks={setTasks}
              onUpdateHabits={setHabits}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Analytics tasks={tasks} habits={habits} />
          </TabsContent>

          {/* Fixed Bottom Navigation */}
          <TabsList className="fixed bottom-0 left-0 right-0 grid grid-cols-3 h-16 rounded-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <TabsTrigger value="tasks" className="h-full">
              <ListTodo className="h-6 w-6" />
            </TabsTrigger>
            <TabsTrigger value="calendar" className="h-full">
              <CalendarDays className="h-6 w-6" />
            </TabsTrigger>
            <TabsTrigger value="analytics" className="h-full">
              <BarChart3 className="h-6 w-6" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <AppSettings
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          hideCompletedHabits={hideCompletedHabits}
          onHideCompletedHabitsChange={setHideCompletedHabits}
        />

        <InstallPWA />
      </div>
    </div>
  );
};

export default Index;
