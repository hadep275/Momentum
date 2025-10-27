import { TASK_CATEGORIES } from "@/types/task";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const colorClasses = {
    gold: "bg-gold/20 text-gold border-gold hover:bg-gold/30",
    copper: "bg-copper/20 text-copper border-copper hover:bg-copper/30",
    "rose-pink": "bg-rose-pink/20 text-rose-pink border-rose-pink hover:bg-rose-pink/30",
    accent: "bg-accent/20 text-accent border-accent hover:bg-accent/30",
    secondary: "bg-secondary/20 text-secondary-foreground border-secondary hover:bg-secondary/30",
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="shrink-0"
        >
          All
        </Button>
        {TASK_CATEGORIES.map((category) => {
          const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "shrink-0 gap-2 transition-all min-h-[44px]",
                isSelected && colorClasses[category.color as keyof typeof colorClasses]
              )}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              {category.name}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
