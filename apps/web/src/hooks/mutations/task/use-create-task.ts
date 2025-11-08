import createTask, {
  type CreateTaskRequest,
} from "@/fetchers/task/create-task";
import { useMutation } from "@tanstack/react-query";

function useCreateTask() {
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
        new Date(startDate),
        new Date(dueDate),
        priority,
      ),
  });
}

export default useCreateTask;
