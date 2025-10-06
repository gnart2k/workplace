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

const tasksCompletedData = [
  { month: "Jan", tasks: 50 },
  { month: "Feb", tasks: 75 },
  { month: "Mar", tasks: 60 },
  { month: "Apr", tasks: 80 },
  { month: "May", tasks: 90 },
  { month: "Jun", tasks: 70 },
];

const tasksCompletedConfig = {
  tasks: {
    label: "Tasks",
    color: "#2563eb",
  },
};

const taskStatusData = [
  { name: "Todo", value: 400, color: "#a1a1aa" },
  { name: "In Progress", value: 300, color: "#3b82f6" },
  { name: "Done", value: 200, color: "#22c55e" },
  { name: "Canceled", value: 100, color: "#ef4444" },
];

const resolvedVsRemainingData = [
  { name: "Resolved", value: 650, color: "#22c55e" },
  { name: "Remaining", value: 350, color: "#a1a1aa" },
];

const overdueTasksData = [
  { name: "Overdue", value: 15, color: "#ef4444" },
  { name: "On Time", value: 85, color: "#22c55e" },
];

function Analytics() {
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
                  dataKey="month"
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
                  {taskStatusData.map((entry) => (
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
                  {resolvedVsRemainingData.map((entry) => (
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
                  {overdueTasksData.map((entry) => (
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
