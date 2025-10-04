import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { userTable, workspaceUserTable } from "../../database/schema";

async function getWorkspaceUser(workspaceId: string) {
  const data = await db
    .select({
      id: workspaceUserTable.id,
      workspaceId: workspaceUserTable.workspaceId,
      userId: workspaceUserTable.userId,
      role: workspaceUserTable.role,
      joinAt: workspaceUserTable.joinedAt,
      status: workspaceUserTable.status,
      userName: userTable.name,
    })
    .from(workspaceUserTable)
    .leftJoin(userTable, eq(workspaceUserTable.userId, userTable.id))
    .where(eq(workspaceUserTable.workspaceId, workspaceId));

  if (!data || data.length === 0) {
    throw new HTTPException(404, {
      message: "Workspace user not found",
    });
  }

  return data;
}

export default getWorkspaceUser;
