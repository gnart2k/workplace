import { client } from "@kaneo/libs";

async function getAnalytics(workspaceId: string) {
  const response = await client.workspace[":workspaceId"].analytics.$get({
    param: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();

  return data;
}

export default getAnalytics;
