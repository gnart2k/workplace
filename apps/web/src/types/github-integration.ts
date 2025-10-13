export interface GithubIntegration {
  id: string;
  projectId: string;
  repositoryOwner: string;
  repositoryName: string;
  connectionType: "github_app" | "pat";
  pat: string | null;
  installationId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
