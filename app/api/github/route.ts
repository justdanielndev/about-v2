import { NextRequest, NextResponse } from "next/server";

type GithubPayload = {
  user: string;
  profileUrl: string;
  avatarUrl: string | null;
  contributionsUrl: string;
};

type CacheEntry = {
  expiresAt: number;
  payload: GithubPayload;
};

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const user = (request.nextUrl.searchParams.get("user") || "justdanielndev").trim();
  if (!user) {
    return NextResponse.json({ error: "Missing GitHub user" }, { status: 400 });
  }

  const cacheKey = user.toLowerCase();
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
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

    const profileResult = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
      headers: githubHeaders,
      signal: AbortSignal.timeout(3500),
      next: { revalidate: 180 }
    });

    if (!profileResult.ok) {
      return NextResponse.json({ error: "Could not load GitHub data" }, { status: 502 });
    }

    const profile = (await profileResult.json()) as {
      html_url?: string;
      avatar_url?: string;
      login?: string;
    };

    const payload: GithubPayload = {
      user: profile.login || user,
      profileUrl: profile.html_url || `https://github.com/${encodeURIComponent(user)}`,
      avatarUrl: profile.avatar_url || null,
      contributionsUrl: `https://ghchart.rshah.org/409ba5/${encodeURIComponent(profile.login || user)}`
    };

    memoryCache.set(cacheKey, {
      payload,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      }
    });
  } catch {
    return NextResponse.json({ error: "GitHub fetch failed" }, { status: 502 });
  }
}
