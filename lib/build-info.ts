import { execSync } from "node:child_process";

function readGitCommitDate(): string | null {
  try {
    const output = execSync("git log -1 --format=%cI", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();

    if (!output) {
      return null;
    }

    const parsed = new Date(output);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  } catch {
    return null;
  }
}

function resolveLastCommitDate(): string {
  return readGitCommitDate() ?? new Date().toISOString();
}

export const LAST_COMMIT_DATE = resolveLastCommitDate();
