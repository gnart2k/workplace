import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type MarkAllNotificationsAsReadRequest = InferRequestType<
  (typeof client)["notification"]["read-all"]["$patch"]
>["query"];

async function markAllNotificationsAsRead(
  workspaceId?: string,
  projectId?: string,
  taskId?: string,
) {
  const response = await client.notification["read-all"].$patch({
    query: {
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

export default markAllNotificationsAsRead;
