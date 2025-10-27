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

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
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
