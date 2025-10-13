import {
  type CreatePatGithubIntegrationRequest,
  createPatGithubIntegration,
} from "@/fetchers/github-integration/create-pat-github-integration";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreatePatGithubIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatGithubIntegrationRequest) =>
      createPatGithubIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["githubIntegration"],
      });
    },
  });
}
