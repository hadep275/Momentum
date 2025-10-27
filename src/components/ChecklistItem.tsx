import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Play, Pause, Clock } from "lucide-react";
import { Task } from "@/types/task";

interface ChecklistItemProps {
  checklist: Task["checklists"][0];
  onUpdate: (updates: Partial<Task["checklists"][0]>) => void;
}

export const ChecklistItem = ({ checklist, onUpdate }: ChecklistItemProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(checklist.timeSpent);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking]);

  const handleToggleTracking = () => {
    if (isTracking) {
      // Stop tracking and save time
      onUpdate({ timeSpent: currentTime });
    }
    setIsTracking(!isTracking);
  };

  const handleToggleComplete = () => {
    if (isTracking) {
      // Stop tracking and save both time and completion status together
      setIsTracking(false);
      onUpdate({ completed: !checklist.completed, timeSpent: currentTime });
    } else {
      onUpdate({ completed: !checklist.completed });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors border border-gold/30">
      <Checkbox
        checked={checklist.completed}
        onCheckedChange={handleToggleComplete}
      />
      
      <span className={`flex-1 text-sm ${checklist.completed ? "line-through text-muted-foreground" : ""}`}>
        {checklist.title}
      </span>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[60px]">
          <Clock className="w-3 h-3" />
          <span className={isTracking ? "text-primary font-semibold" : ""}>
            {formatTime(currentTime)}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleTracking}
          className="h-8 w-8"
          disabled={checklist.completed}
        >
          {isTracking ? (
            <Pause className="w-3 h-3 text-primary" />
          ) : (
            <Play className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );
};
