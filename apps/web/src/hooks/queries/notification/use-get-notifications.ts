import getNotifications from "@/fetchers/notification/get-notifications";
import { useQuery } from "@tanstack/react-query";

function useGetNotifications(
  workspaceId?: string,
  projectId?: string,
  taskId?: string,
) {
  return useQuery({
    queryKey: ["notifications", workspaceId, projectId, taskId],
    queryFn: () => getNotifications(workspaceId, projectId, taskId),
  });
}

export default useGetNotifications;
