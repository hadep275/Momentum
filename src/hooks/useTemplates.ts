import { useState, useEffect } from "react";
import { Template, PREBUILT_TEMPLATES } from "@/types/template";

const TEMPLATES_STORAGE_KEY = "momentum-templates";

export const useTemplates = () => {
  const [customTemplates, setCustomTemplates] = useState<Template[]>(() => {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
        }));
      } catch (e) {
        console.error("Failed to parse stored templates:", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
  }, [customTemplates]);

  const allTemplates = [...PREBUILT_TEMPLATES, ...customTemplates];

  const addTemplate = (template: Omit<Template, "id" | "createdAt">) => {
    const newTemplate: Template = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setCustomTemplates((prev) => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setCustomTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    allTemplates,
    customTemplates,
    prebuiltTemplates: PREBUILT_TEMPLATES,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
