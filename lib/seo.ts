export const DEFAULT_CANONICAL_ORIGIN = "https://daniel.negrenavarro.me";

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_CANONICAL_ORIGIN;
  }

  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch {
    return DEFAULT_CANONICAL_ORIGIN;
  }
}

export const CANONICAL_ORIGIN = normalizeOrigin(
  DEFAULT_CANONICAL_ORIGIN
);

export function toCanonicalUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, CANONICAL_ORIGIN).toString();
}
