export function parseGithubUrl(url: string): {
  repositoryOwner: string;
  repositoryName: string;
} | null {
  try {
    const urlObject = new URL(url);
    if (urlObject.hostname !== "github.com") {
      return null;
    }

    const pathParts = urlObject.pathname.split("/").filter(Boolean);

    if (pathParts.length < 2) {
      return null;
    }

    const repositoryOwner = pathParts[0] as string;
    const repositoryName = (pathParts[1] as string).replace(/\.git$/, "");

    return { repositoryOwner, repositoryName };
  } catch (error) {
    return null;
  }
}
