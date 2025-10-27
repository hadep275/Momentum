import { Calendar } from "@/components/Calendar";
import { TaskList } from "@/components/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodo, CalendarDays, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 border-b-2 border-gold pb-6">
          <h1 className="text-5xl font-bold text-gold drop-shadow-lg">
            Momentum
          </h1>
          <p className="text-foreground mt-2 text-lg">Build your best self, one task at a time</p>
        </header>

        <Tabs defaultValue="tasks" className="w-full">
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

          {/* Fixed Bottom Navigation */}
          <TabsList className="fixed bottom-0 left-0 right-0 grid grid-cols-3 h-16 rounded-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <TabsTrigger value="tasks" className="h-full">
              <ListTodo className="h-6 w-6" />
            </TabsTrigger>
            <TabsTrigger value="calendar" className="h-full">
              <CalendarDays className="h-6 w-6" />
            </TabsTrigger>
            <TabsTrigger value="analytics" className="h-full">
              <BarChart3 className="h-6 w-6" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
