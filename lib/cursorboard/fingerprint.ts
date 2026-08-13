const STORAGE_KEY = "cursorboard:device";

function collectSignals(): string {
  const nav = navigator as Navigator & { deviceMemory?: number };

  const signals = [
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio,
    new Date().getTimezoneOffset(),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    navigator.language,
    nav.hardwareConcurrency ?? 0,
    nav.deviceMemory ?? 0,
    nav.maxTouchPoints ?? 0,
  ];

  return signals.join("|");
}

function deviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const fresh = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return "no-storage";
  }
}

export async function computeFingerprint(): Promise<string> {
  const raw = `${deviceId()}|${collectSignals()}`;

  try {
    const bytes = new TextEncoder().encode(raw);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);
  } catch {
    let hash = 0;
    for (let index = 0; index < raw.length; index += 1) {
      hash = (Math.imul(31, hash) + raw.charCodeAt(index)) | 0;
    }
    return `fallback${(hash >>> 0).toString(16)}`;
  }
}
