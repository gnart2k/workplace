import { client } from "@kaneo/libs";
import { useQuery } from "@tanstack/react-query";

import type Task from "@/types/task";
import type { GanttApiTask } from "@/types/task";

async function getGanttTasks(projectId: string): Promise<GanttApiTask[]> {
  const response = await client.task.tasks[":projectId"].gantt.$get({
    param: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();

  // The response from the backend is an array of GanttTask objects
  return data as GanttApiTask[];
}

export function useGanttTasks(projectId: string) {
  return useQuery({
    queryKey: ["gantt-tasks", projectId],
    queryFn: () => getGanttTasks(projectId),
    enabled: !!projectId,
  });
}

export default getGanttTasks;
