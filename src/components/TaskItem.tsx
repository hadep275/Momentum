import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Trash2, Clock, Calendar, AlertCircle, Pencil, CalendarPlus } from "lucide-react";
import { Task } from "@/types/task";
import { ChecklistItem } from "@/components/ChecklistItem";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TagBadge } from "@/components/TagBadge";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { formatDistanceToNow, isPast, differenceInDays, format, addDays, addWeeks, addMonths } from "date-fns";
import { generateTaskICS, exportSingleItem } from "@/lib/calendarExport";
import { toast } from "@/hooks/use-toast";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  existingTags?: string[];
  onUpdateTasks?: (tasks: Task[]) => void;
  allTasks?: Task[];
}

export const TaskItem = ({ task, onUpdate, onDelete, existingTags = [], onUpdateTasks, allTasks = [] }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const completedChecklists = task.checklists.filter((c) => c.completed).length;
  const totalChecklists = task.checklists.length;
  const progress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;

  const totalTimeSpent = task.checklists.reduce((acc, c) => acc + c.timeSpent, 0);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const calculateNextDueDate = (currentDueDate: Date, recurrence: Task["recurrence"]): Date => {
    if (!recurrence) return currentDueDate;
    
    switch (recurrence.type) {
      case "daily":
        return addDays(currentDueDate, recurrence.interval || 1);
      case "weekly":
        return addWeeks(currentDueDate, recurrence.interval || 1);
      case "monthly":
        return addMonths(currentDueDate, recurrence.interval || 1);
      case "custom":
        return addDays(currentDueDate, recurrence.interval || 1);
      default:
        return currentDueDate;
    }
  };

  const handleToggleComplete = async () => {
    const isCompleting = !task.completed;

    // Haptic feedback when completing a task
    if (isCompleting) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        // Haptics not available (web browser), silently fail
      }
    }

    // If completing a recurring task, create a new instance
    if (isCompleting && task.recurrence && onUpdateTasks && allTasks) {
      const nextDueDate = calculateNextDueDate(new Date(task.dueDate), task.recurrence);

      const newRecurringTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        dueDate: nextDueDate,
        completed: false,
        createdAt: new Date(),
        checklists: task.checklists.map(c => ({
          ...c,
          completed: false,
          timeSpent: 0
        }))
      };

      // Update tasks: mark current as completed, add new recurring task
      const updatedTasks = allTasks.map(t =>
        t.id === task.id ? { ...task, completed: true } : t
      );
      onUpdateTasks([...updatedTasks, newRecurringTask]);
    } else {
      onUpdate({ ...task, completed: !task.completed });
    }
  };

  const handleUpdateChecklist = (checklistId: string, updates: Partial<Task["checklists"][0]>) => {
    const updatedChecklists = task.checklists.map((c) =>
      c.id === checklistId ? { ...c, ...updates } : c
    );
    
    // Check if all checklists are now completed
    const allCompleted = updatedChecklists.every((c) => c.completed);
    
    onUpdate({ 
      ...task, 
      checklists: updatedChecklists,
      completed: allCompleted || task.completed // Auto-complete task if all checklists are done
    });
  };

  const getRecurrenceText = () => {
    if (!task.recurrence) return null;
    
    switch (task.recurrence.type) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "custom":
        return "Custom";
      default:
        return null;
    }
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const now = new Date();
    
    // Combine date and time if dueTime is provided
    let dueDateTime = new Date(task.dueDate);
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      dueDateTime.setHours(hours, minutes, 0, 0);
    } else {
      // If no time specified, set to end of day for comparison
      dueDateTime.setHours(23, 59, 59, 999);
    }
    
    const daysUntilDue = differenceInDays(task.dueDate, now);
    const timeText = task.dueTime ? ` at ${task.dueTime}` : '';
    
    if (isPast(dueDateTime) && !task.completed) {
      return {
        text: `Overdue by ${formatDistanceToNow(dueDateTime)}${timeText}`,
        variant: "destructive" as const,
        color: "text-destructive"
      };
    } else if (daysUntilDue === 0) {
      return {
        text: `Due today${timeText}`,
        variant: "default" as const,
        color: "text-gold"
      };
    } else if (daysUntilDue === 1) {
      return {
        text: `Due tomorrow${timeText}`,
        variant: "secondary" as const,
        color: "text-gold"
      };
    } else if (daysUntilDue <= 3) {
      return {
        text: `Due in ${daysUntilDue} days${timeText}`,
        variant: "secondary" as const,
        color: "text-accent"
      };
    } else {
      return {
        text: `Due in ${formatDistanceToNow(task.dueDate)}${timeText}`,
        variant: "outline" as const,
        color: "text-muted-foreground"
      };
    }
  };

  const getPriorityConfig = () => {
    switch (task.priority) {
      case "high":
        return { text: "High Priority", variant: "destructive" as const, icon: AlertCircle };
      case "medium":
        return { text: "Medium Priority", variant: "default" as const, icon: AlertCircle };
      case "low":
        return { text: "Low Priority", variant: "secondary" as const, icon: AlertCircle };
    }
  };

  const dueDateStatus = getDueDateStatus();
  const priorityConfig = getPriorityConfig();

  const handleExportToCalendar = async () => {
    const icsContent = generateTaskICS(task);
    const filename = `${task.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    const success = await exportSingleItem(icsContent, filename, task.title);
    
    if (success) {
      toast({
        title: "Task added to calendar!",
        description: "Your task has been exported to your calendar app.",
      });
    }
  };

  return (
    <Card className="p-4 hover:shadow-xl transition-all border-2 border-gold bg-card shadow-lg shadow-primary/20">
      <div className="space-y-3">
        {/* Title and Checkbox */}
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggleComplete()}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1"
          />
          <h3 className={`flex-1 font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </h3>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground ml-9 whitespace-pre-wrap">{task.description}</p>
        )}

        {/* Badges: Priority, Due Date, Recurrence */}
        <div className="flex flex-wrap gap-2 ml-9">
          <Badge variant={priorityConfig.variant} className="text-xs gap-1">
            <priorityConfig.icon className="w-3 h-3" />
            {priorityConfig.text}
          </Badge>
          {dueDateStatus && (
            <Badge variant={dueDateStatus.variant} className="text-xs gap-1">
              <Calendar className="w-3 h-3" />
              {dueDateStatus.text}
            </Badge>
          )}
          {getRecurrenceText() && (
            <Badge variant="secondary" className="text-xs">
              {getRecurrenceText()}
            </Badge>
          )}
        </div>

        {/* Category and Tags */}
        {(task.categoryId || task.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center ml-9">
            {task.categoryId && (
              <CategoryBadge categoryId={task.categoryId} />
            )}
            {task.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} variant="outline" />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 ml-9">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportToCalendar}
            title="Add to calendar"
          >
            <CalendarPlus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress and Checklist Info */}
        {totalChecklists > 0 && (
          <div className="space-y-2 ml-9">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedChecklists}/{totalChecklists} completed
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{formatTime(totalTimeSpent)}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Expanded Checklist Items */}
        {isExpanded && totalChecklists > 0 && (
          <div className="ml-9 space-y-2 pt-2 border-t">
            {task.checklists.map((checklist) => (
              <ChecklistItem
                key={checklist.id}
                checklist={checklist}
                onUpdate={(updates) => handleUpdateChecklist(checklist.id, updates)}
              />
            ))}
          </div>
        )}

        {/* Metadata Section */}
        {isExpanded && (task.links || task.address || task.email || task.phone) && (
          <div className="ml-9 space-y-2 pt-2 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground">Additional Information</h4>

            {task.links && task.links.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Links:</span>
                {task.links.map((link, index) => (
                  <div key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block truncate"
                    >
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {task.address && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Address:</span>
                <p className="text-sm">{task.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            )}

            {task.email && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Email:</span>
                <a href={`mailto:${task.email}`} className="text-sm text-primary hover:underline block">
                  {task.email}
                </a>
              </div>
            )}

            {task.phone && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Phone:</span>
                <a href={`tel:${task.phone}`} className="text-sm text-primary hover:underline block">
                  {task.phone}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateTask={onUpdate}
        task={task}
        existingTags={existingTags}
      />
    </Card>
  );
};
