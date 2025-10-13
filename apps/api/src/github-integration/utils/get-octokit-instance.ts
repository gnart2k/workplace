import { eq } from "drizzle-orm";
import type { Octokit } from "octokit";
import db from "../../database";
import { githubIntegrationTable } from "../../database/schema";
import createGithubApp from "./create-github-app";
import { createPatOctokit } from "./create-pat-octokit";
import { decrypt } from "./encryption";

const githubApp = createGithubApp();

export async function getOctokitInstance(
  projectId: string,
): Promise<{ octokit: Octokit; owner: string; repo: string } | null> {
  const integration = await db.query.githubIntegrationTable.findFirst({
    where: eq(githubIntegrationTable.projectId, projectId),
  });

  if (!integration || !integration.isActive) {
    return null;
  }

  const { repositoryOwner, repositoryName, connectionType } = integration;

  if (connectionType === "pat") {
    try {
      const pat = decrypt(integration.pat as string);
      const octokit = createPatOctokit(pat);
      return {
        octokit,
        owner: repositoryOwner,
        repo: repositoryName,
      };
    } catch (error) {
      console.error("Failed to decrypt PAT or create PAT Octokit:", error);
      return null;
    }
  }

  if (
    connectionType === "github_app" &&
    githubApp &&
    integration.installationId
  ) {
    try {
      const octokit = await githubApp.getInstallationOctokit(
        integration.installationId,
      );
      return {
        octokit: octokit as Octokit,
        owner: repositoryOwner,
        repo: repositoryName,
      };
    } catch (error) {
      console.error("Failed to get GitHub App Octokit:", error);
      return null;
    }
  }

  return null;
}
