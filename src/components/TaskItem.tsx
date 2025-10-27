import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Trash2, Clock } from "lucide-react";
import { Task } from "@/components/TaskList";
import { ChecklistItem } from "@/components/ChecklistItem";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskItem = ({ task, onUpdate, onDelete }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleToggleComplete = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  const handleUpdateChecklist = (checklistId: string, updates: Partial<Task["checklists"][0]>) => {
    const updatedChecklists = task.checklists.map((c) =>
      c.id === checklistId ? { ...c, ...updates } : c
    );
    onUpdate({ ...task, checklists: updatedChecklists });
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

  return (
    <Card className="p-4 hover:shadow-lg transition-all border-l-4 border-l-primary bg-gradient-to-r from-card to-rose-gold/5">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {getRecurrenceText() && (
                  <Badge variant="secondary" className="text-xs">
                    {getRecurrenceText()}
                  </Badge>
                )}
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
            </div>

            {totalChecklists > 0 && (
              <div className="space-y-2">
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
          </div>
        </div>

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
      </div>
    </Card>
  );
};
