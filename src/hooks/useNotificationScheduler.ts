import { useEffect } from 'react';
import { Task, Habit } from '@/types/task';
import { useNotifications } from './useNotifications';
import { differenceInMinutes, format, isToday } from 'date-fns';
import { 
  saveNotificationSchedules, 
  clearOldNotifications, 
  notifyServiceWorker,
  NotificationSchedule 
} from '@/lib/notificationDB';

export const useNotificationScheduler = (tasks: Task[], habits: Habit[]) => {
  const { permission, showNotification } = useNotifications();

  useEffect(() => {
    if (permission !== 'granted') return;

    const syncToServiceWorker = async () => {
      const now = new Date();
      const schedules: NotificationSchedule[] = [];

      // Process tasks
      tasks.forEach((task) => {
        if (task.completed || !task.reminderMinutes) return;

        const dueDateTime = new Date(task.dueDate);
        if (task.dueTime) {
          const [hours, minutes] = task.dueTime.split(':').map(Number);
          dueDateTime.setHours(hours, minutes, 0, 0);
        } else {
          dueDateTime.setHours(23, 59, 0, 0);
        }

        // Calculate trigger time (reminder minutes before due)
        const triggerTime = new Date(dueDateTime.getTime() - (task.reminderMinutes * 60 * 1000));
        
        // Only schedule future notifications
        if (triggerTime > now) {
          schedules.push({
            id: `task-${task.id}-${format(dueDateTime, 'yyyy-MM-dd-HH:mm')}`,
            title: `⏰ Task Due Soon: ${task.title}`,
            body: task.dueTime 
              ? `Due at ${task.dueTime}` 
              : `Due ${format(dueDateTime, 'MMM dd, yyyy')}`,
            triggerTime: triggerTime.getTime(),
            notified: false,
            type: 'task'
          });
        }
      });

      // Process habits
      habits.forEach((habit) => {
        if (!habit.time || !habit.reminderMinutes) return;

        const today = new Date();
        const currentDayOfWeek = today.getDay();

        if (!habit.daysOfWeek.includes(currentDayOfWeek)) return;

        const completedToday = habit.completions.some((c) => {
          const completionDate = new Date(c.date);
          return isToday(completionDate);
        });
        if (completedToday) return;

        const [hours, minutes] = habit.time.split(':').map(Number);
        const habitTime = new Date();
        habitTime.setHours(hours, minutes, 0, 0);

        const triggerTime = new Date(habitTime.getTime() - (habit.reminderMinutes * 60 * 1000));

        if (triggerTime > now) {
          schedules.push({
            id: `habit-${habit.id}-${format(today, 'yyyy-MM-dd')}`,
            title: `🔔 Habit Reminder: ${habit.title}`,
            body: `Scheduled for ${habit.time}`,
            triggerTime: triggerTime.getTime(),
            notified: false,
            type: 'habit'
          });
        }
      });

      // Save to IndexedDB
      await saveNotificationSchedules(schedules);
      
      // Clean up old notifications
      await clearOldNotifications();
      
      // Tell service worker to check
      notifyServiceWorker();
    };

    // Sync immediately
    syncToServiceWorker();

    // Sync every 5 minutes to keep schedules updated
    const interval = setInterval(syncToServiceWorker, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, habits, permission]);
};
