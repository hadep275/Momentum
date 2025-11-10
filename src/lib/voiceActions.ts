import { Task, Habit } from "@/types/task";
import { ToDo } from "@/types/todo";
import { ParsedCommand } from "./commandParser";

interface VoiceActionsContext {
  tasks: Task[];
  habits: Habit[];
  todos: ToDo[];
  setTasks: (tasks: Task[]) => void;
  setHabits: (habits: Habit[]) => void;
  setTodos: (todos: ToDo[]) => void;
  onNavigate?: (tab: string) => void;
}

// Find item by fuzzy matching title
const findByTitle = <T extends { title: string }>(items: T[], title: string): T | null => {
  const lowerTitle = title.toLowerCase().trim();
  
  // Exact match
  let found = items.find((item) => item.title.toLowerCase() === lowerTitle);
  if (found) return found;

  // Partial match
  found = items.find((item) => item.title.toLowerCase().includes(lowerTitle));
  if (found) return found;

  // Match if title includes any word from query
  const queryWords = lowerTitle.split(/\s+/);
  found = items.find((item) => {
    const itemWords = item.title.toLowerCase().split(/\s+/);
    return queryWords.some((qw) => itemWords.some((iw) => iw.includes(qw) || qw.includes(iw)));
  });

  return found || null;
};

