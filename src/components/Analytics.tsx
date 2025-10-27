import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Task, Habit, TASK_CATEGORIES } from "@/types/task";
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  format,
  isWithinInterval,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, CheckCircle2, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsProps {
  tasks: Task[];
  habits: Habit[];
}

type DateRangePreset = "7d" | "1m" | "6m" | "12m" | "all" | "custom";

const CHART_COLORS = [
  "hsl(var(--gold))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--muted))",
];

export const Analytics = ({ tasks, habits }: AnalyticsProps) => {
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("7d");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (dateRangePreset) {
      case "7d":
        start = startOfDay(subDays(now, 6));
        break;
      case "1m":
        start = startOfDay(subMonths(now, 1));
        break;
      case "6m":
        start = startOfDay(subMonths(now, 6));
        break;
      case "12m":
        start = startOfDay(subMonths(now, 12));
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          start = startOfDay(customStartDate);
          end = endOfDay(customEndDate);
        } else {
          start = startOfDay(subDays(now, 6));
        }
        break;
      case "all":
      default:
        // Get earliest date from tasks or habits
        const allDates = [
          ...tasks.map((t) => t.createdAt),
          ...habits.map((h) => h.createdAt),
        ];
        start = allDates.length > 0 
          ? startOfDay(new Date(Math.min(...allDates.map(d => d.getTime()))))
          : startOfDay(subMonths(now, 1));
        break;
    }

    return { start, end };
  }, [dateRangePreset, customStartDate, customEndDate, tasks, habits]);

  // Filter tasks and habits by date range
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isWithinInterval(task.dueDate, dateRange);
    });
  }, [tasks, dateRange]);

  // Task completion trend data
  const completionTrendData = useMemo(() => {
    const days = eachDayOfInterval(dateRange);
    return days.map((day) => {
      const dayTasks = filteredTasks.filter(
        (task) => task.dueDate && isSameDay(task.dueDate, day)
      );
      const completed = dayTasks.filter((t) => t.completed).length;
      const total = dayTasks.length;

      return {
        date: format(day, "MMM dd"),
        completed,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [filteredTasks, dateRange]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    
    filteredTasks.forEach((task) => {
      if (task.categoryId) {
        categoryCounts[task.categoryId] = (categoryCounts[task.categoryId] || 0) + 1;
      }
    });

    return TASK_CATEGORIES.filter((cat) => categoryCounts[cat.id] > 0).map(
      (cat, index) => ({
        name: cat.name,
        value: categoryCounts[cat.id],
        color: CHART_COLORS[index % CHART_COLORS.length],
      })
    );
  }, [filteredTasks]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    const priorities = { high: 0, medium: 0, low: 0 };
    
    filteredTasks.forEach((task) => {
      priorities[task.priority]++;
    });

    return [
      { name: "High", value: priorities.high, color: CHART_COLORS[0] },
      { name: "Medium", value: priorities.medium, color: CHART_COLORS[1] },
      { name: "Low", value: priorities.low, color: CHART_COLORS[2] },
    ].filter((p) => p.value > 0);
  }, [filteredTasks]);

  // Productivity by day of week
  const dayOfWeekData = useMemo(() => {
    const dayTasks: Record<number, { completed: number; total: number }> = {
      0: { completed: 0, total: 0 },
      1: { completed: 0, total: 0 },
      2: { completed: 0, total: 0 },
      3: { completed: 0, total: 0 },
      4: { completed: 0, total: 0 },
      5: { completed: 0, total: 0 },
      6: { completed: 0, total: 0 },
    };

    filteredTasks.forEach((task) => {
      if (task.dueDate) {
        const dayOfWeek = task.dueDate.getDay();
        dayTasks[dayOfWeek].total++;
        if (task.completed) dayTasks[dayOfWeek].completed++;
      }
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames.map((name, index) => ({
      day: name,
      completed: dayTasks[index].completed,
      total: dayTasks[index].total,
      rate: dayTasks[index].total > 0 
        ? Math.round((dayTasks[index].completed / dayTasks[index].total) * 100)
        : 0,
    }));
  }, [filteredTasks]);

  // Habit completion data
  const habitCompletionData = useMemo(() => {
    return habits.map((habit) => {
      const completionsInRange = habit.completions.filter((c) => {
        const completionDate = new Date(c.date);
        return isWithinInterval(completionDate, dateRange);
      });

      // Calculate potential completions based on days of week
      const daysInRange = eachDayOfInterval(dateRange);
      const potentialDays = daysInRange.filter((day) =>
        habit.daysOfWeek.includes(day.getDay())
      ).length;

      return {
        name: habit.title,
        completed: completionsInRange.length,
        potential: potentialDays,
        rate: potentialDays > 0 
          ? Math.round((completionsInRange.length / potentialDays) * 100)
          : 0,
      };
    }).filter((h) => h.potential > 0);
  }, [habits, dateRange]);

  // Summary stats
  const stats = useMemo(() => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter((t) => t.completed).length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    const totalHabitCompletions = habits.reduce((sum, habit) => {
      return sum + habit.completions.filter((c) => {
        const completionDate = new Date(c.date);
        return isWithinInterval(completionDate, dateRange);
      }).length;
    }, 0);

    // Calculate longest habit streak
    let longestStreak = 0;
    habits.forEach((habit) => {
      const sortedCompletions = [...habit.completions]
        .map((c) => new Date(c.date))
        .sort((a, b) => a.getTime() - b.getTime());

      let currentStreak = 0;
      let maxStreak = 0;

      for (let i = 0; i < sortedCompletions.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const dayDiff = Math.floor(
            (sortedCompletions[i].getTime() - sortedCompletions[i - 1].getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      }

      longestStreak = Math.max(longestStreak, maxStreak);
    });

    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalHabitCompletions,
      longestStreak,
    };
  }, [filteredTasks, habits, dateRange]);

  const DateRangeButton = ({
    preset,
    label,
  }: {
    preset: DateRangePreset;
    label: string;
  }) => (
    <Button
      variant={dateRangePreset === preset ? "default" : "outline"}
      size="sm"
      onClick={() => setDateRangePreset(preset)}
      className={cn(
        "transition-all",
        dateRangePreset === preset && "bg-gold hover:bg-gold/90"
      )}
    >
      {label}
    </Button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gold mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Track your progress and insights
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4 border-2 border-gold/20">
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeButton preset="7d" label="7 Days" />
          <DateRangeButton preset="1m" label="1 Month" />
          <DateRangeButton preset="6m" label="6 Months" />
          <DateRangeButton preset="12m" label="12 Months" />
          <DateRangeButton preset="all" label="All Time" />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={dateRangePreset === "custom" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-2",
                  dateRangePreset === "custom" && "bg-gold hover:bg-gold/90"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                Custom
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => {
                      setCustomStartDate(date);
                      setDateRangePreset("custom");
                    }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">End Date</Label>
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => {
                      setCustomEndDate(date);
                      setDateRangePreset("custom");
                    }}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="ml-auto text-sm text-muted-foreground">
            {format(dateRange.start, "MMM dd, yyyy")} -{" "}
            {format(dateRange.end, "MMM dd, yyyy")}
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-2 border-gold/20 hover:border-gold/40 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gold/10">
              <Target className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold text-gold">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-gold/20 hover:border-gold/40 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gold/10">
              <TrendingUp className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-gold">{stats.completionRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-gold/20 hover:border-gold/40 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gold/10">
              <CheckCircle2 className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Habits Completed</p>
              <p className="text-2xl font-bold text-gold">
                {stats.totalHabitCompletions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-gold/20 hover:border-gold/40 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gold/10">
              <Flame className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-bold text-gold">
                {stats.longestStreak} days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <Card className="p-6 border-2 border-gold/20">
          <h3 className="text-lg font-semibold mb-4 text-gold">
            Task Completion Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={completionTrendData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--gold))"
                fillOpacity={1}
                fill="url(#colorCompleted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <Card className="p-6 border-2 border-gold/20">
            <h3 className="text-lg font-semibold mb-4 text-gold">
              Tasks by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Priority Breakdown */}
        {priorityData.length > 0 && (
          <Card className="p-6 border-2 border-gold/20">
            <h3 className="text-lg font-semibold mb-4 text-gold">
              Tasks by Priority
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Productivity by Day of Week */}
        <Card className="p-6 border-2 border-gold/20">
          <h3 className="text-lg font-semibold mb-4 text-gold">
            Productivity by Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="completed" fill="hsl(var(--gold))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Habit Completion Rates */}
        {habitCompletionData.length > 0 && (
          <Card className="p-6 border-2 border-gold/20 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gold">
              Habit Completion Rates
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={habitCompletionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="rate" fill="hsl(var(--gold))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
};
