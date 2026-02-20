import type { ReadonlyURLSearchParams } from "next/navigation";

export const DEFAULT_NAME = "Daniel Negre";
export const DEFAULT_TRUENAME = "Zoe";

export const TRUENAME_DOMAINS = ("isitzoe.dev,zoe.rocks,zoe.negrenavarro.me")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

export function buildSiteTitle(name: string): string {
  return `${name} (Portfolio)`;
}

export function getDefaultName(): string {
  return DEFAULT_NAME;
}

function normalizeName(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  const value = raw.trim();
  if (!value) {
    return null;
  }

  if (value.toLowerCase() === DEFAULT_TRUENAME.toLowerCase()) {
    return DEFAULT_TRUENAME;
  }

  return null;
}

function isTruenameDomain(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return TRUENAME_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function resolveDisplayName(input: {
  hostname: string;
  searchParams: URLSearchParams | ReadonlyURLSearchParams;
}): string {
  const override = normalizeName(input.searchParams.get("truename"));
  if (override) {
    return override;
  }

  if (isTruenameDomain(input.hostname)) {
    return DEFAULT_TRUENAME;
  }

  return DEFAULT_NAME;
}
