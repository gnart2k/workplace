import { createId } from "@paralleldrive/cuid2";
import db from "../../database";
import { notificationTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function createNotification({
  userId,
  title,
  content,
  type,
  resourceId,
  resourceType,
  workspaceId,
  projectId,
  taskId,
}: {
  userId: string;
  title: string;
  content?: string;
  type?: string;
  resourceId?: string;
  resourceType?: string;
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
}) {
  const [notification] = await db
    .insert(notificationTable)
    .values({
      id: createId(),
      userId,
      title,
      content: content || "",
      type: type || "info",
      resourceId: resourceId || null,
      resourceType: resourceType || null,
      workspaceId: workspaceId || null,
      projectId: projectId || null,
      taskId: taskId || null,
    })
    .returning();

  if (notification) {
    await publishEvent("notification.created", {
      notificationId: notification.id,
      userId,
    });
  }

  return notification;
}

export default createNotification;
