import createNotification, {
  type CreateNotificationRequest,
} from "@/fetchers/notification/create-notification";
import { useMutation } from "@tanstack/react-query";

function useCreateNotification() {
  return useMutation({
    mutationFn: ({
      userId,
      title,
      content,
      type,
      resourceId,
      resourceType,
      workspaceId,
      projectId,
      taskId,
    }: CreateNotificationRequest) =>
      createNotification(
        userId,
        title,
        content,
        type,
        resourceId,
        resourceType,
        workspaceId,
        projectId,
        taskId,
      ),
  });
}

export default useCreateNotification;
