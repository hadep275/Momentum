import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TemplateTask } from "@/types/template";
import { TASK_CATEGORIES } from "@/types/task";
import { Plus, Trash2, Clock, ListChecks } from "lucide-react";
import { TagInput } from "@/components/TagInput";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTemplate: (template: { name: string; description?: string; tasks: TemplateTask[] }) => void;
  existingTags?: string[];
}

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
  onCreateTemplate,
  existingTags = [],
}: CreateTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<TemplateTask[]>([
    {
      title: "",
      relativeMinutes: 0,
      priority: "medium",
      tags: [],
    },
  ]);

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        title: "",
        relativeMinutes: tasks.length > 0 ? tasks[tasks.length - 1].relativeMinutes + 30 : 0,
        priority: "medium",
        tags: [],
      },
    ]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleUpdateTask = (index: number, updates: Partial<TemplateTask>) => {
    setTasks(tasks.map((task, i) => (i === index ? { ...task, ...updates } : task)));
  };

  const handleSubmit = () => {
    if (!name.trim() || tasks.length === 0 || !tasks.every((t) => t.title.trim())) {
      return;
    }

    onCreateTemplate({
      name: name.trim(),
      description: description.trim() || undefined,
      tasks,
    });

    // Reset form
    setName("");
    setDescription("");
    setTasks([
      {
        title: "",
        relativeMinutes: 0,
        priority: "medium",
        tags: [],
      },
    ]);
    onOpenChange(false);
  };

  const formatRelativeTime = (minutes: number) => {
    if (minutes === 0) return "Now";
    if (minutes < 60) return `+${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `+${hours}h ${mins}min` : `+${hours}h`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Work Morning"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description (optional)</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this template for?"
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Button onClick={handleAddTask} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>

            {tasks.map((task, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatRelativeTime(task.relativeMinutes)}</span>
                  </div>
                  {tasks.length > 1 && (
                    <Button
                      onClick={() => handleRemoveTask(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3">
                  <Input
                    value={task.title}
                    onChange={(e) => handleUpdateTask(index, { title: e.target.value })}
                    placeholder="Task title"
                  />

                  <Textarea
                    value={task.description || ""}
                    onChange={(e) => handleUpdateTask(index, { description: e.target.value })}
                    placeholder="Description (optional)"
                    rows={2}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Start Time</Label>
                      <Input
                        type="number"
                        value={task.relativeMinutes}
                        onChange={(e) =>
                          handleUpdateTask(index, { relativeMinutes: parseInt(e.target.value) || 0 })
                        }
                        placeholder="Minutes from now"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Duration (min)</Label>
                      <Input
                        type="number"
                        value={task.durationMinutes || ""}
                        onChange={(e) =>
                          handleUpdateTask(index, {
                            durationMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="Optional"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(value) =>
                          handleUpdateTask(index, { priority: value as TemplateTask["priority"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={task.categoryId || "none"}
                        onValueChange={(value) =>
                          handleUpdateTask(index, { categoryId: value === "none" ? undefined : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {TASK_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Tags</Label>
                    <TagInput
                      tags={task.tags}
                      onTagsChange={(tags) => handleUpdateTask(index, { tags })}
                      existingTags={existingTags}
                    />
                  </div>

                  {/* Checklists/Subtasks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1">
                        <ListChecks className="h-3 w-3" />
                        Subtasks (optional)
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => {
                          const checklists = task.checklists || [];
                          handleUpdateTask(index, {
                            checklists: [...checklists, { title: "" }],
                          });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {task.checklists?.map((checklist, checklistIndex) => (
                      <div key={checklistIndex} className="flex gap-2">
                        <Input
                          value={checklist.title}
                          onChange={(e) => {
                            const checklists = [...(task.checklists || [])];
                            checklists[checklistIndex] = { ...checklist, title: e.target.value };
                            handleUpdateTask(index, { checklists });
                          }}
                          placeholder="Subtask title"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-10 w-10 p-0"
                          onClick={() => {
                            const checklists = task.checklists?.filter((_, i) => i !== checklistIndex);
                            handleUpdateTask(index, { checklists });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || tasks.length === 0 || !tasks.every((t) => t.title.trim())}
          >
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
