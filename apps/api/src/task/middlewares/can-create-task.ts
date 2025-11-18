import { eq } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTable, workspaceTable } from "../../database/schema";

const canCreateTask: MiddlewareHandler<{
  Variables: { userId: string };
  Params: { projectId: string };
}> = async (c, next) => {
  const userId = c.get("userId");
  const { projectId } = c.req.param() as { projectId: string };

  const [project] = await db
    .select({
      ownerId: workspaceTable.ownerId,
    })
    .from(projectTable)
    .leftJoin(workspaceTable, eq(projectTable.workspaceId, workspaceTable.id))
    .where(eq(projectTable.id, projectId));

  if (!project) {
    throw new HTTPException(404, {
      message: "Project not found",
    });
  }

  if (project.ownerId !== userId) {
    throw new HTTPException(403, {
      message: "You do not have permission to create a task in this project",
    });
  }

  await next();
};

export default canCreateTask;
