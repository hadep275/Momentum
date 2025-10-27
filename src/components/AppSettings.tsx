import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AppSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideCompletedHabits: boolean;
  onHideCompletedHabitsChange: (hide: boolean) => void;
}

export const AppSettings = ({
  open,
  onOpenChange,
  hideCompletedHabits,
  onHideCompletedHabitsChange,
}: AppSettingsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hide-completed">Hide completed habits</Label>
              <p className="text-sm text-muted-foreground">
                Completed habits will be hidden from view
              </p>
            </div>
            <Switch
              id="hide-completed"
              checked={hideCompletedHabits}
              onCheckedChange={onHideCompletedHabitsChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
