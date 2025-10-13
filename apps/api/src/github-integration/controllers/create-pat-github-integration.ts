import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import db from "../../database";
import { githubIntegrationTable } from "../../database/schema";
import { createPatOctokit } from "../utils/create-pat-octokit";
import { encrypt } from "../utils/encryption";
import { parseGithubUrl } from "../utils/parse-github-url";

const patIntegrationSchema = z.object({
  projectId: z.string().min(1),
  repositoryUrl: z.string().url().min(1),
  pat: z.string().min(1),
});

const createPatGithubIntegration = new Hono().post(
  "/pat-connect",
  zValidator("json", patIntegrationSchema),
  async (c) => {
    const { projectId, repositoryUrl, pat } = c.req.valid("json");

    const parsedUrl = parseGithubUrl(repositoryUrl);

    if (!parsedUrl) {
      return c.json({ error: "Invalid GitHub repository URL" }, 400);
    }

    const { repositoryOwner, repositoryName } = parsedUrl;

    try {
      const octokit = createPatOctokit(pat);

      // 1. Verify PAT and get repository details
      const { data: repo } = await octokit.rest.repos.get({
        owner: repositoryOwner,
        repo: repositoryName,
      });

      if (!repo.id) {
        return c.json({ error: "Repository not found or PAT is invalid" }, 400);
      }

      // 2. Encrypt PAT
      const encryptedPat = encrypt(pat);

      // 3. Insert/Update integration
      const [integration] = await db
        .insert(githubIntegrationTable)
        .values({
          projectId,
          repositoryOwner,
          repositoryName,
          connectionType: "pat",
          pat: encryptedPat,
          installationId: null, // PAT connection does not use installationId
          isActive: true,
        })
        .onConflictDoUpdate({
          target: githubIntegrationTable.projectId,
          set: {
            repositoryOwner,
            repositoryName,
            connectionType: "pat",
            pat: encryptedPat,
            installationId: null,
            isActive: true,
          },
        })
        .returning();

      return c.json(integration);
    } catch (error) {
      console.error("PAT integration failed:", error);
      return c.json(
        {
          error:
            "Failed to connect with PAT. Check your URL and PAT permissions.",
        },
        400,
      );
    }
  },
);

export default createPatGithubIntegration;
