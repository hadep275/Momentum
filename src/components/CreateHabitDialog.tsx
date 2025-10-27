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
import { Habit, TASK_CATEGORIES } from "@/types/task";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TimePicker } from "@/components/TimePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
}

const DAYS = [
  { value: "0", label: "Sun", short: "S" },
  { value: "1", label: "Mon", short: "M" },
  { value: "2", label: "Tue", short: "T" },
  { value: "3", label: "Wed", short: "W" },
  { value: "4", label: "Thu", short: "T" },
  { value: "5", label: "Fri", short: "F" },
  { value: "6", label: "Sat", short: "S" },
];

export const CreateHabitDialog = ({
  open,
  onOpenChange,
  onCreateHabit,
}: CreateHabitDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    if (!title.trim() || selectedDays.length === 0) return;

    const habit: Omit<Habit, "id" | "createdAt"> = {
      title: title.trim(),
      daysOfWeek: selectedDays.map(d => parseInt(d)),
      time,
      categoryId,
      completions: [],
    };

    onCreateHabit(habit);
    
    // Reset form
    setTitle("");
    setSelectedDays([]);
    setTime(undefined);
    setCategoryId(undefined);
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
                  {day.short}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              Select the days this habit should appear
            </p>
          </div>

          <div className="space-y-2">
            <Label>Time (Optional)</Label>
            <TimePicker value={time} onChange={setTime} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TASK_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
