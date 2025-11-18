import createTask, {
  type CreateTaskRequest,
} from "@/fetchers/task/create-task";
import useCreateNotification from "@/hooks/mutations/notification/use-create-notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useCreateTask(workspaceId: string) {
  const queryClient = useQueryClient();
  const { mutateAsync: createNotification } = useCreateNotification();

  return useMutation({
    mutationFn: ({
      title,
      description,
      userId,
      projectId,
      status,
      startDate,
      dueDate,
      priority,
    }: CreateTaskRequest) =>
      createTask(
        title,
        description,
        projectId,
        userId ?? "",
        status,
        startDate ? new Date(startDate) : new Date(),
        dueDate ? new Date(dueDate) : new Date(),
        priority,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      createNotification({
        userId: data.userId,
        title: `New task "${data.title}" created!`,
        content: `Task "${data.title}" has been created in project "${data.project.name}".`,
        type: "info",
        resourceId: data.id,
        resourceType: "task",
        workspaceId,
        projectId: data.projectId,
        taskId: data.id,
      });
    },
  });
}

export default useCreateTask;
