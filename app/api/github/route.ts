import { NextRequest, NextResponse } from "next/server";

type GithubPayload = {
  user: string;
  profileUrl: string;
  avatarUrl: string | null;
  contributionsUrl: string;
  repoUrl: string;
  latestCommitNumber: number | null;
  latestCommitSha: string | null;
  latestCommitAt: string | null;
};

type CacheEntry = {
  expiresAt: number;
  payload: GithubPayload;
};

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000;

function getCommitCountFromLinkHeader(linkHeader: string | null): number | null {
  if (!linkHeader) {
    return null;
  }

  const lastPageMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/i);
  if (!lastPageMatch?.[1]) {
    return null;
  }

  const parsed = Number.parseInt(lastPageMatch[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const user = (request.nextUrl.searchParams.get("user") || "justdanielndev").trim();
  const repo = (request.nextUrl.searchParams.get("repo") || "about-v2").trim();
  if (!user) {
    return NextResponse.json({ error: "Missing GitHub user" }, { status: 400 });
  }
  if (!repo) {
    return NextResponse.json({ error: "Missing GitHub repo" }, { status: 400 });
  }

  const cacheKey = `${user.toLowerCase()}/${repo.toLowerCase()}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120"
      }
    });
  }

  try {
    const githubHeaders: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "about-v2-portfolio"
    };

    if (process.env.GITHUB_TOKEN) {
      githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [profileResult, commitsResult] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
        headers: githubHeaders,
        signal: AbortSignal.timeout(3500),
        next: { revalidate: 180 }
      }),
      fetch(`https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/commits?per_page=1`, {
        headers: githubHeaders,
        signal: AbortSignal.timeout(3500),
        next: { revalidate: 180 }
      })
    ]);

    if (!profileResult.ok) {
      return NextResponse.json({ error: "Could not load GitHub data" }, { status: 502 });
    }

    const profile = (await profileResult.json()) as {
      html_url?: string;
      avatar_url?: string;
      login?: string;
    };

    let latestCommitNumber: number | null = null;
    let latestCommitSha: string | null = null;
    let latestCommitAt: string | null = null;
    if (commitsResult.ok) {
      const commits = (await commitsResult.json()) as Array<{
        sha?: string;
        commit?: {
          author?: {
            date?: string;
          };
        };
      }>;
      latestCommitNumber = getCommitCountFromLinkHeader(commitsResult.headers.get("link"));
      if (latestCommitNumber === null && commits.length > 0) {
        latestCommitNumber = 1;
      }
      const latest = commits[0];
      latestCommitSha = latest?.sha ? latest.sha.slice(0, 7) : null;
      latestCommitAt = latest?.commit?.author?.date ?? null;
    }

    const payload: GithubPayload = {
      user: profile.login || user,
      profileUrl: profile.html_url || `https://github.com/${encodeURIComponent(user)}`,
      avatarUrl: profile.avatar_url || null,
      contributionsUrl: `https://ghchart.rshah.org/409ba5/${encodeURIComponent(profile.login || user)}`,
      repoUrl: `https://github.com/${encodeURIComponent(user)}/${encodeURIComponent(repo)}`,
      latestCommitNumber,
      latestCommitSha,
      latestCommitAt
    };

    memoryCache.set(cacheKey, {
      payload,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120"
      }
    });
  } catch {
    return NextResponse.json({ error: "GitHub fetch failed" }, { status: 502 });
  }
}
