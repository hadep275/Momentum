import { Card } from "@/components/ui/card";

export const Calendar = () => {
  return (
    <Card className="p-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Calendar View</h2>
        <p className="text-muted-foreground">
          Calendar integration coming soon. This will display all your tasks and their recurrences.
        </p>
      </div>
    </Card>
  );
};