export const executeVoiceAction = (
  command: ParsedCommand,
  context: VoiceActionsContext
): string => {
  const { action, entity, params } = command;
  const { tasks, habits, todos, setTasks, setHabits, setTodos, onNavigate } = context;

  // Task actions
  if (entity === "task") {
    if (action === "create") {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: params.title,
        description: params.description || "",
        dueDate: params.dueDate,
        dueTime: params.dueTime,
        priority: params.priority,
        categoryId: params.categoryId,
        tags: params.tags || [],
        checklists: [],
        completed: false,
        createdAt: new Date(),
      };
      setTasks([...tasks, newTask]);
      return `Task "${params.title}" created successfully for ${params.dueDate.toLocaleDateString()}.`;
    }

    if (action === "complete") {
      const task = findByTitle(tasks, params.title);
      if (!task) {
        return `I couldn't find a task matching "${params.title}". Please try again.`;
      }
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: true } : t)));
      return `Task "${task.title}" marked as complete.`;
    }

    if (action === "delete") {
      const task = findByTitle(tasks, params.title);
      if (!task) {
        return `I couldn't find a task matching "${params.title}". Please try again.`;
      }
      setTasks(tasks.filter((t) => t.id !== task.id));
      return `Task "${task.title}" deleted successfully.`;
    }

    if (action === "list") {
      const activeTasks = tasks.filter((t) => !t.completed);
      if (activeTasks.length === 0) {
        return "You have no active tasks.";
      }
      const taskList = activeTasks.slice(0, 5).map((t) => t.title).join(", ");
      return `You have ${activeTasks.length} active tasks: ${taskList}${activeTasks.length > 5 ? ", and more" : ""}.`;
    }
  }

  // Habit actions
  if (entity === "habit") {
    if (action === "create") {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        title: params.title,
        daysOfWeek: params.daysOfWeek,
        time: params.time,
        categoryId: params.categoryId,
        completions: [],
        createdAt: new Date(),
      };
      setHabits([...habits, newHabit]);
      const daysText = params.daysOfWeek.length === 7 ? "every day" : `${params.daysOfWeek.length} days a week`;
      return `Habit "${params.title}" created for ${daysText}.`;
    }

    if (action === "complete") {
      const habit = findByTitle(habits, params.title);
      if (!habit) {
        return `I couldn't find a habit matching "${params.title}". Please try again.`;
      }
      const today = new Date().toISOString().split("T")[0];
      const alreadyCompleted = habit.completions.some((c) => c.date === today);
      if (alreadyCompleted) {
        return `Habit "${habit.title}" is already completed for today.`;
      }
      setHabits(
        habits.map((h) =>
          h.id === habit.id ? { ...h, completions: [...h.completions, { date: today }] } : h
        )
      );
      return `Habit "${habit.title}" marked as complete for today.`;
    }

    if (action === "list") {
      if (habits.length === 0) {
        return "You have no habits set up.";
      }
      const habitList = habits.slice(0, 5).map((h) => h.title).join(", ");
      return `You have ${habits.length} habits: ${habitList}${habits.length > 5 ? ", and more" : ""}.`;
    }
  }

  // Todo actions
  if (entity === "todo") {
    if (action === "create") {
      const newTodo: ToDo = {
        id: crypto.randomUUID(),
        title: params.title,
        completed: false,
        createdAt: new Date(),
        timeSpent: 0,
        isTimerRunning: false,
      };
      setTodos([...todos, newTodo]);
      return `Todo "${params.title}" created successfully.`;
    }

    if (action === "complete") {
      const todo = findByTitle(todos, params.title);
      if (!todo) {
        return `I couldn't find a todo matching "${params.title}". Please try again.`;
      }
      setTodos(todos.map((t) => (t.id === todo.id ? { ...t, completed: true } : t)));
      return `Todo "${todo.title}" marked as complete.`;
    }

    if (action === "list") {
      const activeTodos = todos.filter((t) => !t.completed);
      if (activeTodos.length === 0) {
        return "You have no active todos.";
      }
      const todoList = activeTodos.slice(0, 5).map((t) => t.title).join(", ");
      return `You have ${activeTodos.length} active todos: ${todoList}${activeTodos.length > 5 ? ", and more" : ""}.`;
    }
  }

  // Timer actions
  if (entity === "timer") {
    if (action === "start") {
      const todo = findByTitle(todos, params.title);
      if (!todo) {
        return `I couldn't find a todo matching "${params.title}". Please try the todo name again.`;
      }
      setTodos(todos.map((t) => ({
        ...t,
        isTimerRunning: t.id === todo.id ? true : false,
      })));
      return `Timer started for "${todo.title}".`;
    }

    if (action === "stop") {
      const runningTodo = todos.find((t) => t.isTimerRunning);
      if (!runningTodo) {
        return "No timer is currently running.";
      }
      setTodos(todos.map((t) => (t.id === runningTodo.id ? { ...t, isTimerRunning: false } : t)));
      return `Timer stopped for "${runningTodo.title}".`;
    }
  }

  // Navigation actions
  if (action === "navigate") {
    if (entity === "analytics") {
      onNavigate?.("analytics");
      const completedTasks = tasks.filter((t) => t.completed).length;
      const totalTasks = tasks.length;
      const completedHabits = habits.reduce((acc, h) => acc + h.completions.length, 0);
      return `Opening analytics. You've completed ${completedTasks} out of ${totalTasks} tasks, and logged ${completedHabits} habit completions.`;
    }
    
    if (entity === "notes") {
      onNavigate?.("notes");
      return "Opening notes.";
    }
    
    if (entity === "calendar") {
      onNavigate?.("calendar");
      return "Opening calendar.";
    }
    
    if (entity === "tasks") {
      onNavigate?.("tasks");
      const activeTasks = tasks.filter((t) => !t.completed);
      return `Opening tasks. You have ${activeTasks.length} active tasks.`;
    }
    
    if (entity === "habits") {
      onNavigate?.("habits");
      return `Opening habits. You have ${habits.length} habits set up.`;
    }
    
    if (entity === "todos") {
      onNavigate?.("todos");
      const activeTodos = todos.filter((t) => !t.completed);
      return `Opening todos. You have ${activeTodos.length} active todos.`;
    }
  }

  // Search action
  if (entity === "search" && action === "search") {
    // The app will handle displaying search results
    onNavigate?.("tasks");
    return `Searching for "${params.query}". Check your tasks tab for results.`;
  }

  // Help action
  if (action === "help") {
    return "I can help you create tasks, habits, and todos, complete them, start timers, and navigate around. Try saying 'create a task for tomorrow', 'complete my workout habit', 'open notes', 'show calendar', or 'go to analytics'.";
  }

  // Unknown command
  return "I didn't understand that command. Try saying 'help' to see what I can do.";
};
