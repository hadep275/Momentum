import { useState, useEffect } from "react";
import { Calendar } from "@/components/Calendar";
import { TaskList } from "@/components/TaskList";
import { Analytics } from "@/components/Analytics";
import { AppSettings } from "@/components/AppSettings";
import { InstallPWA } from "@/components/InstallPWA";
import { SplashScreen } from "@/components/SplashScreen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListTodo, CalendarDays, BarChart3, Settings } from "lucide-react";
import { Task, Habit } from "@/types/task";
import { ToDo } from "@/types/todo";
import { ToDoList } from "@/components/ToDoList";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";
import { toast } from "sonner";
import momentumLogo from "@/assets/momentum-logo.png";

const TASKS_STORAGE_KEY = "momentum-tasks";
const HABITS_STORAGE_KEY = "momentum-habits";
const TODOS_STORAGE_KEY = "momentum-todos";
const SETTINGS_STORAGE_KEY = "momentum-settings";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first visit or after 1 hour
    const lastSplash = localStorage.getItem("momentum-last-splash");
    if (!lastSplash) return true;
    const oneHour = 60 * 60 * 1000;
    return Date.now() - parseInt(lastSplash) > oneHour;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (showSplash) {
      localStorage.setItem("momentum-last-splash", Date.now().toString());
      setTimeout(() => setShowSplash(false), 2000);
    }
  }, [showSplash]);
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

  const [hideCompletedTasks, setHideCompletedTasks] = useState(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        return settings.hideCompletedTasks || false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("momentum-theme");
    return stored || "default";
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

  const [todos, setTodos] = useState<ToDo[]>(() => {
    // Load todos from localStorage on initial render
    const stored = localStorage.getItem(TODOS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
      } catch (e) {
        console.error("Failed to parse stored todos:", e);
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

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ hideCompletedHabits, hideCompletedTasks })
    );
  }, [hideCompletedHabits, hideCompletedTasks]);

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("momentum-theme", newTheme);
    
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    
    if (newTheme === "light") {
      root.classList.add("theme-light");
    } else if (newTheme === "dark") {
      root.classList.add("theme-dark");
    }
  };

  // Initialize notification scheduler
  useNotificationScheduler(tasks, habits);

  const handleAddToDo = (title: string) => {
    const newToDo: ToDo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date(),
      timeSpent: 0,
      isTimerRunning: false,
    };
    setTodos([...todos, newToDo]);
    toast.success("To-do added!");
  };

  const handleToggleToDo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteToDo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast.success("To-do deleted");
  };

  const handleUpdateToDoTimeSpent = (id: string, timeSpent: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, timeSpent } : todo
    ));
  };

  const handleToggleToDoTimer = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, isTimerRunning: !todo.isTimerRunning };
      }
      // Stop other timers
      return { ...todo, isTimerRunning: false };
    }));
  };

  const handleConvertToDoToTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
  };

  const handleResetData = () => {
    // Clear localStorage
    localStorage.removeItem(TASKS_STORAGE_KEY);
    localStorage.removeItem(HABITS_STORAGE_KEY);
    localStorage.removeItem(TODOS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    
    // Reset state
    setTasks([]);
    setHabits([]);
    setTodos([]);
    setHideCompletedHabits(false);
    setHideCompletedTasks(false);
    
    // Close settings dialog
    setIsSettingsOpen(false);
    
    // Show confirmation
    toast.success("All data cleared successfully", {
      description: "Your app has been reset to a fresh start",
    });
  };

  return (
    <>
      {showSplash && <SplashScreen />}
      <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 border-b-2 border-gold pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={momentumLogo} 
                alt="Momentum Logo" 
                className="h-16 w-16 object-contain"
              />
              <div>
                <h1 className="text-5xl font-bold text-gold drop-shadow-lg">
                  Momentum
                </h1>
                <p className="text-foreground mt-2 text-lg">Your best self, one day at a time</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="text-muted-foreground hover:bg-foreground hover:text-background"
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
              hideCompletedTasks={hideCompletedTasks}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
            
            <ToDoList
              todos={todos}
              onAddToDo={handleAddToDo}
              onToggleToDo={handleToggleToDo}
              onDeleteToDo={handleDeleteToDo}
              onUpdateTimeSpent={handleUpdateToDoTimeSpent}
              onToggleTimer={handleToggleToDoTimer}
              onConvertToTask={handleConvertToDoToTask}
              onUpdateToDos={setTodos}
              existingTags={tasks.flatMap((task) => task.tags)}
              searchQuery={searchQuery}
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
          hideCompletedTasks={hideCompletedTasks}
          onHideCompletedTasksChange={setHideCompletedTasks}
          theme={theme}
          onThemeChange={handleThemeChange}
          onResetData={handleResetData}
        />

        <InstallPWA />
      </div>
    </div>
    </>
  );
};

export default Index;
