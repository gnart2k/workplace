import { eq } from "drizzle-orm";
import db from "../../database";
import { taskTable } from "../../database/schema";
import { addLabelsToIssue } from "./create-github-labels";
import { getOctokitInstance } from "./get-octokit-instance";

export async function handleTaskPriorityChanged(data: {
  taskId: string;
  userId: string | null;
  oldPriority: string;
  newPriority: string;
}) {
  const { taskId, oldPriority, newPriority } = data;

  try {
    const task = await db.query.taskTable.findFirst({
      where: eq(taskTable.id, taskId),
    });

    if (!task) {
      console.log("Task not found for priority change:", taskId);
      return;
    }

    const octokitInstance = await getOctokitInstance(task.projectId);

    if (!octokitInstance) {
      console.log(
        "No active GitHub integration found for project:",
        task.projectId,
      );
      return;
    }

    const {
      octokit,
      owner: repositoryOwner,
      repo: repositoryName,
    } = octokitInstance;

    const hasKaneoLink = task.description?.includes("Linked to GitHub issue:");
    const hasGitHubLink = task.description?.includes(
      "Created from GitHub issue:",
    );

    if (!hasKaneoLink && !hasGitHubLink) {
      console.log(
        "Skipping GitHub issue update - task has no GitHub issue link:",
        taskId,
      );
      return;
    }

    console.log(
      "Updating GitHub issue priority for repository:",
      `${repositoryOwner}/${repositoryName}`,
    );

    let githubIssueUrlMatch = task.description?.match(
      /Linked to GitHub issue: (https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/\d+)/,
    );

    if (!githubIssueUrlMatch) {
      githubIssueUrlMatch = task.description?.match(
        /Created from GitHub issue: (https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/\d+)/,
      );
    }

    if (!githubIssueUrlMatch) {
      console.log("GitHub issue URL not found in task description:", taskId);
      return;
    }

    const githubIssueUrl = githubIssueUrlMatch[1];
    const issueNumber = Number.parseInt(
      githubIssueUrl?.split("/").pop() || "0",
      10,
    );

    if (!issueNumber) {
      console.log("Could not extract issue number from URL:", githubIssueUrl);
      return;
    }

    const labelsToAdd = [`priority:${newPriority}`];

    try {
      await octokit.rest.issues.removeLabel({
        owner: repositoryOwner,
        repo: repositoryName,
        issue_number: issueNumber,
        name: `priority:${oldPriority}`,
      });
    } catch (error) {
      console.log("Could not remove old priority label:", error);
    }

    try {
      await addLabelsToIssue(
        octokit,
        repositoryOwner,
        repositoryName,
        issueNumber,
        labelsToAdd,
      );
    } catch (error) {
      console.error("Failed to add new priority label:", error);
    }

    console.log(
      `Updated GitHub issue ${issueNumber} priority from ${oldPriority} to ${newPriority}`,
    );
  } catch (error) {
    console.error("Failed to update GitHub issue priority:", error);
  }
}
