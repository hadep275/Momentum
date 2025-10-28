import { useEffect } from 'react';
import { Task, Habit } from '@/types/task';
import { useNotifications } from './useNotifications';
import { differenceInMinutes, format, isToday, isBefore } from 'date-fns';

export const useNotificationScheduler = (tasks: Task[], habits: Habit[]) => {
  const { permission, showNotification } = useNotifications();

  useEffect(() => {
    if (permission !== 'granted') return;

    const checkNotifications = () => {
      const now = new Date();

      // Check tasks
      tasks.forEach((task) => {
        if (task.completed || !task.reminderMinutes) return;

        // Combine date and time properly
        const dueDateTime = new Date(task.dueDate);
        if (task.dueTime) {
          const [hours, minutes] = task.dueTime.split(':').map(Number);
          dueDateTime.setHours(hours, minutes, 0, 0);
        } else {
          // No specific time, default to end of day
          dueDateTime.setHours(23, 59, 0, 0);
        }

        const minutesUntilDue = differenceInMinutes(dueDateTime, now);
        const notificationKey = `task-${task.id}-${format(dueDateTime, 'yyyy-MM-dd-HH:mm')}`;

        // Notify if we're in the reminder window (e.g., 15 minutes before)
        // and haven't notified yet
        if (
          minutesUntilDue <= task.reminderMinutes &&
          minutesUntilDue >= -5 && // Allow 5 min grace period after due time
          !sessionStorage.getItem(notificationKey)
        ) {
          showNotification(`⏰ Task Due Soon: ${task.title}`, {
            body: task.dueTime 
              ? `Due at ${task.dueTime}` 
              : `Due ${format(dueDateTime, 'MMM dd, yyyy')}`,
            tag: task.id,
          });
          sessionStorage.setItem(notificationKey, 'notified');
        }
      });

      // Check habits
      habits.forEach((habit) => {
        if (!habit.time || !habit.reminderMinutes) return;

        const today = new Date();
        const currentDayOfWeek = today.getDay();

        // Check if habit is scheduled for today
        if (!habit.daysOfWeek.includes(currentDayOfWeek)) return;

        // Check if already completed today
        const completedToday = habit.completions.some((c) => {
          const completionDate = new Date(c.date);
          return isToday(completionDate);
        });
        if (completedToday) return;

        const [hours, minutes] = habit.time.split(':').map(Number);
        const habitTime = new Date();
        habitTime.setHours(hours, minutes, 0, 0);

        const minutesUntilHabit = differenceInMinutes(habitTime, now);
        const notificationKey = `habit-${habit.id}-${format(today, 'yyyy-MM-dd')}`;

        if (
          minutesUntilHabit <= habit.reminderMinutes &&
          minutesUntilHabit >= -5 && // Allow 5 min grace period
          !sessionStorage.getItem(notificationKey)
        ) {
          showNotification(`🔔 Habit Reminder: ${habit.title}`, {
            body: `Scheduled for ${habit.time}`,
            tag: habit.id,
          });
          sessionStorage.setItem(notificationKey, 'notified');
        }
      });
    };

    // Check immediately
    checkNotifications();

    // Check every minute
    const interval = setInterval(checkNotifications, 60000);

    return () => clearInterval(interval);
  }, [tasks, habits, permission, showNotification]);
};
