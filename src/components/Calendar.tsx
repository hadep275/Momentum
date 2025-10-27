import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Task, Habit, TASK_CATEGORIES } from "@/types/task";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface CalendarProps {
  tasks: Task[];
  habits: Habit[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export const Calendar = ({ tasks, habits, onUpdateTasks }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, date));
  };

  const getHabitsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return habits.filter((habit) => habit.daysOfWeek.includes(dayOfWeek));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleToggleTask = (taskId: string) => {
    onUpdateTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateHabits = selectedDate ? getHabitsForDate(selectedDate) : [];
  const selectedDateFormatted = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const getCategoryColor = (categoryId?: string) => {
    const category = TASK_CATEGORIES.find((c) => c.id === categoryId);
    return category?.color || "gold";
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card className="p-4 border-2 border-gold/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-10 w-10 border-gold/30 hover:border-gold hover:bg-gold/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-10 w-10 border-gold/30 hover:border-gold hover:bg-gold/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const dayHabits = getHabitsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-[80px] p-2 rounded-lg border-2 transition-all
                  hover:border-gold/50 hover:shadow-md
                  ${isTodayDate ? "border-gold bg-gold/5" : "border-border"}
                  ${!isCurrentMonth ? "opacity-40" : ""}
                  ${dayTasks.length > 0 || dayHabits.length > 0 ? "bg-accent/10" : ""}
                `}
              >
                <div className="flex flex-col items-start h-full">
                  <span
                    className={`text-sm font-medium ${
                      isTodayDate ? "text-gold" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  
                  {/* Task indicators */}
                  <div className="flex flex-col gap-1 mt-1 w-full">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs truncate px-1 py-0.5 rounded bg-${getCategoryColor(
                          task.categoryId
                        )}/20 text-${getCategoryColor(task.categoryId)}`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                    {dayHabits.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {dayHabits.length} habit{dayHabits.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Date Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>
              View and manage tasks and habits for this date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tasks Section */}
            {selectedDateTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-gold">Tasks</span>
                  <Badge variant="secondary">{selectedDateTasks.length}</Badge>
                </h3>
                <div className="space-y-2">
                  {selectedDateTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="p-4 hover:border-gold/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className={`font-medium ${
                                task.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.categoryId && (
                              <Badge
                                variant="outline"
                                className={`bg-${getCategoryColor(
                                  task.categoryId
                                )}/10`}
                              >
                                {
                                  TASK_CATEGORIES.find(
                                    (c) => c.id === task.categoryId
                                  )?.name
                                }
                              </Badge>
                            )}
                          </div>
                          {task.dueTime && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {task.dueTime}
                            </div>
                          )}
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Habits Section */}
            {selectedDateHabits.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-gold">Habits</span>
                  <Badge variant="secondary">{selectedDateHabits.length}</Badge>
                </h3>
                <div className="space-y-2">
                  {selectedDateHabits.map((habit) => {
                    const isCompletedOnDate = habit.completions.some(
                      (c) => c.date === selectedDateFormatted
                    );
                    return (
                      <Card
                        key={habit.id}
                        className="p-4 hover:border-gold/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              isCompletedOnDate
                                ? "bg-gold"
                                : "bg-muted border-2 border-muted-foreground"
                            }`}
                          />
                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                isCompletedOnDate
                                  ? "text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {habit.title}
                            </p>
                            {habit.time && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                {habit.time}
                              </div>
                            )}
                          </div>
                          {habit.categoryId && (
                            <Badge
                              variant="outline"
                              className={`bg-${getCategoryColor(
                                habit.categoryId
                              )}/10`}
                            >
                              {
                                TASK_CATEGORIES.find(
                                  (c) => c.id === habit.categoryId
                                )?.name
                              }
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {selectedDateTasks.length === 0 && selectedDateHabits.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No tasks or habits scheduled for this date
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
