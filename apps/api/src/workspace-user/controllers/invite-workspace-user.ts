import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  userTable,
  workspaceTable,
  workspaceUserTable,
} from "../../database/schema";

async function inviteWorkspaceUser(workspaceId: string, email: string) {
  const [workspace] = await db
    .select()
    .from(workspaceTable)
    .where(eq(workspaceTable.id, workspaceId));

  if (!workspace) {
    throw new HTTPException(404, { message: "Workspace not found" });
  }

  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  const [existingUser] = await db
    .select()
    .from(workspaceUserTable)
    .where(
      and(
        eq(workspaceUserTable.workspaceId, workspaceId),
        eq(workspaceUserTable.userId, user.id),
      ),
    );

  if (existingUser) {
    throw new HTTPException(400, { message: "User is already invited" });
  }

  const [invitedUser] = await db
    .insert(workspaceUserTable)
    .values({
      userId: user.id,
      workspaceId,
    })
    .returning();

  return invitedUser;
}

export default inviteWorkspaceUser;
