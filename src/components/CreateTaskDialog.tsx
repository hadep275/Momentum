import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, CalendarIcon } from "lucide-react";
import { Task, TASK_CATEGORIES } from "@/types/task";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TagInput } from "@/components/TagInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<Task, "id" | "createdAt">) => void;
  existingTags?: string[];
}

export const CreateTaskDialog = ({ 
  open, 
  onOpenChange, 
  onCreateTask,
  existingTags = []
}: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [recurrenceType, setRecurrenceType] = useState<Task["recurrence"]>({ type: "daily" });
  const [checklists, setChecklists] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

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
    if (!title.trim()) return;

    const task: Omit<Task, "id" | "createdAt"> = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      categoryId,
      tags,
      recurrence: recurrenceType,
      checklists: checklists.map((item, index) => ({
        id: `checklist-${index}-${Date.now()}`,
        title: item,
        completed: false,
        timeSpent: 0,
      })),
      completed: false,
    };

    onCreateTask(task);
    
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setCategoryId(undefined);
    setTags([]);
    setRecurrenceType({ type: "daily" });
    setChecklists([]);
    setNewChecklistItem("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-6">
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task with category, tags, checklists, and schedule
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
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
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
              value={recurrenceType?.type}
              onValueChange={(value) =>
                setRecurrenceType({ type: value as Task["recurrence"]["type"] })
              }
            >
              <SelectTrigger id="recurrence">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
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
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
