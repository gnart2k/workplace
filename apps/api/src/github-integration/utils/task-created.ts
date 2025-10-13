import { eq } from "drizzle-orm";
import db from "../../database";
import { taskTable } from "../../database/schema";
import { addLabelsToIssue } from "./create-github-labels";
import { getOctokitInstance } from "./get-octokit-instance";

export async function handleTaskCreated(data: {
  taskId: string;
  userId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  number: number;
  projectId: string;
}) {
  const { taskId, userId, title, description, priority, status, projectId } =
    data;

  if (description?.includes("Created from GitHub issue:")) {
    console.log(
      "Skipping GitHub issue creation for task created from GitHub issue:",
      taskId,
    );
    return;
  }

  try {
    const octokitInstance = await getOctokitInstance(projectId);

    if (!octokitInstance) {
      console.log("No active GitHub integration found for project:", projectId);
      return;
    }

    const {
      octokit,
      owner: repositoryOwner,
      repo: repositoryName,
    } = octokitInstance;

    console.log(
      "Creating GitHub issue for repository:",
      `${repositoryOwner}/${repositoryName}`,
    );

    const createdIssue = await octokit.rest.issues.create({
      owner: repositoryOwner,
      repo: repositoryName,
      title: `[Kaneo] ${title}`,
      body: `**Task created in Kaneo**

**Description:** ${description || "No description provided"}

**Details:**
- Task ID: ${taskId}
- Status: ${status}
- Priority: ${priority || "Not set"}
- Assigned to: ${userId || "Unassigned"}

---
*This issue was automatically created from Kaneo task management system.*`,
    });

    const labelsToAdd = [
      "kaneo",
      `priority:${priority || "low"}`,
      `status:${status}`,
    ];
    await addLabelsToIssue(
      octokit,
      repositoryOwner,
      repositoryName,
      createdIssue.data.number,
      labelsToAdd,
    );

    try {
      await db
        .update(taskTable)
        .set({
          description: `${description || ""}

---

*Linked to GitHub issue: ${createdIssue.data.html_url}*`,
        })
        .where(eq(taskTable.id, taskId));
    } catch (error) {
      console.error(
        "Failed to update task description with GitHub issue link:",
        error,
      );
    }
  } catch (error) {
    console.error("Failed to create GitHub issue:", error);
  }
}
