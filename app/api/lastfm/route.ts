import { NextRequest, NextResponse } from "next/server";

type LastfmNow = {
  user: string;
  track: string;
  artist: string;
  albumArt: string | null;
  timestamp: number | null;
  nowPlaying: boolean;
  url: string;
};

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

function decodeHtml(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function fromApi(user: string, apiKey: string): Promise<LastfmNow | null> {
  const qs = new URLSearchParams({
    method: "user.getrecenttracks",
    user,
    api_key: apiKey,
    format: "json",
    limit: "1"
  });

  const response = await fetch(`${LASTFM_API_URL}?${qs.toString()}`, {
    next: { revalidate: 45 }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    recenttracks?: {
      track?: Array<{
        name?: string;
        artist?: { "#text"?: string };
        image?: Array<{ "#text"?: string }>;
        url?: string;
        date?: { uts?: string };
        ["@attr"]?: { nowplaying?: string };
      }>;
    };
  };

  const first = payload.recenttracks?.track?.[0];
  if (!first?.name || !first.artist?.["#text"]) {
    return null;
  }

  const art = first.image?.at(-1)?.["#text"]?.trim() || null;

  return {
    user,
    track: first.name,
    artist: first.artist["#text"],
    albumArt: art || null,
    timestamp: first.date?.uts ? Number(first.date.uts) : null,
    nowPlaying: first["@attr"]?.nowplaying === "true",
    url: first.url || `https://www.last.fm/user/${encodeURIComponent(user)}`
  };
}

async function fromHtml(user: string): Promise<LastfmNow | null> {
  const response = await fetch(`https://www.last.fm/user/${encodeURIComponent(user)}/library`, {
    next: { revalidate: 60 },
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const row = html.match(/<tr[\s\S]*?data-scrobble-row[\s\S]*?<\/tr>/i)?.[0];
  if (!row) {
    return null;
  }

  const track = row.match(/class="chartlist-name"[\s\S]*?<a[\s\S]*?>([^<]+)<\/a>/i)?.[1];
  const artist = row.match(/class="chartlist-artist"[\s\S]*?<a[\s\S]*?>([^<]+)<\/a>/i)?.[1];
  const albumArt = row.match(/class="chartlist-image"[\s\S]*?<img[\s\S]*?src="([^"]+)"/i)?.[1] || null;
  const tsRaw = row.match(/data-timestamp="(\d+)"/i)?.[1] || null;

  if (!track || !artist) {
    return null;
  }

  return {
    user,
    track: decodeHtml(track),
    artist: decodeHtml(artist),
    albumArt,
    timestamp: tsRaw ? Number(tsRaw) : null,
    nowPlaying: false,
    url: `https://www.last.fm/user/${encodeURIComponent(user)}`
  };
}

export async function GET(request: NextRequest) {
  const user = (request.nextUrl.searchParams.get("user") || process.env.NEXT_PUBLIC_LASTFM_USER || "rj").trim();
  if (!user) {
    return NextResponse.json({ error: "Missing Last.fm user" }, { status: 400 });
  }

  try {
    const apiKey = process.env.LASTFM_API_KEY;
    const live = apiKey ? await fromApi(user, apiKey) : null;
    const data = live ?? (await fromHtml(user));

    if (!data) {
      return NextResponse.json({ error: "Could not load Last.fm data" }, { status: 502 });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=45, stale-while-revalidate=120"
      }
    });
  } catch {
    return NextResponse.json({ error: "Last.fm fetch failed" }, { status: 502 });
  }
}
