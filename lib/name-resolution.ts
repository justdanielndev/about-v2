export const DEFAULT_NAME = "Daniel Negre";

export function buildSiteTitle(name: string): string {
  return `${name} | Developer, Designer & Writer from Valencia`;
}

export function getDefaultName(): string {
  return DEFAULT_NAME;
}
