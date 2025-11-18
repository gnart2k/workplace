import { and, eq } from "drizzle-orm";
import db from "../../database";
import { notificationTable } from "../../database/schema";

async function markAllNotificationsAsRead(
  userId: string,
  workspaceId?: string,
  projectId?: string,
  taskId?: string,
) {
  await db
    .update(notificationTable)
    .set({ isRead: true })
    .where(
      and(
        eq(notificationTable.userId, userId),
        workspaceId
          ? eq(notificationTable.workspaceId, workspaceId)
          : undefined,
        projectId ? eq(notificationTable.projectId, projectId) : undefined,
        taskId ? eq(notificationTable.taskId, taskId) : undefined,
      ),
    );

  return { success: true };
}

export default markAllNotificationsAsRead;
