import markAllNotificationsAsRead from "@/fetchers/notification/mark-all-notifications-as-read";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useMarkAllNotificationsAsRead(
  workspaceId?: string,
  projectId?: string,
  taskId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      markAllNotificationsAsRead(workspaceId, projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", workspaceId, projectId, taskId],
      });
    },
  });
}

export default useMarkAllNotificationsAsRead;
