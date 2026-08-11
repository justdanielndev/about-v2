import { toCanonicalUrl } from "@/lib/seo";

type ImageBearingEntry = {
  content: string;
  image?: string;
  ogImage?: string;
  polaroids?: string[];
};

export const IMAGE_SEO_ALLOWLIST = new Set<string>([
  "/daniel-negre.png",
  "/nix-entertainment-banner.jpg",
  "/nix-umbriel-reveal.jpg",
  "/nix-aria-reveal.jpg",
  "/nix-zarka-reveal.jpg",
  "/nix-rebrand-logo.png",
  "/nix-rebrand-animation.gif",
  "/daydream-valencia-banner.jpg",
  "/daydream-valencia-blue-room.jpg",
  "/daydream-valencia-daniel-mentoring.jpg",
  "/daydream-valencia-gathering.jpg",
  "/daydream-valencia-red-room.jpg",
  "/soundchestai-challenge-outdoors.jpg",
  "/soundchestai-challenge-meeting.jpg",
  "/soundchestai-challenge-indoors.jpg",
  "/soundchestai-challenge-photo-backdrop.jpg",
  "/soundchestai-challenge-matching-shirts.jpg",
  "/gocalp-project-graph-present.jpg",
  "/gocalp-first-prize.jpg",
  "/gocalp-project-main-presentation.jpg",
  "/shadowborne-chronicles-character-sheets.webp",
  "/shadowborne-aria-concept.webp",
  "/shadowborne-aria-haircolor.webp",
  "/shadowborne-umbriel-evolution.webp",
  "/shadowborne-zarka-evolution.webp"
]);

const IMAGE_CAPTIONS: Record<string, string> = {
  "/daniel-negre.png": "Daniel Negre, founder of Nix Entertainment.",
  "/nix-entertainment-banner.jpg": "Nix Entertainment's banner illustration starring Aria and Umbriel.",
  "/nix-umbriel-reveal.jpg": "Umbriel, main character from Nix Entertainment's Shadowborne Chronicles.",
  "/nix-aria-reveal.jpg": "Aria, from Nix Entertainment's Shadowborne Chronicles, does a rock hand sign.",
  "/nix-zarka-reveal.jpg": "Zarka, villain from Nix Entertainment's Shadowborne Chronicles, smirks on his throne.",

  "/nix-rebrand-logo.png": "Nix Entertainment's new glass-based logo after its rebrand.",
  "/nix-rebrand-animation.gif": "Animated change from the old Nix Media logo to the Nix Entertainment logo.",

  "/daydream-valencia-banner.jpg": "Teen participants pose together for a group photo at Daydream Valencia game jam hackathon.",
  "/daydream-valencia-blue-room.jpg": "Students code on laptops under blue lighting during the Daydream Valencia game jam.",
  "/daydream-valencia-daniel-mentoring.jpg": "Teens work with their laptops at Daydream Valencia, and Daniel Negre helps one of them.",
  "/daydream-valencia-gathering.jpg": "Participants gather in a green-lit room during Daydream Valencia game jam.",
  "/daydream-valencia-red-room.jpg": "Students code on their laptops and chat in a red-lit room during Daydream Valencia.",

  "/soundchestai-challenge-outdoors.jpg": "Daniel Negre and teammates smile together outdoors at The Challenge 2025 in Barcelona.",
  "/soundchestai-challenge-meeting.jpg": "The SoundChestAI team poses indoors with another team at The Challenge 2025.",
  "/soundchestai-challenge-indoors.jpg": "The SoundChestAI team poses together with their teacher indoors at The Challenge 2025.",
  "/soundchestai-challenge-photo-backdrop.jpg": "Daniel Negre stands at the Campus The Challenge 2025 EduCaixa photo backdrop.",
  "/soundchestai-challenge-matching-shirts.jpg": "The Challenge 2025 SoundChestAI team poses outside the venue in matching shirts.",

  "/gocalp-project-graph-present.jpg": "Daniel Negre presents his goCalp proposal using a biodiversity data graph.",
  "/gocalp-first-prize.jpg": "Daniel Negre receives the goCalp first-prize award from Global Omnium in Calpe.",
  "/gocalp-project-main-presentation.jpg": "Daniel Negre presents his goCalp garden-corridor proposal at the Global Omnium podium.",

  "/shadowborne-chronicles-character-sheets.webp": "Banner showing Aria and Umbriel for Shadowborne Chronicles design info page",
  "/shadowborne-aria-concept.webp": "Aria's concept art for Nix Entertainment's Shadowborne Chronicles.",
  "/shadowborne-aria-haircolor.webp": "Aria's dyed hair gradually fades to natural dark brown across the series.",
  "/shadowborne-umbriel-evolution.webp": "Left-to-right concept art traces Umbriel's evolution through the design process.",
  "/shadowborne-zarka-evolution.webp": "Left-to-right concept art traces Zarka's design evolution through the series' creation."
};

function collectAllowlistedSrcs(entry: ImageBearingEntry): string[] {
  const srcs = new Set<string>();

  if (entry.image) {
    srcs.add(entry.image);
  }

  for (const polaroid of entry.polaroids ?? []) {
    srcs.add(polaroid);
  }

  const imgTagPattern = /<img[^>]+src="(\/[^"]+)"/g;
  for (const match of entry.content.matchAll(imgTagPattern)) {
    srcs.add(match[1]);
  }

  return Array.from(srcs).filter((src) => IMAGE_SEO_ALLOWLIST.has(src));
}

export function extractEntryImages(entry: ImageBearingEntry): string[] {
  return collectAllowlistedSrcs(entry).map((src) => toCanonicalUrl(src));
}

export function getEntryImagesWithCaptions(
  entry: ImageBearingEntry
): { url: string; caption: string }[] {
  return collectAllowlistedSrcs(entry).map((src) => ({
    url: toCanonicalUrl(src),
    caption: IMAGE_CAPTIONS[src] ?? ""
  }));
}

export function getPrimaryImage(entry: ImageBearingEntry): string | undefined {
  if (entry.ogImage) {
    return entry.ogImage;
  }

  if (entry.image) {
    return entry.image;
  }

  const tagMatch = entry.content.match(/<img[^>]*class="project-banner"[^>]*>/);
  if (!tagMatch) {
    return undefined;
  }

  const srcMatch = tagMatch[0].match(/src="(\/[^"]+)"/);
  return srcMatch?.[1];
}

export function getImageCaption(src: string): string | undefined {
  return IMAGE_CAPTIONS[src];
}