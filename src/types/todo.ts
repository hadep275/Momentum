export interface ToDo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  timeSpent?: number; // in seconds
  isTimerRunning?: boolean;
}
