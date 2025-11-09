import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task, Habit } from "@/types/task";
import { 
  Download, 
  Share2, 
  Calendar as CalendarIcon,
  Apple,
  FileDown
} from "lucide-react";
import { 
  generateTaskICS, 
  generateHabitICS, 
  generateFullCalendarICS,
  downloadICS,
  shareCalendarEvent,
  generateGoogleCalendarURL
} from "@/lib/calendarExport";
import { toast } from "sonner";

interface CalendarExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  habits: Habit[];
  selectedTask?: Task;
  selectedHabit?: Habit;
}

export const CalendarExportDialog = ({
  open,
  onOpenChange,
  tasks,
  habits,
  selectedTask,
  selectedHabit,
}: CalendarExportDialogProps) => {
  const isFullExport = !selectedTask && !selectedHabit;

  const handleDownloadICS = () => {
    if (isFullExport) {
      const content = generateFullCalendarICS(tasks, habits);
      downloadICS(content, 'momentum-calendar.ics');
      toast.success('Calendar exported!', {
        description: 'Full calendar downloaded as .ics file'
      });
    } else if (selectedTask) {
      const content = generateTaskICS(selectedTask);
      downloadICS(content, `task-${selectedTask.id}.ics`);
      toast.success('Task exported!', {
        description: 'Task downloaded as .ics file'
      });
    } else if (selectedHabit) {
      const content = generateHabitICS(selectedHabit);
      downloadICS(content, `habit-${selectedHabit.id}.ics`);
      toast.success('Habit exported!', {
        description: 'Habit downloaded as .ics file'
      });
    }
  };

  const handleShare = async () => {
    let content: string;
    let title: string;

    if (isFullExport) {
      content = generateFullCalendarICS(tasks, habits);
      title = 'Momentum Calendar';
    } else if (selectedTask) {
      content = generateTaskICS(selectedTask);
      title = selectedTask.title;
    } else if (selectedHabit) {
      content = generateHabitICS(selectedHabit);
      title = selectedHabit.title;
    } else {
      return;
    }

    const shared = await shareCalendarEvent(content, title);
    if (shared) {
      toast.success('Shared successfully!');
    } else {
      toast.error('Share not supported', {
        description: 'Try downloading the .ics file instead'
      });
    }
  };

  const handleGoogleCalendar = () => {
    if (selectedTask) {
      const url = generateGoogleCalendarURL(selectedTask);
      window.open(url, '_blank');
      toast.success('Opening Google Calendar...');
    } else {
      // For full export or habit, download and instruct user
      handleDownloadICS();
      toast.info('File downloaded', {
        description: 'Import the .ics file into Google Calendar'
      });
    }
  };

  const handleAppleCalendar = () => {
    // For Apple Calendar, we download the .ics file
    handleDownloadICS();
    toast.info('File downloaded', {
      description: 'Open the .ics file to add to Apple Calendar'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export to Calendar</DialogTitle>
          <DialogDescription>
            {isFullExport 
              ? 'Export all your tasks and habits to your calendar app'
              : selectedTask
              ? `Export "${selectedTask.title}" to your calendar`
              : `Export "${selectedHabit?.title}" to your calendar`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Button 
            onClick={handleDownloadICS}
            variant="outline"
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Download .ics file
          </Button>

          {navigator.share && (
            <Button 
              onClick={handleShare}
              variant="outline"
              className="w-full justify-start"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via...
            </Button>
          )}

          <Button 
            onClick={handleGoogleCalendar}
            variant="outline"
            className="w-full justify-start"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Add to Google Calendar
          </Button>

          <Button 
            onClick={handleAppleCalendar}
            variant="outline"
            className="w-full justify-start"
          >
            <Apple className="h-4 w-4 mr-2" />
            Add to Apple Calendar
          </Button>

          {isFullExport && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Import the .ics file into any calendar app (Google, Apple, Outlook, etc.)
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};