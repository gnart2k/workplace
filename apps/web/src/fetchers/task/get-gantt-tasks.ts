import { client } from "@kaneo/libs";
import { useQuery } from "@tanstack/react-query";

export type GanttTask = {
  id: string;
  title: string;
  status: string;
  startDate: string; // Dates are serialized as strings
  endDate: string | null; // Dates are serialized as strings
  assignee: {
    id: string;
    name: string;
  } | null;
};

async function getGanttTasks(projectId: string): Promise<GanttTask[]> {
  const response = await client.task.tasks[":projectId"].gantt.$get({
    param: { projectId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();

  // The response from the backend is an array of GanttTask objects
  return data as GanttTask[];
}

export function useGanttTasks(projectId: string) {
  return useQuery({
    queryKey: ["gantt-tasks", projectId],
    queryFn: () => getGanttTasks(projectId),
    enabled: !!projectId,
  });
}

export default getGanttTasks;
