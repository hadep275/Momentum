import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceTextarea } from "@/components/VoiceTextarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, CalendarIcon } from "lucide-react";
import { Task, TASK_CATEGORIES, TaskPriority } from "@/types/task";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TagInput } from "@/components/TagInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimePicker } from "@/components/TimePicker";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (task: Task) => void;
  task: Task;
  existingTags?: string[];
}

export const EditTaskDialog = ({ 
  open, 
  onOpenChange, 
  onUpdateTask,
  task,
  existingTags = []
}: EditTaskDialogProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate);
  const [dueTime, setDueTime] = useState<string>(task.dueTime || "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [categoryId, setCategoryId] = useState<string | undefined>(task.categoryId);
  const [tags, setTags] = useState<string[]>(task.tags);
  const [recurrenceType, setRecurrenceType] = useState<Task["recurrence"]>(task.recurrence || { type: "daily" });
  const [checklists, setChecklists] = useState<string[]>(task.checklists.map(c => c.title));
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(task.dueDate);
    setDueTime(task.dueTime || "");
    setPriority(task.priority);
    setCategoryId(task.categoryId);
    setTags(task.tags);
    setRecurrenceType(task.recurrence || { type: "daily" });
    setChecklists(task.checklists.map(c => c.title));
  }, [task]);

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklists([...checklists, newChecklistItem.trim()]);
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklists(checklists.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !dueDate) return;

    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      categoryId,
      tags,
      recurrence: recurrenceType,
      checklists: checklists.map((item, index) => {
        // Try to preserve existing checklist data
        const existingChecklist = task.checklists.find(c => c.title === item);
        return existingChecklist || {
          id: `checklist-${index}-${Date.now()}`,
          title: item,
          completed: false,
          timeSpent: 0,
        };
      }),
    };

    onUpdateTask(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-6">
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details, category, tags, and schedule
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto overflow-x-visible">
          <div className="space-y-4 pb-4 pl-6 pr-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <VoiceTextarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description (optional) - Use mic for voice input"
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <TimePicker
            value={dueTime}
            onChange={setDueTime}
            label="Due Time (Optional)"
          />

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category (optional)" />
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

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
              existingTags={existingTags}
              placeholder="Add tags..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={recurrenceType?.type || "none"}
              onValueChange={(value) =>
                value === "none" 
                  ? setRecurrenceType(undefined)
                  : setRecurrenceType({ type: value as Task["recurrence"]["type"] })
              }
            >
              <SelectTrigger id="recurrence">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Checklists</Label>
            <div className="flex gap-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add checklist item"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <Button type="button" onClick={handleAddChecklistItem} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {checklists.length > 0 && (
              <div className="space-y-2 mt-3">
                {checklists.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <span className="text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveChecklistItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 pb-6 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !dueDate}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};