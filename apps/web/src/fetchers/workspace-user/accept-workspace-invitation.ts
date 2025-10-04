import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type AcceptWorkspaceInvitationRequest = InferRequestType<
  (typeof client)["workspace-user"][":userId"]["$put"]
>["json"] &
  InferRequestType<
    (typeof client)["workspace-user"][":userId"]["$put"]
  >["param"];

const acceptWorkspaceInvitation = async ({
  userId,
  status,
}: AcceptWorkspaceInvitationRequest) => {
  const response = await client["workspace-user"][":userId"].$put({
    json: { status },
    param: { userId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();
  return data;
};

export default acceptWorkspaceInvitation;
