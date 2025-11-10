import { useEffect } from "react";

interface BuyMeCoffeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyMeCoffeeDialog({ open, onOpenChange }: BuyMeCoffeeDialogProps) {
  useEffect(() => {
    if (open && window.BMC) {
      // Trigger the Buy Me a Coffee widget
      window.BMC.openWidget();
      // Close our dialog immediately since the widget will handle the UI
      onOpenChange(false);
    }
  }, [open, onOpenChange]);

  // This component doesn't render anything visible - it just triggers the widget
  return null;
}

// Extend window type to include BMC
declare global {
  interface Window {
    BMC?: {
      openWidget: () => void;
    };
  }
}
