import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Template } from "@/types/template";
import { useTemplates } from "@/hooks/useTemplates";
import { CreateTemplateDialog } from "@/components/CreateTemplateDialog";
import { Clock, Plus, Sparkles, Trash2, Edit, CheckCircle2 } from "lucide-react";
import { Task } from "@/types/task";
import { addMinutes, format } from "date-fns";
import { toast } from "sonner";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TagBadge } from "@/components/TagBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (tasks: Task[]) => void;
  existingTags?: string[];
}

export const TemplatesDialog = ({
  open,
  onOpenChange,
  onUseTemplate,
  existingTags = [],
}: TemplatesDialogProps) => {
  const { allTemplates, prebuiltTemplates, customTemplates, addTemplate, deleteTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleUseTemplate = (template: Template) => {
    const now = new Date();
    const tasks: Task[] = template.tasks.map((templateTask) => ({
      id: crypto.randomUUID(),
      title: templateTask.title,
      description: templateTask.description,
      dueDate: addMinutes(now, templateTask.relativeMinutes),
      dueTime: format(addMinutes(now, templateTask.relativeMinutes), "HH:mm"),
      priority: templateTask.priority,
      categoryId: templateTask.categoryId,
      tags: templateTask.tags,
      checklists: templateTask.checklists?.map((checklist) => ({
        id: crypto.randomUUID(),
        title: checklist.title,
        completed: false,
        timeSpent: 0,
      })) || [],
      completed: false,
      createdAt: new Date(),
    }));

    onUseTemplate(tasks);
    onOpenChange(false);
    toast.success(`Created ${tasks.length} tasks from "${template.name}"`, {
      description: "Your tasks are ready to go!",
    });
  };

  const handleCreateTemplate = (templateData: {
    name: string;
    description?: string;
    tasks: Template["tasks"];
  }) => {
    addTemplate(templateData);
    setIsCreateDialogOpen(false);
    toast.success("Template created successfully");
  };

  const handleDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      setTemplateToDelete(null);
      toast.success("Template deleted");
    }
  };

  const formatRelativeTime = (minutes: number) => {
    if (minutes === 0) return "Now";
    if (minutes < 60) return `+${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `+${hours}h ${mins}min` : `+${hours}h`;
  };

  const renderTemplateCard = (template: Template) => (
    <div
      key={template.id}
      className={`border rounded-lg p-4 hover:border-gold transition-colors cursor-pointer ${
        selectedTemplate?.id === template.id ? "border-gold bg-gold/5" : ""
      }`}
      onClick={() => setSelectedTemplate(template)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {template.isPrebuilt && <Sparkles className="h-4 w-4 text-gold" />}
          <h4 className="font-semibold">{template.name}</h4>
        </div>
        {!template.isPrebuilt && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setTemplateToDelete(template.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {template.description && (
        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
      )}
      <div className="text-xs text-muted-foreground">
        {template.tasks.length} tasks • {Math.max(...template.tasks.map((t) => t.relativeMinutes))}min total
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span>Task Templates</span>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Create New
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 h-[500px] md:h-[600px]">
            {/* Template List */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Pre-built Templates
                </h3>
                <ScrollArea className="h-[180px] md:h-[250px]">
                  <div className="space-y-2 pr-4">
                    {prebuiltTemplates.map((template) => renderTemplateCard(template))}
                  </div>
                </ScrollArea>
              </div>

              {customTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">My Templates</h3>
                  <ScrollArea className="h-[180px] md:h-[250px]">
                    <div className="space-y-2 pr-4">
                      {customTemplates.map((template) => renderTemplateCard(template))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Template Preview */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              {selectedTemplate ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold mb-1">{selectedTemplate.name}</h3>
                    {selectedTemplate.description && (
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                    )}
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {selectedTemplate.tasks.map((task, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium break-words">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1 break-words">{task.description}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(task.relativeMinutes)}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center">
                            {task.categoryId && <CategoryBadge categoryId={task.categoryId} />}
                            {task.tags.map((tag) => (
                              <TagBadge key={tag} tag={tag} />
                            ))}
                            {task.durationMinutes && (
                              <span className="text-xs text-muted-foreground">
                                ~{task.durationMinutes}min
                              </span>
                            )}
                          </div>

                          {task.checklists && task.checklists.length > 0 && (
                            <div className="text-xs text-muted-foreground pl-2 border-l-2 border-muted">
                              {task.checklists.length} subtask{task.checklists.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <Button onClick={() => handleUseTemplate(selectedTemplate)} className="w-full">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-4 text-center text-muted-foreground">
                  Select a template to preview
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateTemplate={handleCreateTemplate}
        existingTags={existingTags}
      />

      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
