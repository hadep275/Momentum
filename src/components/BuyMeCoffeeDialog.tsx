import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BuyMeCoffeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyMeCoffeeDialog({ open, onOpenChange }: BuyMeCoffeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Support Momentum ☕</DialogTitle>
          <DialogDescription>
            Thank you for your support! Your contribution helps keep Momentum running and improving.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 w-full h-full px-6 pb-6">
          <iframe
            src="https://www.buymeacoffee.com/Momentumapp"
            className="w-full h-full rounded-lg border border-border"
            title="Buy Me a Coffee"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
