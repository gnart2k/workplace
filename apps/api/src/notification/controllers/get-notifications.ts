import { and, asc, desc, eq, sql } from "drizzle-orm";
import db from "../../database";
import { notificationTable, taskTable } from "../../database/schema";

async function getNotifications(
  userId: string,
  workspaceId?: string,
  projectId?: string,
  taskId?: string,
) {
  const notificationsWithTask = await db
    .select({
      notification: notificationTable,
      taskPriority: taskTable.priority,
      taskDueDate: taskTable.dueDate,
    })
    .from(notificationTable)
    .leftJoin(
      taskTable,
      sql`${notificationTable.resourceId} = ${taskTable.id} AND ${notificationTable.resourceType} = 'task'`,
    )
    .where(
      and(
        eq(notificationTable.userId, userId),
        workspaceId
          ? eq(notificationTable.workspaceId, workspaceId)
          : undefined,
        projectId ? eq(notificationTable.projectId, projectId) : undefined,
        taskId ? eq(notificationTable.taskId, taskId) : undefined,
      ),
    )
    .orderBy(
      sql`CASE ${taskTable.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END`,
      asc(taskTable.dueDate),
      desc(notificationTable.createdAt),
    )
    .limit(50);

  type Priority = "low" | "medium" | "high" | "urgent";

  const priorityOrder: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const notifications = notificationsWithTask
    .map((n) => ({
      ...n.notification, // all fields from notification
      taskPriority: n.taskPriority,
      taskDueDate: n.taskDueDate,
    }))
    .sort((a, b) => {
      // Sort by priority first
      const priorityDiff =
        (priorityOrder[b.taskPriority as Priority] || 0) -
        (priorityOrder[a.taskPriority as Priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;

      // If priority is the same, sort by due date (earlier due date first)
      const aTime = a.taskDueDate
        ? new Date(a.taskDueDate).getTime()
        : Number.POSITIVE_INFINITY;
      const bTime = b.taskDueDate
        ? new Date(b.taskDueDate).getTime()
        : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });

  console.log(notifications);
  return notifications;
}

export default getNotifications;
