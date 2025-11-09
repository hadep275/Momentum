import { Task, Habit } from "@/types/task";
import { format } from "date-fns";

// Generate .ics file content for a task
export const generateTaskICS = (task: Task): string => {
  const start = new Date(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':');
    start.setHours(parseInt(hours), parseInt(minutes));
  }
  
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Momentum App//Task//EN
BEGIN:VEVENT
UID:${task.id}@momentum-app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${task.title}
DESCRIPTION:${task.description || ''}
PRIORITY:${task.priority === 'high' ? '1' : task.priority === 'medium' ? '5' : '9'}
STATUS:${task.completed ? 'COMPLETED' : 'NEEDS-ACTION'}
END:VEVENT
END:VCALENDAR`;
};

// Generate .ics file content for a habit
export const generateHabitICS = (habit: Habit): string => {
  const today = new Date();
  const start = new Date(today);
  
  if (habit.time) {
    const [hours, minutes] = habit.time.split(':');
    start.setHours(parseInt(hours), parseInt(minutes));
  } else {
    start.setHours(9, 0); // Default to 9 AM
  }
  
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min duration
  
  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };
  
  // Convert days to RRULE format (MO,TU,WE,TH,FR,SA,SU)
  const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const byDay = habit.daysOfWeek.map(d => dayNames[d]).join(',');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Momentum App//Habit//EN
BEGIN:VEVENT
UID:${habit.id}@momentum-app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${habit.title}
RRULE:FREQ=WEEKLY;BYDAY=${byDay}
END:VEVENT
END:VCALENDAR`;
};

// Generate .ics file for all tasks and habits
export const generateFullCalendarICS = (tasks: Task[], habits: Habit[]): string => {
  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };
  
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Momentum App//Full Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Momentum Calendar
X-WR-TIMEZONE:UTC
`;

  // Add all tasks
  tasks.forEach(task => {
    const start = new Date(task.dueDate);
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':');
      start.setHours(parseInt(hours), parseInt(minutes));
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    icsContent += `BEGIN:VEVENT
UID:${task.id}@momentum-app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${task.title}
DESCRIPTION:${task.description || ''}
PRIORITY:${task.priority === 'high' ? '1' : task.priority === 'medium' ? '5' : '9'}
STATUS:${task.completed ? 'COMPLETED' : 'NEEDS-ACTION'}
END:VEVENT
`;
  });
  
  // Add all habits
  habits.forEach(habit => {
    const today = new Date();
    const start = new Date(today);
    
    if (habit.time) {
      const [hours, minutes] = habit.time.split(':');
      start.setHours(parseInt(hours), parseInt(minutes));
    } else {
      start.setHours(9, 0);
    }
    
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const byDay = habit.daysOfWeek.map(d => dayNames[d]).join(',');
    
    icsContent += `BEGIN:VEVENT
UID:${habit.id}@momentum-app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${habit.title}
RRULE:FREQ=WEEKLY;BYDAY=${byDay}
END:VEVENT
`;
  });
  
  icsContent += 'END:VCALENDAR';
  return icsContent;
};

// Download .ics file
export const downloadICS = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Share via Web Share API
export const shareCalendarEvent = async (content: string, title: string) => {
  if (navigator.share) {
    const blob = new Blob([content], { type: 'text/calendar' });
    const file = new File([blob], `${title}.ics`, { type: 'text/calendar' });
    
    try {
      await navigator.share({
        files: [file],
        title: title,
        text: `Check out this event from Momentum: ${title}`,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }
  return false;
};

// Generate Google Calendar URL
export const generateGoogleCalendarURL = (task: Task): string => {
  const start = new Date(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':');
    start.setHours(parseInt(hours), parseInt(minutes));
  }
  
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  
  const formatGoogleDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.title,
    details: task.description || '',
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Generate Apple Calendar URL (uses webcal protocol with .ics)
export const generateAppleCalendarURL = (content: string): string => {
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  return url.replace('blob:', 'webcal://');
};