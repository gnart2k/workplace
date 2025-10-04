import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { subscribeToEvent } from "../events";
import createRootWorkspaceUser from "./controllers/create-root-workspace-user";
import deleteWorkspaceUser from "./controllers/delete-workspace-user";
import getActiveWorkspaceUsers from "./controllers/get-active-workspace-users";
import getWorkspaceUser from "./controllers/get-workspace-user";
import getWorkspaceUsers from "./controllers/get-workspace-users";
import inviteWorkspaceUser from "./controllers/invite-workspace-user";
import updateWorkspaceUser from "./controllers/update-workspace-user";

const workspaceUser = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid("param");
    console.log("[GET /:id] params:", { id });

    const workspaceUser = await getWorkspaceUser(id);

    console.log("[GET /:id] result:", workspaceUser);
    return c.json(workspaceUser);
  })
  .post(
    "/root",
    zValidator(
      "json",
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
      }),
    ),
    async (c) => {
      const { workspaceId, userId } = c.req.valid("json");
      console.log("[POST /root] body:", { workspaceId, userId });

      const workspaceUser = await createRootWorkspaceUser(workspaceId, userId);

      console.log("[POST /root] result:", workspaceUser);
      return c.json(workspaceUser);
    },
  )
  .get(
    "/:workspaceId",
    zValidator("param", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      console.log("[GET /:workspaceId] params:", { workspaceId });

      const workspaceUsers = await getWorkspaceUsers(workspaceId);

      console.log("[GET /:workspaceId] result:", workspaceUsers);
      return c.json(workspaceUsers);
    },
  )
  .delete(
    "/:workspaceId",
    zValidator("param", z.object({ workspaceId: z.string() })),
    zValidator("query", z.object({ userId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const { userId } = c.req.valid("query");
      console.log("[DELETE /:workspaceId] params/query:", {
        workspaceId,
        userId,
      });

      const deletedWorkspaceUser = await deleteWorkspaceUser(
        workspaceId,
        userId,
      );

      console.log("[DELETE /:workspaceId] result:", deletedWorkspaceUser);
      return c.json(deletedWorkspaceUser);
    },
  )
  .put(
    "/:userId",
    zValidator("param", z.object({ userId: z.string() })),
    zValidator("json", z.object({ status: z.string() })),
    async (c) => {
      const { userId } = c.req.valid("param");
      const { status } = c.req.valid("json");
      console.log("[PUT /:userId] params/body:", { userId, status });

      const updatedWorkspaceUser = await updateWorkspaceUser(userId, status);

      console.log("[PUT /:userId] result:", updatedWorkspaceUser);
      return c.json(updatedWorkspaceUser);
    },
  )
  .get(
    "/:workspaceId/active",
    zValidator("param", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      console.log("[GET /:workspaceId/active] params:", { workspaceId });

      const activeWorkspaceUsers = await getActiveWorkspaceUsers(workspaceId);

      console.log("[GET /:workspaceId/active] result:", activeWorkspaceUsers);
      return c.json(activeWorkspaceUsers);
    },
  )
  .post(
    "/:workspaceId/invite",
    zValidator("param", z.object({ workspaceId: z.string() })),
    zValidator("json", z.object({ userId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const { userId } = c.req.valid("json");
      console.log("[POST /:workspaceId/invite] params/body:", {
        workspaceId,
        userId,
      });

      const workspaceUser = await inviteWorkspaceUser(workspaceId, userId);

      console.log("[POST /:workspaceId/invite] result:", workspaceUser);
      return c.json(workspaceUser);
    },
  )
  .delete(
    "/:workspaceId/invite/:userId",
    zValidator(
      "param",
      z.object({ workspaceId: z.string(), userId: z.string() }),
    ),
    async (c) => {
      const { workspaceId, userId } = c.req.valid("param");
      console.log("[DELETE /:workspaceId/invite/:userId] params:", {
        workspaceId,
        userId,
      });

      const deletedWorkspaceUser = await deleteWorkspaceUser(
        workspaceId,
        userId,
      );

      console.log(
        "[DELETE /:workspaceId/invite/:userId] result:",
        deletedWorkspaceUser,
      );
      return c.json(deletedWorkspaceUser);
    },
  );

subscribeToEvent("user.signed_up", async ({ email }: { email: string }) => {
  console.log("[EVENT user.signed_up] triggered with:", { email });
  if (!email) {
    return;
  }

  const result = await updateWorkspaceUser(email, "active");
  console.log("[EVENT user.signed_up] update result:", result);
});

subscribeToEvent(
  "workspace.created",
  async ({
    workspaceId,
    ownerId,
  }: { workspaceId: string; ownerId: string }) => {
    console.log("[EVENT workspace.created] triggered with:", {
      workspaceId,
      ownerId,
    });
    if (!workspaceId || !ownerId) {
      return;
    }

    const result = await createRootWorkspaceUser(workspaceId, ownerId);
    console.log(
      "[EVENT workspace.created] createRootWorkspaceUser result:",
      result,
    );
  },
);

export default workspaceUser;
