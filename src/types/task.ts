export type TaskCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export const TASK_CATEGORIES: TaskCategory[] = [
  { id: "focus", name: "Focus", color: "gold", icon: "Target" },
  { id: "work", name: "Work", color: "copper", icon: "Briefcase" },
  { id: "personal", name: "Personal", color: "rose-pink", icon: "Heart" },
  { id: "health", name: "Health", color: "accent", icon: "Activity" },
  { id: "learning", name: "Learning", color: "secondary", icon: "BookOpen" },
];

export const PRESET_TAGS = [
  "urgent",
  "important",
  "quick-win",
  "long-term",
  "review",
  "waiting-on-others",
  "planning",
  "routine",
] as const;

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date; // Now required
  dueTime?: string; // HH:mm format
  priority: TaskPriority;
  categoryId?: string;
  tags: string[];
  recurrence?: {
    type: "daily" | "weekly" | "monthly" | "custom";
    interval?: number;
    dayOfWeek?: number;
    weekOfMonth?: number;
  };
  checklists: {
    id: string;
    title: string;
    completed: boolean;
    timeSpent: number; // in seconds
  }[];
  completed: boolean;
  createdAt: Date;
}
