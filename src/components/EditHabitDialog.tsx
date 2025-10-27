import { useState, useEffect } from "react";
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

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onUpdateHabit: (habit: Habit) => void;
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

export const EditHabitDialog = ({
  open,
  onOpenChange,
  habit,
  onUpdateHabit,
}: EditHabitDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setSelectedDays(habit.daysOfWeek.map(d => d.toString()));
      setTime(habit.time);
      setCategoryId(habit.categoryId);
    }
  }, [habit]);

  const handleSubmit = () => {
    if (!habit || !title.trim() || selectedDays.length === 0) return;

    const updatedHabit: Habit = {
      ...habit,
      title: title.trim(),
      daysOfWeek: selectedDays.map(d => parseInt(d)),
      time,
      categoryId,
    };

    onUpdateHabit(updatedHabit);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-habit-title">Habit Name *</Label>
            <Input
              id="edit-habit-title"
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
          </div>

          <div className="space-y-2">
            <Label>Time (Optional)</Label>
            <TimePicker value={time} onChange={setTime} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="edit-category">
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
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
