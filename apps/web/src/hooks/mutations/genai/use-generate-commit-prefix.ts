import { client } from "@kaneo/libs";
import { useMutation } from "@tanstack/react-query";

export const useGenerateCommitPrefix = () => {
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await client.genai["generate-prefix"].$post({
        json: { title },
      });

      if (!res.ok) {
        throw new Error("Failed to generate commit prefix");
      }

      return res.json();
    },
  });
};
