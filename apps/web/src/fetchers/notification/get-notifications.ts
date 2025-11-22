import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type GetNotificationsRequest = InferRequestType<
  (typeof client)["notification"]["$get"]
>["query"];

async function getNotifications(
  workspaceId?: string,
  projectId?: string,
  taskId?: string,
) {
  const response = await client.notification.$get({
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

export default getNotifications;
