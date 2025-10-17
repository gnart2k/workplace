import ProjectLayout from "@/components/common/project-layout";
import GanttChart from "@/components/task/GanttChart";
import { useGanttTasks } from "@/fetchers/task/get-gantt-tasks";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/gantt",
)({
  component: GanttRouteComponent,
});

function GanttRouteComponent() {
  const { projectId, workspaceId } = Route.useParams();
  const { data, isLoading, isError } = useGanttTasks(projectId);

  return (
    <ProjectLayout
      title="Gantt Chart"
      projectId={projectId}
      workspaceId={workspaceId}
    >
      <div className="flex-1 overflow-hidden h-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : isError || !data ? (
          <div className="flex h-full items-center justify-center text-red-500">
            Failed to load Gantt data.
          </div>
        ) : (
          <GanttChart tasks={data} />
        )}
      </div>
    </ProjectLayout>
  );
}
