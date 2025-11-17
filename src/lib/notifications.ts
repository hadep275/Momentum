import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Task, Habit } from '@/types/task';
import { format, subMinutes } from 'date-fns';

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a notification for a task
 */
export const scheduleTaskNotification = async (task: Task): Promise<void> => {
  if (!task.reminderMinutes || task.completed) return;

  try {
    // Combine date and time
    let dueDateTime = new Date(task.dueDate);
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      dueDateTime.setHours(hours, minutes, 0, 0);
    }

    // Calculate reminder time
    const reminderTime = subMinutes(dueDateTime, task.reminderMinutes);

    // Don't schedule if reminder time is in the past
    if (reminderTime <= new Date()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: '⏰ Task Reminder',
          body: `"${task.title}" is due ${task.dueTime ? `at ${task.dueTime}` : 'today'}`,
          id: parseInt(task.id.replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000),
          schedule: { at: reminderTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: {
            taskId: task.id,
            type: 'task'
          }
        }
      ]
    });
  } catch (error) {
    console.error('Failed to schedule task notification:', error);
  }
};

/**
 * Schedule a notification for a habit
 */
export const scheduleHabitNotification = async (habit: Habit): Promise<void> => {
  if (!habit.reminderMinutes || !habit.time) return;

  try {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Check if habit is scheduled for today
    if (!habit.daysOfWeek.includes(dayOfWeek)) return;

    // Parse habit time
    const [hours, minutes] = habit.time.split(':').map(Number);
    const habitTime = new Date();
    habitTime.setHours(hours, minutes, 0, 0);

    // Calculate reminder time
    const reminderTime = subMinutes(habitTime, habit.reminderMinutes);

    // Don't schedule if reminder time is in the past
    if (reminderTime <= new Date()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🎯 Habit Reminder',
          body: `Time for "${habit.title}"`,
          id: parseInt(habit.id.replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000),
          schedule: { at: reminderTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: {
            habitId: habit.id,
            type: 'habit'
          }
        }
      ]
    });
  } catch (error) {
    console.error('Failed to schedule habit notification:', error);
  }
};

/**
 * Cancel a notification by task/habit ID
 */
export const cancelNotification = async (id: string): Promise<void> => {
  try {
    const notificationId = parseInt(id.replace(/\D/g, '').slice(0, 9)) || 0;
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await LocalNotifications.cancel({ notifications: [] });
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

/**
 * Reschedule all task and habit notifications
 */
export const rescheduleAllNotifications = async (tasks: Task[], habits: Habit[]): Promise<void> => {
  try {
    // Cancel all existing notifications
    await cancelAllNotifications();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Schedule task notifications
    for (const task of tasks) {
      if (!task.completed && task.reminderMinutes) {
        await scheduleTaskNotification(task);
      }
    }

    // Schedule habit notifications
    for (const habit of habits) {
      if (habit.reminderMinutes) {
        await scheduleHabitNotification(habit);
      }
    }
  } catch (error) {
    console.error('Failed to reschedule notifications:', error);
  }
};

