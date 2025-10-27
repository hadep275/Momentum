import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Trash2, GitMerge } from "lucide-react";

interface TagManagementProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export const TagManagement = ({ tasks, onUpdateTasks }: TagManagementProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mergeTargetName, setMergeTargetName] = useState("");
  const { toast } = useToast();

  // Get all unique tags with usage count
  const tagStats = tasks.reduce((acc, task) => {
    task.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const uniqueTags = Object.keys(tagStats).sort();

  const toggleTagSelection = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleMergeTags = () => {
    if (selectedTags.length < 2) {
      toast({
        title: "Select at least 2 tags",
        description: "You need to select multiple tags to merge them.",
        variant: "destructive",
      });
      return;
    }

    if (!mergeTargetName.trim()) {
      toast({
        title: "Enter a tag name",
        description: "Please enter the name for the merged tag.",
        variant: "destructive",
      });
      return;
    }

    const normalizedTarget = mergeTargetName.trim().toLowerCase();
    
    const updatedTasks = tasks.map((task) => {
      const newTags = task.tags.filter((tag) => !selectedTags.includes(tag));
      if (task.tags.some((tag) => selectedTags.includes(tag))) {
        if (!newTags.includes(normalizedTarget)) {
          newTags.push(normalizedTarget);
        }
      }
      return { ...task, tags: newTags };
    });

    onUpdateTasks(updatedTasks);
    setSelectedTags([]);
    setMergeTargetName("");
    
    toast({
      title: "Tags merged",
      description: `${selectedTags.length} tags merged into "${normalizedTarget}"`,
    });
  };

  const handleDeleteTags = () => {
    if (selectedTags.length === 0) {
      toast({
        title: "No tags selected",
        description: "Select tags to delete them.",
        variant: "destructive",
      });
      return;
    }

    const updatedTasks = tasks.map((task) => ({
      ...task,
      tags: task.tags.filter((tag) => !selectedTags.includes(tag)),
    }));

    onUpdateTasks(updatedTasks);
    
    toast({
      title: "Tags deleted",
      description: `${selectedTags.length} tag(s) removed from all tasks.`,
    });
    
    setSelectedTags([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Tag Management</h2>
        <p className="text-muted-foreground">
          View, merge, and clean up tags across all your tasks
        </p>
      </div>

      {uniqueTags.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No tags yet. Tags will appear here once you add them to tasks.
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">All Tags ({uniqueTags.length})</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-2 px-3 transition-all hover:scale-105"
                  onClick={() => toggleTagSelection(tag)}
                >
                  {tag} ({tagStats[tag]})
                </Badge>
              ))}
            </div>
          </Card>

          {selectedTags.length > 0 && (
            <Card className="p-6 border-gold">
              <h3 className="font-semibold mb-4">
                Selected: {selectedTags.length} tag(s)
              </h3>
              
              <div className="space-y-4">
                {selectedTags.length >= 2 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Merge into:</label>
                    <div className="flex gap-2">
                      <Input
                        value={mergeTargetName}
                        onChange={(e) => setMergeTargetName(e.target.value)}
                        placeholder="Enter new tag name"
                      />
                      <Button onClick={handleMergeTags} className="gap-2">
                        <GitMerge className="h-4 w-4" />
                        Merge
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  variant="destructive"
                  onClick={handleDeleteTags}
                  className="gap-2 w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected Tags
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
