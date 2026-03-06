"use client";

import { useEffect, useMemo, useState } from "react";

type BuildMetaData = {
  repoUrl: string;
  latestCommitNumber: number | null;
  latestCommitSha: string | null;
  latestCommitAt: string | null;
};

const GITHUB_USER = "justdanielndev";
const GITHUB_REPO = "about-v2";

function formatTimestampLabel(timestamp: string | null): string {
  if (!timestamp) {
    return "unknown";
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return parsed.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function BuildMetaFooter() {
  const [meta, setMeta] = useState<BuildMetaData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBuildMeta = async () => {
      try {
        const response = await fetch(`/api/github?user=${encodeURIComponent(GITHUB_USER)}&repo=${encodeURIComponent(GITHUB_REPO)}`);
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as BuildMetaData;
        if (!cancelled) {
          setMeta(payload);
        }
      } catch {
      }
    };

    loadBuildMeta();
    const interval = window.setInterval(loadBuildMeta, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const buildMetaLabel = useMemo(() => {
    const commitLabel = meta?.latestCommitNumber
      ? meta.latestCommitSha
        ? `Commit #${meta.latestCommitNumber} (${meta.latestCommitSha})`
        : `Commit #${meta.latestCommitNumber}`
      : meta?.latestCommitSha
        ? `Commit ${meta.latestCommitSha}`
        : "Commit unknown";

    const commitUrl = meta?.latestCommitSha
      ? `${meta.repoUrl}/commit/${meta.latestCommitSha}`
      : `${meta?.repoUrl ?? `https://github.com/${encodeURIComponent(GITHUB_USER)}/${encodeURIComponent(GITHUB_REPO)}`}/commits`;

    return {
      commitLabel,
      commitUrl,
      updatedLabel: `Updated ${formatTimestampLabel(meta?.latestCommitAt ?? null)}`
    };
  }, [meta]);

  return (
    <footer className="site-build-meta" aria-label="Build info">
      <a href={buildMetaLabel.commitUrl} target="_blank" rel="noopener noreferrer" className="site-build-meta-link">
        {buildMetaLabel.commitLabel}
      </a>
      {" - "}
      <span>{buildMetaLabel.updatedLabel}</span>
    </footer>
  );
}
