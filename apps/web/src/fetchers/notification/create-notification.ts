import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type CreateNotificationRequest = InferRequestType<
  (typeof client)["notification"]["$post"]
>["json"];

async function createNotification(
  userId: string,
  title: string,
  content?: string,
  type?: string,
  resourceId?: string,
  resourceType?: string,
  workspaceId?: string,
  projectId?: string,
  taskId?: string,
) {
  const response = await client.notification.$post({
    json: {
      userId,
      title,
      content,
      type,
      resourceId,
      resourceType,
      workspaceId,
      projectId,
      taskId,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();

  return data;
}

export default createNotification;
