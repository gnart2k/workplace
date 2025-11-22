import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import db from "../database";
import { taskTable } from "../database/schema";
import { subscribeToEvent } from "../events";
import clearNotifications from "./controllers/clear-notifications";
import createNotification from "./controllers/create-notification";
import getNotifications from "./controllers/get-notifications";
import markAllNotificationsAsRead from "./controllers/mark-all-notifications-as-read";
import markNotificationAsRead from "./controllers/mark-notification-as-read";

const notification = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        workspaceId: z.string().optional(),
        projectId: z.string().optional(),
        taskId: z.string().optional(),
      }),
    ),
    async (c) => {
      const userId = c.get("userId");
      const { workspaceId, projectId, taskId } = c.req.valid("query");
      const notifications = await getNotifications(
        userId,
        workspaceId,
        projectId,
        taskId,
      );
      return c.json(notifications);
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        userId: z.string(),
        title: z.string(),
        content: z.string().optional(),
        type: z.string().optional(),
        resourceId: z.string().optional(),
        resourceType: z.string().optional(),
        workspaceId: z.string().optional(),
        projectId: z.string().optional(),
        taskId: z.string().optional(),
      }),
    ),
    async (c) => {
      const {
        userId,
        title,
        content,
        type,
        resourceId,
        resourceType,
        workspaceId,
        projectId,
        taskId,
      } = c.req.valid("json");

      const notification = await createNotification({
        userId,
        title,
        content,
        type,
        resourceId,
        resourceType,
        workspaceId,
        projectId,
        taskId,
      });

      return c.json(notification);
    },
  )
  .patch(
    "/:id/read",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const notification = await markNotificationAsRead(id);
      return c.json(notification);
    },
  )
  .patch(
    "/read-all",
    zValidator(
      "query",
      z.object({
        workspaceId: z.string().optional(),
        projectId: z.string().optional(),
        taskId: z.string().optional(),
      }),
    ),
    async (c) => {
      const userId = c.get("userId");
      const { workspaceId, projectId, taskId } = c.req.valid("query");
      const result = await markAllNotificationsAsRead(
        userId,
        workspaceId,
        projectId,
        taskId,
      );
      return c.json(result);
    },
  )
  .delete("/clear-all", async (c) => {
    const userId = c.get("userId");
    const result = await clearNotifications(userId);
    return c.json(result);
  });

subscribeToEvent(
  "task.created",
  async ({
    taskId,
    userId,
    title,
    workspaceId,
    projectId,
  }: {
    taskId: string;
    userId: string;
    title?: string;
    type: string;
    content: string;
    workspaceId: string;
    projectId: string;
  }) => {
    if (!userId || !taskId || !workspaceId || !projectId) {
      return;
    }

    await createNotification({
      userId,
      title: "New Task Created",
      content: title ? `Task "${title}" was created` : "A new task was created",
      type: "task",
      resourceId: taskId,
      resourceType: "task",
      workspaceId,
      projectId,
      taskId,
    });
  },
);

subscribeToEvent(
  "workspace.created",
  async ({
    workspaceId,
    ownerId,
    workspaceName,
    projectId,
    taskId,
  }: {
    workspaceId: string;
    ownerId: string;
    workspaceName: string;
    projectId?: string;
    taskId?: string;
  }) => {
    if (!workspaceId || !ownerId) {
      return;
    }

    await createNotification({
      userId: ownerId,
      title: `Workspace "${workspaceName}" created`,
      type: "workspace",
      resourceId: workspaceId,
      resourceType: "workspace",
      workspaceId,
      projectId,
      taskId,
    });
  },
);

subscribeToEvent(
  "task.status_changed",
  async ({
    taskId,
    userId,
    oldStatus,
    newStatus,
    title,
    workspaceId,
    projectId,
  }: {
    taskId: string;
    userId: string | null;
    oldStatus: string;
    newStatus: string;
    title: string;
    workspaceId: string;
    projectId: string;
  }) => {
    if (!taskId || !userId || !workspaceId || !projectId) {
      return;
    }

    await createNotification({
      userId,
      title: `Task "${title}" moved from ${oldStatus.replace(/-/g, " ")} to ${newStatus.replace(/-/g, " ")}`,
      type: "task",
      resourceId: taskId,
      resourceType: "task",
      workspaceId,
      projectId,
      taskId,
    });
  },
);

subscribeToEvent(
  "task.assignee_changed",
  async ({
    taskId,
    newAssignee,
    title,
    workspaceId,
    projectId,
  }: {
    taskId: string;
    newAssignee: string | null;
    title: string;
    workspaceId: string;
    projectId: string;
  }) => {
    if (!taskId || !newAssignee || !workspaceId || !projectId) {
      return;
    }

    await createNotification({
      userId: newAssignee,
      title: "Task Assigned to You",
      content: `You have been assigned to task "${title}"`,
      type: "task",
      resourceId: taskId,
      resourceType: "task",
      workspaceId,
      projectId,
      taskId,
    });
  },
);

subscribeToEvent(
  "time-entry.created",
  async ({
    timeEntryId,
    taskId,
    userId,
    workspaceId,
    projectId,
  }: {
    timeEntryId: string;
    taskId: string;
    userId: string;
    type: string;
    content: string;
    workspaceId: string;
    projectId: string;
  }) => {
    if (!timeEntryId || !taskId || !userId || !workspaceId || !projectId) {
      return;
    }

    const task = await db.query.taskTable.findFirst({
      where: eq(taskTable.id, taskId),
    });

    if (task) {
      await createNotification({
        userId,
        title: "Time Tracking Started",
        content: `You started tracking time for task "${task.title}"`,
        type: "time-entry",
        resourceId: taskId,
        resourceType: "task",
        workspaceId,
        projectId,
        taskId,
      });
    }
  },
);

export default notification;
