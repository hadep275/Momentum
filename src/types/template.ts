import { Task } from "./task";

export interface TemplateTask {
  title: string;
  description?: string;
  relativeMinutes: number; // Minutes from "now" when template is used
  priority: Task["priority"];
  categoryId?: string;
  tags: string[];
  durationMinutes?: number; // Expected duration
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  tasks: TemplateTask[];
  isPrebuilt?: boolean;
  createdAt: Date;
}

export const PREBUILT_TEMPLATES: Template[] = [
  {
    id: "morning-routine",
    name: "Morning Routine",
    description: "Start your day with intention and energy",
    isPrebuilt: true,
    createdAt: new Date(),
    tasks: [
      {
        title: "Meditation",
        description: "10-minute mindfulness session",
        relativeMinutes: 0,
        priority: "high",
        categoryId: "personal",
        tags: ["routine", "wellness"],
        durationMinutes: 15,
      },
      {
        title: "Exercise",
        description: "Morning workout or walk",
        relativeMinutes: 15,
        priority: "high",
        categoryId: "health",
        tags: ["routine", "fitness"],
        durationMinutes: 30,
      },
      {
        title: "Healthy Breakfast",
        description: "Nutritious meal to fuel your day",
        relativeMinutes: 45,
        priority: "medium",
        categoryId: "health",
        tags: ["routine", "nutrition"],
        durationMinutes: 20,
      },
      {
        title: "Plan Your Day",
        description: "Review priorities and set intentions",
        relativeMinutes: 65,
        priority: "high",
        categoryId: "focus",
        tags: ["planning", "routine"],
        durationMinutes: 10,
      },
    ],
  },
  {
    id: "work-sprint",
    name: "Deep Work Sprint",
    description: "2-hour focused work block with strategic breaks",
    isPrebuilt: true,
    createdAt: new Date(),
    tasks: [
      {
        title: "Deep Work Block 1",
        description: "Focus on most important task",
        relativeMinutes: 0,
        priority: "high",
        categoryId: "focus",
        tags: ["deep-work", "focus"],
        durationMinutes: 50,
      },
      {
        title: "Short Break",
        description: "Walk, stretch, hydrate",
        relativeMinutes: 50,
        priority: "medium",
        categoryId: "health",
        tags: ["break", "wellness"],
        durationMinutes: 10,
      },
      {
        title: "Deep Work Block 2",
        description: "Continue focused work",
        relativeMinutes: 60,
        priority: "high",
        categoryId: "focus",
        tags: ["deep-work", "focus"],
        durationMinutes: 50,
      },
      {
        title: "Review & Plan Next Steps",
        description: "Document progress and next actions",
        relativeMinutes: 110,
        priority: "medium",
        categoryId: "work",
        tags: ["review", "planning"],
        durationMinutes: 10,
      },
    ],
  },
  {
    id: "weekly-planning",
    name: "Weekly Planning Session",
    description: "Review last week and plan the week ahead",
    isPrebuilt: true,
    createdAt: new Date(),
    tasks: [
      {
        title: "Review Last Week",
        description: "What went well? What to improve?",
        relativeMinutes: 0,
        priority: "high",
        categoryId: "focus",
        tags: ["review", "reflection"],
        durationMinutes: 15,
      },
      {
        title: "Set Weekly Goals",
        description: "Define 3-5 key priorities for the week",
        relativeMinutes: 15,
        priority: "high",
        categoryId: "focus",
        tags: ["planning", "goals"],
        durationMinutes: 15,
      },
      {
        title: "Schedule Important Tasks",
        description: "Block time for priority tasks",
        relativeMinutes: 30,
        priority: "high",
        categoryId: "work",
        tags: ["planning", "scheduling"],
        durationMinutes: 20,
      },
      {
        title: "Prep for Monday",
        description: "Prepare materials and mindset for strong start",
        relativeMinutes: 50,
        priority: "medium",
        categoryId: "work",
        tags: ["planning", "preparation"],
        durationMinutes: 10,
      },
    ],
  },
  {
    id: "evening-wind-down",
    name: "Evening Wind Down",
    description: "End your day peacefully and prepare for rest",
    isPrebuilt: true,
    createdAt: new Date(),
    tasks: [
      {
        title: "Review Day",
        description: "Reflect on accomplishments and learnings",
        relativeMinutes: 0,
        priority: "medium",
        categoryId: "personal",
        tags: ["reflection", "routine"],
        durationMinutes: 10,
      },
      {
        title: "Prepare Tomorrow",
        description: "Set out clothes, pack bag, review schedule",
        relativeMinutes: 10,
        priority: "medium",
        categoryId: "personal",
        tags: ["planning", "routine"],
        durationMinutes: 10,
      },
      {
        title: "Wind Down Activity",
        description: "Reading, journaling, or light stretching",
        relativeMinutes: 20,
        priority: "medium",
        categoryId: "personal",
        tags: ["relaxation", "routine"],
        durationMinutes: 30,
      },
      {
        title: "Bedtime Routine",
        description: "Brush teeth, skincare, prepare for sleep",
        relativeMinutes: 50,
        priority: "low",
        categoryId: "health",
        tags: ["routine", "self-care"],
        durationMinutes: 10,
      },
    ],
  },
  {
    id: "learning-session",
    name: "Learning Session",
    description: "Dedicated time for skill development",
    isPrebuilt: true,
    createdAt: new Date(),
    tasks: [
      {
        title: "Review Previous Material",
        description: "Quick recap of last session",
        relativeMinutes: 0,
        priority: "medium",
        categoryId: "learning",
        tags: ["study", "review"],
        durationMinutes: 10,
      },
      {
        title: "Learn New Concept",
        description: "Watch tutorial or read chapter",
        relativeMinutes: 10,
        priority: "high",
        categoryId: "learning",
        tags: ["study", "learning"],
        durationMinutes: 25,
      },
      {
        title: "Practice Exercise",
        description: "Hands-on practice or problem solving",
        relativeMinutes: 35,
        priority: "high",
        categoryId: "learning",
        tags: ["practice", "learning"],
        durationMinutes: 20,
      },
      {
        title: "Document Learnings",
        description: "Take notes and create summary",
        relativeMinutes: 55,
        priority: "medium",
        categoryId: "learning",
        tags: ["notes", "documentation"],
        durationMinutes: 10,
      },
    ],
  },
];
