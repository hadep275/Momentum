import { Badge } from "@/components/ui/badge";
import { TASK_CATEGORIES } from "@/types/task";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  categoryId: string;
  variant?: "default" | "outline";
  className?: string;
}

export const CategoryBadge = ({ categoryId, variant = "default", className }: CategoryBadgeProps) => {
  const category = TASK_CATEGORIES.find((c) => c.id === categoryId);
  
  if (!category) return null;

  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;

  const colorClasses = {
    gold: "bg-gold/20 text-gold border-gold/30",
    copper: "bg-copper/20 text-copper border-copper/30",
    "rose-pink": "bg-rose-pink/20 text-rose-pink border-rose-pink/30",
    accent: "bg-accent/20 text-accent border-accent/30",
    secondary: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1 text-xs font-medium",
        colorClasses[category.color as keyof typeof colorClasses],
        className
      )}
    >
      {IconComponent && <IconComponent className="w-3 h-3" />}
      {category.name}
    </Badge>
  );
};
