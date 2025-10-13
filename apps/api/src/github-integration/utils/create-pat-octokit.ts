import { Octokit } from "octokit";

export function createPatOctokit(pat: string): Octokit {
  return new Octokit({
    auth: pat,
  });
}
