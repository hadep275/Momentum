import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-col items-center gap-4 px-6 pb-6">
          <p className="text-center text-muted-foreground">
            Your support means everything! Click below to buy me a coffee and help keep Momentum growing.
          </p>
          <Button 
            onClick={() => window.open('https://www.buymeacoffee.com/Momentumapp', '_blank')}
            size="lg"
            className="w-full max-w-xs"
          >
            Open Buy Me a Coffee ☕
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
