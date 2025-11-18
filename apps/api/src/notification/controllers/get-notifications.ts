import { asc, desc, eq, sql } from "drizzle-orm";
import db from "../../database";
import { notificationTable, taskTable } from "../../database/schema";

async function getNotifications(userId: string) {
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
    .where(eq(notificationTable.userId, userId))
    .orderBy(
      sql`CASE ${taskTable.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END`,
      asc(taskTable.dueDate),
      desc(notificationTable.createdAt),
    )
    .limit(50);

  const notifications = notificationsWithTask.map((n) => n.notification);

  return notifications;
}

export default getNotifications;
