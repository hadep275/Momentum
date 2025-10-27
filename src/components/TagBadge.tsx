import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export const TagBadge = ({ tag, onRemove, variant = "secondary", className }: TagBadgeProps) => {
  return (
    <Badge
      variant={variant}
      className={cn(
        "text-xs gap-1 px-2 py-0.5",
        onRemove && "pr-1",
        className
      )}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:bg-background/20 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
};
