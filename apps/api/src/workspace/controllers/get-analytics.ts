import { eq } from "drizzle-orm";
import db from "../../database";
import { projectTable, taskTable } from "../../database/schema";

export async function getAnalytics(workspaceId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const tasks = await db
    .select({
      status: taskTable.status,
      createdAt: taskTable.createdAt,
      dueDate: taskTable.dueDate,
    })
    .from(taskTable)
    .leftJoin(projectTable, eq(taskTable.projectId, projectTable.id))
    .where(eq(projectTable.workspaceId, workspaceId));

  // 1. Tasks completed in the last 30 days
  const tasksCompletedLast30Days = tasks.filter(
    (task) =>
      task.status === "done" &&
      task.createdAt &&
      task.createdAt >= thirtyDaysAgo,
  );

  const tasksCompletedData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return { day, tasks: 0 };
  }).reverse();

  for (const task of tasksCompletedLast30Days) {
    if (task.createdAt) {
      const day = task.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const index = tasksCompletedData.findIndex((d) => d.day === day);
      if (index !== -1) {
        tasksCompletedData[index].tasks++;
      }
    }
  }

  // 2. Task status distribution
  const taskStatusDistribution = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const taskStatusData = Object.entries(taskStatusDistribution).map(
    ([name, value]) => ({
      name,
      value,
      color: getStatusColor(name),
    }),
  );

  // 3. Resolved vs. Remaining Tasks
  const resolvedTasks = tasks.filter((task) => task.status === "done").length;
  const remainingTasks = tasks.length - resolvedTasks;
  const resolvedVsRemainingData = [
    { name: "Resolved", value: resolvedTasks, color: "#22c55e" },
    { name: "Remaining", value: remainingTasks, color: "#a1a1aa" },
  ];

  // 4. Overdue Tasks
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate && task.dueDate < new Date() && task.status !== "done",
  ).length;
  const onTimeTasks = tasks.length - overdueTasks;
  const overdueTasksData = [
    { name: "Overdue", value: overdueTasks, color: "#ef4444" },
    { name: "On Time", value: onTimeTasks, color: "#22c55e" },
  ];

  return {
    tasksCompletedData,
    taskStatusData,
    resolvedVsRemainingData,
    overdueTasksData,
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "to-do":
      return "#a1a1aa";
    case "in-progress":
      return "#3b82f6";
    case "done":
      return "#22c55e";
    case "canceled":
      return "#ef4444";
    default:
      return "#a1a1aa";
  }
}
