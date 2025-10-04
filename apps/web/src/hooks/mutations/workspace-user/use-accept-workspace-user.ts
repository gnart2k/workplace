import { useMutation } from "@tanstack/react-query";

import acceptWorkspaceInvitation, {
  type AcceptWorkspaceInvitationRequest,
} from "@/fetchers/workspace-user/accept-workspace-invitation";

function useAcceptWorkspaceUser() {
  return useMutation({
    mutationFn: ({ userId, status }: AcceptWorkspaceInvitationRequest) =>
      acceptWorkspaceInvitation({ userId, status }),
  });
}

export default useAcceptWorkspaceUser;
