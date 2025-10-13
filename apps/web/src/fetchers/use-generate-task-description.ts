import { client } from "@kaneo/libs";
import { useMutation } from "@tanstack/react-query";

export const useGenerateTaskDescription = () => {
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await client.genai["generate-description"].$post({
        json: { title },
      });

      if (!res.ok) {
        throw new Error("Failed to generate task description");
      }

      return res.json();
    },
  });
};
