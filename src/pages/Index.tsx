import { Calendar } from "@/components/Calendar";
import { TaskList } from "@/components/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink via-background to-gold/30">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-copper to-gold bg-clip-text text-transparent drop-shadow-sm">
            Ultimate Productivity
          </h1>
          <p className="text-foreground/70 mt-2 text-lg">Track tasks, time, and achieve your goals</p>
        </header>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <TaskList />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Calendar />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              Analytics coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
