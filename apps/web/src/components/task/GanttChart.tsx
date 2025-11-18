import { Gantt, type Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import type { GanttTask } from "@/fetchers/task/get-gantt-tasks";
import { useMemo } from "react";

// Helper function to map backend status to a color/style
const getTaskStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "done":
    case "completed":
      return {
        backgroundColor: "hsl(142.1 76.2% 36.3%)", // Green
        backgroundSelectedColor: "hsl(142.1 76.2% 36.3% / 0.8)",
        progressColor: "hsl(142.1 76.2% 36.3%)",
        progressSelectedColor: "hsl(142.1 76.2% 36.3% / 0.8)",
      };
    case "in-progress":
    case "in progress":
      return {
        backgroundColor: "hsl(217.2 91.2% 59.8%)", // Blue
        backgroundSelectedColor: "hsl(217.2 91.2% 59.8% / 0.8)",
        progressColor: "hsl(217.2 91.2% 59.8%)",
        progressSelectedColor: "hsl(217.2 91.2% 59.8% / 0.8)",
      };
    default:
      return {
        backgroundColor: "hsl(210 40% 96.1%)", // Gray/To-do
        backgroundSelectedColor: "hsl(210 40% 96.1% / 0.8)",
        progressColor: "hsl(210 40% 96.1%)",
        progressSelectedColor: "hsl(210 40% 96.1% / 0.8)",
      };
  }
};

interface GanttChartProps {
  tasks: GanttTask[];
}

export default function GanttChart({ tasks }: GanttChartProps) {
  const ganttTasks: Task[] = useMemo(() => {
    const safeDate = (value: string, fallback: Date = new Date()) => {
      try {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? fallback : d;
      } catch {
        return fallback;
      }
    };

    return tasks
      .filter((t) => {
        if (!t.startDate || !t.endDate) return false;

        const sd = new Date(t.startDate);
        const ed = new Date(t.endDate);

        return (
          !Number.isNaN(sd.getTime()) &&
          !Number.isNaN(ed.getTime()) &&
          ed.getTime() >= sd.getTime()
        );
      })
      .map((task) => {
        const startDate = safeDate(task.startDate as string);
        const endDate = safeDate(task.endDate as string, startDate);

        const isCompleted =
          task.status?.toLowerCase() === "done" ||
          task.status?.toLowerCase() === "completed";

        return {
          start: startDate,
          end: endDate,
          name: task.title ?? "Untitled task",
          id: task.id ?? crypto.randomUUID(),
          type: "task",
          progress: isCompleted ? 100 : 0,
          isDisabled: false,
          styles: getTaskStyle(task.status),
          project: task.assignee?.name || "Unassigned",
          displayOrder: 1,
        };
      });
  }, [tasks]);

  console.log(ganttTasks);

  if (ganttTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-zinc-50 dark:bg-zinc-900/50 border-t border-border">
        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          No tasks with dates found.
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Add due dates to your tasks to see them on the Gantt chart.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-0 overflow-auto">
      <div className="w-full min-w-full h-full">
        <Gantt
          tasks={ganttTasks}
          viewMode={ViewMode.Day}
          listCellWidth="200px"
          columnWidth={60}
          fontFamily="Inter, sans-serif"
          locale="en-GB"
          todayColor="hsl(217.2 91.2% 59.8% / 0.2)"
        />
      </div>
    </div>
  );
}
