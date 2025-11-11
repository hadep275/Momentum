import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Pencil, Trash2, Clock, CalendarPlus } from "lucide-react";
import { Habit } from "@/types/task";
import { format } from "date-fns";
import { generateHabitICS, exportSingleItem } from "@/lib/calendarExport";
import { toast } from "@/hooks/use-toast";

interface HabitItemProps {
  habit: Habit;
  isCompletedToday: boolean;
  onToggleComplete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

const getDayNames = (daysOfWeek: number[]) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  
  if (sortedDays.length === 7) return "Daily";
  if (sortedDays.length === 5 && sortedDays.every(d => d >= 1 && d <= 5)) return "Weekdays";
  if (sortedDays.length === 2 && sortedDays[0] === 0 && sortedDays[1] === 6) return "Weekends";
  
  return sortedDays.map(d => dayNames[d]).join(", ");
};

export const HabitItem = ({ 
  habit, 
  isCompletedToday,
  onToggleComplete, 
  onEdit, 
  onDelete 
}: HabitItemProps) => {
  const handleExportToCalendar = async () => {
    const icsContent = generateHabitICS(habit);
    const filename = `${habit.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    const success = await exportSingleItem(icsContent, filename, habit.title);
    
    if (success) {
      toast({
        title: "Habit added to calendar!",
        description: "Your habit has been exported to your calendar app.",
      });
    }
  };

  return (
    <Card className="p-4 hover:border-gold/50 transition-colors">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isCompletedToday}
          onCheckedChange={() => onToggleComplete(habit.id)}
          className="h-5 w-5 min-w-[20px]"
        />
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${isCompletedToday ? "line-through text-muted-foreground" : ""}`}>
            {habit.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {getDayNames(habit.daysOfWeek)}
            </p>
            {habit.time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {habit.time}
              </div>
            )}
            {habit.categoryId && <CategoryBadge categoryId={habit.categoryId} />}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(habit)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportToCalendar}
            title="Add to calendar"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(habit.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
