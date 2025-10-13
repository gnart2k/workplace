import WorkspaceLayout from "@/components/common/workspace-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import useGetAnalytics from "@/hooks/queries/analytics/use-get-analytics";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/analytics",
)({
  component: Analytics,
});

const tasksCompletedConfig = {
  tasks: {
    label: "Tasks",
    color: "#2563eb",
  },
};

type ChartEntry = { name: string; value: number; color: string };

function Analytics() {
  const { workspaceId } = Route.useParams();
  const { data: analytics, isLoading } = useGetAnalytics(workspaceId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!analytics) {
    return null;
  }

  const {
    tasksCompletedData,
    taskStatusData,
    resolvedVsRemainingData,
    overdueTasksData,
  } = analytics;

  return (
    <WorkspaceLayout title="Analytics">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed</CardTitle>
            <CardDescription>Monthly tasks completed</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={tasksCompletedConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart accessibilityLayer data={tasksCompletedData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current task status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[200px] w-full">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {taskStatusData.map((entry: ChartEntry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved vs. Remaining Tasks</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[200px] w-full">
              <PieChart>
                <Pie
                  data={resolvedVsRemainingData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                >
                  {resolvedVsRemainingData.map((entry: ChartEntry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue Tasks</CardTitle>
            <CardDescription>Percentage of overdue tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[200px] w-full">
              <PieChart>
                <Pie
                  data={overdueTasksData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {overdueTasksData.map((entry: ChartEntry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </WorkspaceLayout>
  );
}
