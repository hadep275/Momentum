import { useState } from "react";
import { Input } from "@/components/ui/input";
import { TagBadge } from "@/components/TagBadge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRESET_TAGS } from "@/types/task";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  existingTags?: string[];
  placeholder?: string;
}

export const TagInput = ({ 
  tags, 
  onTagsChange, 
  existingTags = [], 
  placeholder = "Add custom tag..." 
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Normalize tag: lowercase and trim
  const normalizeTag = (tag: string): string => {
    return tag.trim().toLowerCase();
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Show suggestions from preset tags and existing tags
    if (value.trim()) {
      const allPossibleTags = [...PRESET_TAGS, ...existingTags];
      const normalizedInput = normalizeTag(value);
      const normalizedExistingTags = tags.map(normalizeTag);
      
      const filtered = allPossibleTags.filter(
        (tag) =>
          normalizeTag(tag).includes(normalizedInput) &&
          !normalizedExistingTags.includes(normalizeTag(tag))
      );
      setSuggestions([...new Set(filtered)].slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tag: string) => {
    const normalizedTag = normalizeTag(tag);
    const normalizedExistingTags = tags.map(normalizeTag);
    
    if (normalizedTag && !normalizedExistingTags.includes(normalizedTag)) {
      onTagsChange([...tags, normalizedTag]);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Preset Tags */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Quick tags:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((presetTag) => {
            const normalizedExistingTags = tags.map(normalizeTag);
            const isSelected = normalizedExistingTags.includes(normalizeTag(presetTag));
            
            return (
              <Badge
                key={presetTag}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => {
                  if (isSelected) {
                    removeTag(tags.find(t => normalizeTag(t) === normalizeTag(presetTag)) || presetTag);
                  } else {
                    addTag(presetTag);
                  }
                }}
              >
                {presetTag}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(inputValue);
              }
            }}
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          size="icon"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} />
          ))}
        </div>
      )}
    </div>
  );
};
