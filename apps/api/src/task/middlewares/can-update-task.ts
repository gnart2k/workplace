import { eq } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTable, taskTable, workspaceTable } from "../../database/schema";

const canUpdateTask: MiddlewareHandler<{
  Variables: { userId: string };
  Params: { id: string };
}> = async (c, next) => {
  const userId = c.get("userId");
  const { id } = c.req.param() as { id: string };

  const [task] = await db
    .select({
      userId: taskTable.userId,
      projectId: taskTable.projectId,
    })
    .from(taskTable)
    .where(eq(taskTable.id, id));

  if (!task) {
    throw new HTTPException(404, {
      message: "Task not found",
    });
  }

  const [project] = await db
    .select({
      ownerId: workspaceTable.ownerId,
    })
    .from(projectTable)
    .leftJoin(workspaceTable, eq(projectTable.workspaceId, workspaceTable.id))
    .where(eq(projectTable.id, task.projectId));

  if (!project) {
    throw new HTTPException(404, {
      message: "Project not found",
    });
  }

  if (task.userId !== userId && project.ownerId !== userId) {
    throw new HTTPException(403, {
      message: "You do not have permission to update this task",
    });
  }

  await next();
};

export default canUpdateTask;
