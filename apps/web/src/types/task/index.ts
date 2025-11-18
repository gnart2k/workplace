import type { client } from "@kaneo/libs";
import type { InferResponseType } from "hono/client";

type Task = Extract<
  InferResponseType<
    (typeof client)["task"]["tasks"][":projectId"]["$get"]
  >["columns"][number]["tasks"][number],
  { id: string }
>;

// Define the type for tasks returned by the Gantt API
export type GanttApiTask = {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  dependencies: string[];
  assignee: { id: string; name: string } | null;
};

export default Task;
