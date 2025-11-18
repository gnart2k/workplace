import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTable, taskTable, userTable } from "../../database/schema";

export type GanttTask = {
  id: string;
  title: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  dependencies: string[];
  assignee: {
    id: string;
    name: string;
  } | null;
};

async function getGanttTasks(projectId: string): Promise<GanttTask[]> {
  const project = await db.query.projectTable.findFirst({
    where: eq(projectTable.id, projectId),
  });

  if (!project) {
    throw new HTTPException(404, {
      message: "Project not found",
    });
  }

  const tasks = await db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      status: taskTable.status,
      startDate: taskTable.startDate, // Use the correct start_date column
      endDate: taskTable.dueDate, // Using dueDate as end date
      dependencies: taskTable.dependsOn,
      assigneeId: userTable.id,
      assigneeName: userTable.name,
    })
    .from(taskTable)
    .leftJoin(userTable, eq(taskTable.userId, userTable.id))
    .where(eq(taskTable.projectId, projectId))
    .orderBy(taskTable.createdAt);

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    startDate: task.startDate,
    endDate: task.endDate,
    dependencies: task.dependencies ?? [],
    assignee: task.assigneeId
      ? {
          id: task.assigneeId,
          name: task.assigneeName ?? "Unknown",
        }
      : null,
  }));
}

export default getGanttTasks;
