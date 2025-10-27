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

        const dueDate = new Date(task.dueDate);
        
        // If task has a specific time, use it
        if (task.dueTime) {
          const [hours, minutes] = task.dueTime.split(':').map(Number);
          dueDate.setHours(hours, minutes, 0, 0);
        }

        const minutesUntilDue = differenceInMinutes(dueDate, now);
        const notificationKey = `task-${task.id}-${format(dueDate, 'yyyy-MM-dd-HH:mm')}`;

        // Check if we should notify (within reminder window and not already notified)
        if (
          minutesUntilDue <= task.reminderMinutes &&
          minutesUntilDue > 0 &&
          !sessionStorage.getItem(notificationKey)
        ) {
          showNotification(`⏰ Task Due Soon: ${task.title}`, {
            body: task.dueTime 
              ? `Due at ${task.dueTime}` 
              : `Due ${format(dueDate, 'MMM dd, yyyy')}`,
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
          minutesUntilHabit > 0 &&
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
