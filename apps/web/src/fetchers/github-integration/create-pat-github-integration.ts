import type { GithubIntegration } from "@/types/github-integration";
import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type CreatePatGithubIntegrationRequest = InferRequestType<
  (typeof client)["github-integration"]["pat-connect"]["$post"]
>["json"];

export async function createPatGithubIntegration({
  projectId,
  repositoryUrl,
  pat,
}: CreatePatGithubIntegrationRequest): Promise<GithubIntegration> {
  const response = await client["github-integration"]["pat-connect"].$post({
    json: {
      projectId,
      repositoryUrl,
      pat,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error || "Failed to create PAT GitHub integration");
  }

  return response.json();
}
