import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import createTask from "./controllers/create-task";
import deleteTask from "./controllers/delete-task";
import exportTasks from "./controllers/export-tasks";
import getGanttTasks from "./controllers/get-gantt-tasks";
import getTask from "./controllers/get-task";
import getTasks from "./controllers/get-tasks";
import importTasks from "./controllers/import-tasks";
import updateTask from "./controllers/update-task";
import canCreateTask from "./middlewares/can-create-task";
import canUpdateTask from "./middlewares/can-update-task";

const task = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .get(
    "/tasks/:projectId",
    zValidator("param", z.object({ projectId: z.string() })),
    async (c) => {
      const { projectId } = c.req.valid("param");

      const tasks = await getTasks(projectId);

      return c.json(tasks);
    },
  )
  .get(
    "/tasks/:projectId/gantt",
    zValidator("param", z.object({ projectId: z.string() })),
    async (c) => {
      const { projectId } = c.req.valid("param");

      const tasks = await getGanttTasks(projectId);

      return c.json(tasks);
    },
  )
  .post(
    "/:projectId",
    zValidator("param", z.object({ projectId: z.string() })),
    canCreateTask,
    zValidator(
      "json",
      z.object({
        title: z.string(),
        description: z.string(),
        dueDate: z.string(),
        startDate: z.string().optional(),
        priority: z.string(),
        status: z.string(),
        userId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { projectId } = c.req.param();
      const {
        title,
        description,
        dueDate,
        startDate,
        priority,
        status,
        userId,
      } = c.req.valid("json");

      const task = await createTask({
        projectId,
        userId,
        title,
        description,
        dueDate: new Date(dueDate),
        startDate: startDate ? new Date(startDate) : undefined,
        priority,
        status,
      });

      return c.json(task);
    },
  )
  .get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid("param");

    const task = await getTask(id);

    return c.json(task);
  })
  .put(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    canUpdateTask,
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      z.object({
        title: z.string(),
        description: z.string(),
        dueDate: z.string(),
        startDate: z.string(),
        priority: z.string(),
        status: z.string(),
        projectId: z.string(),
        position: z.number(),
        userId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const {
        title,
        description,
        dueDate,
        startDate,
        priority,
        status,
        projectId,
        position,
        userId,
      } = c.req.valid("json");

      const task = await updateTask(
        id,
        title,
        status,
        new Date(dueDate),
        new Date(startDate),
        projectId,
        description,
        priority,
        position,
        userId,
      );

      return c.json(task);
    },
  )
  .get(
    "/export/:projectId",
    zValidator("param", z.object({ projectId: z.string() })),
    async (c) => {
      const { projectId } = c.req.valid("param");

      const exportData = await exportTasks(projectId);

      return c.json(exportData);
    },
  )
  .post(
    "/import/:projectId",
    canCreateTask,
    zValidator("param", z.object({ projectId: z.string() })),
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            title: z.string(),
            description: z.string().optional(),
            status: z.string(),
            priority: z.string().optional(),
            dueDate: z.string().optional(),
            userId: z.string().nullable().optional(),
          }),
        ),
      }),
    ),
    async (c) => {
      const { projectId } = c.req.valid("param");
      const { tasks } = c.req.valid("json");

      const result = await importTasks(projectId, tasks);

      return c.json(result);
    },
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    canUpdateTask,
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid("param");

      const task = await deleteTask(id);

      return c.json(task);
    },
  );
export default task;
