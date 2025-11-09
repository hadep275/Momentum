import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Bell, Download, Upload } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideCompletedHabits: boolean;
  onHideCompletedHabitsChange: (hide: boolean) => void;
  hideCompletedTasks: boolean;
  onHideCompletedTasksChange: (hide: boolean) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (data: string) => void;
}

export const AppSettings = ({
  open,
  onOpenChange,
  hideCompletedHabits,
  onHideCompletedHabitsChange,
  hideCompletedTasks,
  onHideCompletedTasksChange,
  theme,
  onThemeChange,
  onResetData,
  onExportData,
  onImportData,
}: AppSettingsProps) => {
  const { permission, isSupported, requestPermission } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onImportData(content);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNotificationRequest = async () => {
    if (!isSupported) {
      toast.error("Notifications not supported", {
        description: "Your browser doesn't support notifications"
      });
      return;
    }

    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications enabled!", {
        description: "You'll receive reminders for tasks and habits"
      });
    } else {
      toast.error("Notifications blocked", {
        description: "Please enable notifications in your browser settings"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hide-completed-tasks">Hide completed tasks</Label>
              <p className="text-sm text-muted-foreground">
                Completed tasks will be hidden from view
              </p>
            </div>
            <Switch
              id="hide-completed-tasks"
              checked={hideCompletedTasks}
              onCheckedChange={onHideCompletedTasksChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hide-completed-habits">Hide completed habits</Label>
              <p className="text-sm text-muted-foreground">
                Completed habits will be hidden from view
              </p>
            </div>
            <Switch
              id="hide-completed-habits"
              checked={hideCompletedHabits}
              onCheckedChange={onHideCompletedHabitsChange}
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' 
                  ? 'Notifications are enabled' 
                  : permission === 'denied'
                  ? 'Notifications are blocked. Enable in browser settings.'
                  : 'Enable notifications for task and habit reminders'}
              </p>
            </div>
            {permission !== 'granted' && isSupported && (
              <Button 
                onClick={handleNotificationRequest}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}
            {permission === 'granted' && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Bell className="h-4 w-4" />
                <span>Notifications enabled</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label htmlFor="theme-select">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger id="theme-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Pink & Gold)</SelectItem>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="dark">Dark Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-6 pb-6">
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label>Backup & Restore</Label>
                <p className="text-sm text-muted-foreground">
                  Export all your data to backup or transfer to another device
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={onExportData}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  onClick={handleImportClick}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="border-t pt-6 pb-6">
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label>Support Development</Label>
                <p className="text-sm text-muted-foreground">
                  Help keep Momentum free and actively developed
                </p>
              </div>
              <Button 
                variant="outline"
                className="w-full"
                size="sm"
                asChild
              >
                <a 
                  href="https://www.buymeacoffee.com/Momentumapp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  ☕ Buy me a coffee
                </a>
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="space-y-3">
              <div>
                <Label className="text-destructive">Danger Zone</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete all your tasks, habits, and data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all
                      your tasks, habits, progress data, and settings from this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onResetData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
