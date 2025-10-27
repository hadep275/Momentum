import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Habit } from "@/types/task";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
}

const DAYS = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
];

export const CreateHabitDialog = ({
  open,
  onOpenChange,
  onCreateHabit,
}: CreateHabitDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title.trim() || selectedDays.length === 0) return;

    const habit: Omit<Habit, "id" | "createdAt"> = {
      title: title.trim(),
      daysOfWeek: selectedDays.map(d => parseInt(d)),
      completions: [],
    };

    onCreateHabit(habit);
    
    // Reset form
    setTitle("");
    setSelectedDays([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Daily Habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-title">Habit Name *</Label>
            <Input
              id="habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning workout, Read 30 minutes..."
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Days of Week *</Label>
            <ToggleGroup
              type="multiple"
              value={selectedDays}
              onValueChange={setSelectedDays}
              className="grid grid-cols-7 gap-2"
            >
              {DAYS.map((day) => (
                <ToggleGroupItem
                  key={day.value}
                  value={day.value}
                  aria-label={day.label}
                  className="h-10 data-[state=on]:bg-gold data-[state=on]:text-accent-foreground"
                >
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              Select the days this habit should appear
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || selectedDays.length === 0}
              className="min-h-[44px]"
            >
              Create Habit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
