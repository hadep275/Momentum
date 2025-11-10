import { useEffect, useRef } from "react";

interface BuyMeCoffeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyMeCoffeeDialog({ open, onOpenChange }: BuyMeCoffeeDialogProps) {
  const attempts = useRef(0);

  useEffect(() => {
    if (!open) return;

    const tryOpenWidget = () => {
      // Try common selectors used by BMC's floating launcher
      const selectors = [
        "#bmc-wbtn",
        "div[id^='bmc-wbtn']",
        "a[href*='buymeacoffee'][class*='floating']",
        "div[class*='bmc-'][class*='floating']",
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) {
          el.click();
          return true;
        }
      }

      return false;
    };

    const openNow = () => {
      const opened = tryOpenWidget();
      attempts.current++;
      if (!opened && attempts.current < 8) {
        // Retry a few times to allow the script to initialize
        setTimeout(openNow, 200);
      } else {
        // Close our dialog either way to avoid trapping the UI
        onOpenChange(false);
      }
    };

    openNow();

    return () => {
      attempts.current = 0;
    };
  }, [open, onOpenChange]);

  // No visible UI; this component just triggers the widget programmatically
  return null;
}

