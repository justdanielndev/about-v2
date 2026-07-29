export const STATUS_MESSAGES = {
  lateNight: [
    "Probably asleep right now :D",
    "Zzz... It's currently night in Spain",
    "Off the clock right now :3"
  ],
  earlyMorning: [
    "Just woke up... probably :P",
    "Could be having breakfast..."
  ],
  morning: [
    "Starting the day!",
    "Goood morning everyone! :D",
    "What's everyone up to? Morning here"
  ],
  midday: [
    "It's noon in Spain! Probably taking a break :3",
    "Working, probably :D Midday here",
  ],
  lunch: [
    "Probably having lunch right now :)",
    "Eating, brb :D"
  ],
  afternoon: [
    "Writing, designing, coding... I could be doing anything :)",
    "Afternoon in Spain, working on something :3"
  ],
  evening: [
    "Go check out Nix Entertainment :3",
    "Watch the Knights of Guinevere pilot, it's fire",
    "Wrapping up today's work :)"
  ],
  night: [
    "Probably having dinner right now :)",
    "Winding down for the day :3"
  ],
  windingDown: [
    "It's getting late here...",
    "Should probably be asleep soon..."
  ]
} as const;

export function getTimeBucketInSpain(now: Date = new Date()): keyof typeof STATUS_MESSAGES {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Europe/Madrid"
    }).format(now)
  );

  if (hour < 6) return "lateNight";
  if (hour < 9) return "earlyMorning";
  if (hour < 12) return "morning";
  if (hour < 14) return "midday";
  if (hour < 16) return "lunch";
  if (hour < 19) return "afternoon";
  if (hour < 21) return "evening";
  if (hour < 23) return "night";
  return "windingDown";
}

export function getRandomStatusLine(): string {
  const bucket = getTimeBucketInSpain();
  const options = STATUS_MESSAGES[bucket];
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

const STATUS_STORAGE_KEY = "site-status-line";

export function getSessionStatusLine(): string {
  const bucket = getTimeBucketInSpain();
  const existing = window.sessionStorage.getItem(STATUS_STORAGE_KEY);
  if (existing) {
    const separator = existing.indexOf("|");
    if (separator !== -1 && existing.slice(0, separator) === bucket) {
      return existing.slice(separator + 1);
    }
  }

  const generated = getRandomStatusLine();
  window.sessionStorage.setItem(STATUS_STORAGE_KEY, `${bucket}|${generated}`);
  return generated;
}
