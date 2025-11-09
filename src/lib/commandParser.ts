export interface ParsedCommand {
  action: string;
  entity: "task" | "habit" | "todo" | "template" | "timer" | "analytics" | "search" | "unknown";
  params: Record<string, any>;
}

// Date parsing helpers
const parseRelativeDate = (text: string): Date | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  if (/today/i.test(text)) return today;
  if (/tomorrow/i.test(text)) return tomorrow;
  if (/next week/i.test(text)) return nextWeek;

  // Parse "in X days"
  const daysMatch = text.match(/in (\d+) days?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  }

  // Parse specific dates like "on Monday", "on Friday"
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < dayNames.length; i++) {
    if (new RegExp(`on ${dayNames[i]}`, "i").test(text)) {
      const targetDay = i;
      const currentDay = today.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      const date = new Date(today);
      date.setDate(date.getDate() + daysUntil);
      return date;
    }
  }

  return null;
};

const parseTime = (text: string): string | null => {
  // Parse time formats like "at 3pm", "at 15:00", "at 3:30pm"
  const timeMatch = text.match(/at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const meridiem = timeMatch[3]?.toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  return null;
};

const parsePriority = (text: string): "high" | "medium" | "low" => {
  if (/high priority|urgent|important/i.test(text)) return "high";
  if (/low priority|minor|small/i.test(text)) return "low";
  return "medium";
};

const parseCategory = (text: string): string | undefined => {
  if (/work|job|office/i.test(text)) return "work";
  if (/personal|home/i.test(text)) return "personal";
  if (/health|fitness|exercise/i.test(text)) return "health";
  if (/learning|study|education/i.test(text)) return "learning";
  if (/focus|concentrate/i.test(text)) return "focus";
  return undefined;
};

const parseDaysOfWeek = (text: string): number[] => {
  const days: number[] = [];
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  if (/every day|daily/i.test(text)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (/weekdays?/i.test(text)) {
    return [1, 2, 3, 4, 5];
  }

  if (/weekends?/i.test(text)) {
    return [0, 6];
  }

  Object.entries(dayMap).forEach(([day, num]) => {
    if (new RegExp(day, "i").test(text)) {
      days.push(num);
    }
  });

  return days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6];
};

// Main command parser
export const parseCommand = (input: string): ParsedCommand => {
  const lowerInput = input.toLowerCase().trim();

  // Task commands
  if (/create|add|make|new.*task/i.test(lowerInput)) {
    const titleMatch = input.match(/(?:task|add|create|make|new)\s+(.+?)(?:\s+(?:for|due|on|by|at|with|priority|category|tag)|\s*$)/i);
    const title = titleMatch ? titleMatch[1].trim() : "New Task";

    return {
      action: "create",
      entity: "task",
      params: {
        title,
        dueDate: parseRelativeDate(input) || new Date(),
        dueTime: parseTime(input),
        priority: parsePriority(input),
        categoryId: parseCategory(input),
        description: "",
        tags: [],
      },
    };
  }

  if (/complete|finish|done|check off.*task/i.test(lowerInput)) {
    const titleMatch = input.match(/(?:complete|finish|done|check off)\s+(?:task\s+)?(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    return {
      action: "complete",
      entity: "task",
      params: { title },
    };
  }

  if (/delete|remove.*task/i.test(lowerInput)) {
    const titleMatch = input.match(/(?:delete|remove)\s+(?:task\s+)?(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    return {
      action: "delete",
      entity: "task",
      params: { title },
    };
  }

  // Habit commands
  if (/create|add|make|new.*habit/i.test(lowerInput)) {
    const titleMatch = input.match(/(?:habit|add|create|make|new)\s+(.+?)(?:\s+(?:on|for|at|every|category)|\s*$)/i);
    const title = titleMatch ? titleMatch[1].trim() : "New Habit";

    return {
      action: "create",
      entity: "habit",
      params: {
        title,
        daysOfWeek: parseDaysOfWeek(input),
        time: parseTime(input),
        categoryId: parseCategory(input),
      },
    };
  }

  if (/complete|done|check.*habit/i.test(lowerInput)) {
    const titleMatch = input.match(/(?:complete|done|check)\s+(?:habit\s+)?(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    return {
      action: "complete",
      entity: "habit",
      params: { title },
    };
  }

  // Todo commands
  if (/create|add|make|new.*(?:todo|to-do|to do)/i.test(lowerInput)) {
    const titleMatch = input.match(/(?:todo|to-do|to do|add|create|make|new)\s+(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "New Todo";

    return {
      action: "create",
      entity: "todo",
      params: { title },
    };
  }

  if (/complete|done|check.*(?:todo|to-do|to do)/i.test(lowerInput)) {
    const titleMatch = input.match(/(?:complete|done|check)\s+(?:todo|to-do|to do)?\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    return {
      action: "complete",
      entity: "todo",
      params: { title },
    };
  }

  // Template commands
  if (/apply|use.*template/i.test(lowerInput)) {
    const templateMatch = input.match(/(?:apply|use)\s+(?:template\s+)?(.+)/i);
    const templateName = templateMatch ? templateMatch[1].trim() : "";

    return {
      action: "apply",
      entity: "template",
      params: { templateName },
    };
  }

  // Timer commands
  if (/start.*timer/i.test(lowerInput)) {
    const titleMatch = input.match(/start\s+timer\s+(?:for\s+)?(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    return {
      action: "start",
      entity: "timer",
      params: { title },
    };
  }

  if (/stop.*timer/i.test(lowerInput)) {
    return {
      action: "stop",
      entity: "timer",
      params: {},
    };
  }

  // Analytics commands
  if (/show|display|view.*(?:analytics|stats|statistics|progress)/i.test(lowerInput)) {
    return {
      action: "show",
      entity: "analytics",
      params: {},
    };
  }

  // Search commands
  if (/search|find|look for/i.test(lowerInput)) {
    const queryMatch = input.match(/(?:search|find|look for)\s+(.+)/i);
    const query = queryMatch ? queryMatch[1].trim() : "";

    return {
      action: "search",
      entity: "search",
      params: { query },
    };
  }

  // List/show commands
  if (/show|list|display.*(?:tasks?|habits?|todos?)/i.test(lowerInput)) {
    let entity: "task" | "habit" | "todo" = "task";
    if (/habits?/i.test(lowerInput)) entity = "habit";
    if (/todos?|to-dos?/i.test(lowerInput)) entity = "todo";

    return {
      action: "list",
      entity,
      params: {},
    };
  }

  // Help command
  if (/help|what can you do|commands/i.test(lowerInput)) {
    return {
      action: "help",
      entity: "unknown",
      params: {},
    };
  }

  // Unknown command
  return {
    action: "unknown",
    entity: "unknown",
    params: { originalInput: input },
  };
};
