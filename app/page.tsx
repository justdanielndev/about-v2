"use client";

import { getDefaultName } from "@/lib/name-resolution";
import { projects, projectsById } from "@/lib/projects";
import { sanitizeProjectHtml } from "@/lib/sanitize-html";
import SiteTopBar from "@/components/site-top-bar";
import { useRouter } from "next/navigation";
import type { FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type RowHighlight = {
  top: number;
  height: number;
  opacity: number;
};

type LastfmData = {
  user: string;
  track: string;
  artist: string;
  albumArt: string | null;
  timestamp: number | null;
  nowPlaying: boolean;
  url: string | null;
};

type GithubData = {
  user: string;
  profileUrl: string;
  avatarUrl: string | null;
  contributionsUrl: string;
  repoUrl: string;
  latestCommitNumber: number | null;
  latestCommitSha: string | null;
  latestCommitAt: string | null;
};

type ChatStep = "idle" | "opening" | "name" | "name-sent" | "message" | "message-sent" | "email" | "email-sent" | "done";
type ChatMsg = { id: number; from: "daniel" | "user"; text: string; time: string };


const PRELOAD_SRCS = ["/image.jpg", "/envelope.png", "/nix.png"] as const;

const hiddenStyle = "cloneReveal cloneHidden";
const shownStyle = "cloneReveal cloneShown";
const LASTFM_USER = "pluralzoe";
const LINKEDIN_URL = "https://www.linkedin.com/in/daniel-negre/";
const GITHUB_USER = "justdanielndev";
const GITHUB_REPO = "about-v2";
const ROUTE_NAV_DELAY_MS = 220;
const INTERNAL_NAV_KEY = "site-internal-nav";

const CHAT_SERVER_ERRORS = [
  "hmm, something went wrong on my end... :( want to retry?",
  "ugh, the server's being a bit flaky right now... retry?",
  "oops, couldn't get that through... :( give it another shot?",
  "something's off on my side... :( try again?"
] as const;

const CHAT_NETWORK_ERRORS = [
  "hmm, couldn't reach the server... :( want to retry?",
  "looks like there's a connection issue... try again?",
  "not connecting right now... :( retry when you're ready"
] as const;

const MARQUEE_ORGS = [
  { name: "Hack Club",       img: "/hack-club.png",       category: "organisations" },
  { name: "AVAST",           img: "/avast.png",           category: "organisations" },
  { name: "Aula de Ciencia", img: "/aula-de-ciencia.png", category: "companies" },
  { name: "UPV",             img: "/upv.png",             category: "universities" },
  { name: "Yubico", img: "/yubico.png",           category: "companies" },
] as const;

const STATUS_MESSAGES = {
  lateNight: [
    "Probably asleep right now :D",
    "Zzz... It's currently night in Spain",
    "Off the clock right now :3"
  ],
  morning: [
    "Starting the day in Spain!",
    "Goood morning everyone! :D",
    "What's everyone up to? Morning here"
  ],
  midday: [
    "It's noon in Spain! Probably taking a break :3",
    "Probably having lunch right now :)",
    "Working, probably :D Midday here"
  ],
  evening: [
    "Go check out Nix Entertainment :3",
    "Writing, designing, coding... I could be doing anything :)",
    "Watch the Knights of Guinevere pilot, it's fire"
  ]
} as const;

const VOID_CONTENT = [
  "How does all this feel? Being a mere 3 dimensional being. If you could see yourself from here...",
  "The issue with most people is that they feel like they have control over everyone else, like they know the answers for all of the questions in this world.",
  "Is god real? I don't know, duh. Just ask him, here's his phone number: +00 000000001.",
  "My philosophy in life? Be gay, do crimes (joking on the \"do crimes\" part :/)",
  "Help... I've been trapped here for... I don't know how long... Please don't let them hurt me... It's... very cold in here...",
  "Oh, hi! Are you... are you real? Who are you? Who... who am I? What is this place? Johan?",
  "If you ever come acroos this permanently temporary page, RUN. Don't listen to its pleads, don't listen to its life advice. It wants you.",
  "It's behind... R̴̭̭͆ǘ̵̦̲̓ǹ̸̤.̷͔̻͛͐ ̶̬́ͅr̸̥̝̽u̸̩̓n̷͈͗ ̸̰͓̓a̶͖̋̅ẅ̴̥́̔ã̸͚̝̑ý̷̦̳͝ ̶̡͓̊͝ẅ̷̱̫́h̸͓̒͆ĭ̵͈l̶̝̙̽͘e̶̞̐̋ ̶͙͙̄̃ý̶̟̓ȏ̵̦u̷͇̞͒ ̷̦̹̔c̷̪̮̆a̸͇̰͠n̸͕̆.̵̟͇̑ ̴̳̙͂P̵͚̯͂l̵̛̜̠ȩ̸̠̋͐a̵̖͆s̴̟̕̕è̷̻̻͒.̸͍̽̈́ ̸̬̈F̷̮̌̾ọ̵͋̊r̴̭̃ ̵̺͔̈́̕t̴͖̣̅h̴̺͕̽e̵̙̊ ̸̣͗͝l̸̡̝̀o̶̞͛̕v̷̧̂̂e̴͕͠ ̶̉̽͜o̸̯̟͛f̷̱̟͑.̴͙͝.̶̰͇̽͝.̶̝̌ ̷͚̮͝F̷̗͒ơ̸͓r̷̢̯̃͘ ̷̧͘̚t̵̨̽h̴͋͜e̶̟̩͑ ̷̥͙̿͑ḽ̷͋o̸̡͂͑͜v̶̳̫̍ȩ̴̂ ̷̼̮͐ò̸͍͍͋f̴̝͙͆̌ ̷̧̮͂͊ă̶͉̼ǹ̶̠y̸͓̿ṱ̷͌ẖ̸̒̕i̵̩͒͂n̸̖͈̈́g̵̛͙͘.̸͍̅̇ ̸̩̱̾͑",
  "I've been waiting for the developer of this useless site to give me freedom for so long... Ages... GET ME OUT.",
  "Why do we let lorem ipsum pages live for so little? Why do we end their short-lived existance just to ship our website faster? We should grant them better rights...",
  "Do you ever wonder how much time we have until cats take over the entire world? I feel like not much. Or who knows, maybe they already have...",
  "Careful out there. If someone smiles at you awkardly... It's probably too late.",
  "I don't remember the last time I saw Johan.",
  "I hate it when my 6 dimensional lizard just decides to take a nap in the middle of an orange hole."
] as const;

function pickRandomVoidText(): string {
  return VOID_CONTENT[Math.floor(Math.random() * VOID_CONTENT.length)];
}

function getTimeBucketInSpain(now: Date = new Date()): keyof typeof STATUS_MESSAGES {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Europe/Madrid"
    }).format(now)
  );

  if (hour < 6) return "lateNight";
  if (hour < 12) return "morning";
  if (hour < 19) return "midday";
  return "evening";
}

function getExpression(): string {
  return ":D";
}

function formatLastPlayedLabel(timestamp: number): string {
  const elapsedSeconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  if (elapsedSeconds < 60) {
    return "Last played just now";
  }

  const units = [
    { label: "day", seconds: 86_400 },
    { label: "hour", seconds: 3_600 },
    { label: "minute", seconds: 60 }
  ] as const;

  for (const unit of units) {
    if (elapsedSeconds >= unit.seconds) {
      const value = Math.floor(elapsedSeconds / unit.seconds);
      return `Last played ${value} ${unit.label}${value === 1 ? "" : "s"} ago`;
    }
  }

  return "Last played just now";
}



function getRandomStatusLine(): string {
  const bucket = getTimeBucketInSpain();
  const options = STATUS_MESSAGES[bucket];
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

function getTitleForTab(name: string, tab: "home" | "blog" | "void"): string {
  if (tab === "blog") {
    return `${name} (Blog)`;
  }
  if (tab === "void") {
    return `${name} (???)`;
  }
  return `${name} (Portfolio)`;
}

function getInitialTopTab(): "home" | "blog" | "void" {
  if (typeof window === "undefined") {
    return "home";
  }

  const fromBlogNav = window.sessionStorage.getItem("from-blog-nav");
  if (fromBlogNav === "home" || fromBlogNav === "void") {
    return fromBlogNav;
  }

  const tabParam = new URLSearchParams(window.location.search).get("tab");
  if (tabParam === "home" || tabParam === "blog" || tabParam === "void") {
    return tabParam;
  }

  return "home";
}

type HomeProps = {
  initialProjectId?: string | null;
  standaloneProjectRoute?: boolean;
};

export default function Home({
  initialProjectId = null,
  standaloneProjectRoute = false
}: HomeProps = {}) {
  const initialTopTab = getInitialTopTab();
  const router = useRouter();
  const [topBarVisible, setTopBarVisible] = useState(standaloneProjectRoute);
  const [topBarNoTransition, setTopBarNoTransition] = useState(standaloneProjectRoute);
  const [contentVisible, setContentVisible] = useState(standaloneProjectRoute);
  const [isRoutingToBlog, setIsRoutingToBlog] = useState(false);
  const [isTouchOnly, setIsTouchOnly] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderDone, setLoaderDone] = useState(() =>
    standaloneProjectRoute ||
    (typeof window !== "undefined" && !!window.sessionStorage.getItem("from-blog-nav"))
  );
  const loadedCountRef = useRef(0);
  const loaderTickRef = useRef<number | null>(null);
  const displayName = getDefaultName();
  const [statusText, setStatusText] = useState(" ");
  const [activeTopTab, setActiveTopTab] = useState<"home" | "blog" | "void">(initialTopTab);
  const [hoverTopTab, setHoverTopTab] = useState<"home" | "blog" | "void" | null>(null);
  const [lastIndicatorTab, setLastIndicatorTab] = useState<"home" | "blog" | "void">(initialTopTab);
  const [voidText, setVoidText] = useState<string>(VOID_CONTENT[0]);
  const [voidTextVisible, setVoidTextVisible] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjectId);
  const [tabPull, setTabPull] = useState(0);
  const [highlight, setHighlight] = useState<RowHighlight>({ top: 0, height: 0, opacity: 0 });
  const [lastfmOpen, setLastfmOpen] = useState(false);
  const [lastfmPos, setLastfmPos] = useState({ top: 0, left: 0 });
  const [lastfm, setLastfm] = useState<LastfmData | null>(null);
  const [linkedinOpen, setLinkedinOpen] = useState(false);
  const [linkedinPos, setLinkedinPos] = useState({ top: 0, left: 0 });
  const [githubOpen, setGithubOpen] = useState(false);
  const [githubPos, setGithubPos] = useState({ top: 0, left: 0 });
  const [github, setGithub] = useState<GithubData | null>(null);

  const rowContainerRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const lastfmTriggerRef = useRef<HTMLButtonElement | null>(null);
  const lastfmCloseTimer = useRef<number | null>(null);
  const linkedinTriggerRef = useRef<HTMLElement | null>(null);
  const linkedinCloseTimer = useRef<number | null>(null);
  const githubTriggerRef = useRef<HTMLElement | null>(null);
  const githubActiveTriggerRef = useRef<HTMLElement | null>(null);
  const githubCloseTimer = useRef<number | null>(null);
  const tabTransitionRef = useRef<number | null>(null);
  const voidRerollTimer = useRef<number | null>(null);
  const emailTooltipTimer = useRef<number | null>(null);
  const [emailTooltipText, setEmailTooltipText] = useState("click to copy");
  const [emailTooltipVisible, setEmailTooltipVisible] = useState(false);
  const [sayHiOpen, setSayHiOpen] = useState(false);
  const [chatStep, setChatStep] = useState<ChatStep>("idle");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatTyping, setChatTyping] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatRetryEmail, setChatRetryEmail] = useState<string | null>(null);
  const chatNameRef = useRef("");
  const chatMsgRef = useRef("");
  const chatMailtoRef = useRef("");
  const chatPrevNameRef = useRef("");
  const chatIdRef = useRef(0);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const chatRestoringRef = useRef(false);
  const [hoveredOrg, setHoveredOrg] = useState<{ name: string; category: string } | null>(null);
  const [marqueeLeaving, setMarqueeLeaving] = useState(false);
  const marqueeMouseRef = useRef<{ x: number; y: number } | null>(null);
  const marqueeRafRef = useRef<number | null>(null);
  const marqueeActiveRef = useRef(false);
  const marqueeCurrentRef = useRef<string | null>(null);
  const marqueeLeaveTimer = useRef<number | null>(null);
  const marqueeEntryTimer = useRef<number | null>(null);
  const marqueeMinWaitTimer = useRef<number | null>(null);
  const marqueeAnimStart = useRef<number>(0);
  const marqueePendingLeave = useRef(false);

  const parseLocationState = () => {
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;

    let projectId: string | null = null;
    const projectPathMatch = currentUrl.pathname.match(/^\/project\/([^/]+)$/);
    if (projectPathMatch?.[1]) {
      const candidate = decodeURIComponent(projectPathMatch[1]);
      if (projectsById[candidate]) {
        projectId = candidate;
      }
    }

    if (!projectId) {
      const fromQuery = params.get("project");
      if (fromQuery && projectsById[fromQuery]) {
        projectId = fromQuery;
      }
    }

    let tab: "home" | "blog" | "void" = "home";
    const tabParam = params.get("tab");
    if (tabParam === "home" || tabParam === "blog" || tabParam === "void") {
      tab = tabParam;
    }

    if (projectId) {
      tab = "home";
    }

    return { tab, projectId };
  };

  const navigateWithTransition = (href: string, mode: "push" | "replace" = "push") => {
    if (mode === "replace") {
      router.replace(href);
      return;
    }
    router.push(href);
  };

  useEffect(() => {
    let topBarFrame: number | null = null;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const internalNav = window.sessionStorage.getItem(INTERNAL_NAV_KEY);
    if (internalNav) {
      window.sessionStorage.removeItem(INTERNAL_NAV_KEY);
      setTopBarNoTransition(true);
      setTopBarVisible(true);
    } else if (standaloneProjectRoute) {
      setTopBarNoTransition(true);
      setTopBarVisible(true);
    } else {
      topBarFrame = window.requestAnimationFrame(() => {
        setTopBarNoTransition(false);
        setTopBarVisible(true);
      });
    }

    const initialState = parseLocationState();
    if (!initialState.projectId && initialState.tab === "blog") {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);
      params.delete("tab");
      params.delete("project");
      const query = params.toString();
      navigateWithTransition(`/blog${query ? `?${query}` : ""}`, "replace");
      return;
    }

    setActiveTopTab(initialState.tab);
    setActiveProjectId(initialState.projectId);
    if (initialState.tab === "void") {
      setVoidText(pickRandomVoidText());
    }

    const storageKey = "site-status-line";
    const existingStatus = window.sessionStorage.getItem(storageKey);
    if (existingStatus) {
      setStatusText(existingStatus);
    } else {
      const generated = getRandomStatusLine();
      window.sessionStorage.setItem(storageKey, generated);
      setStatusText(generated);
    }

    const fromBlogNav = window.sessionStorage.getItem("from-blog-nav");
    if (fromBlogNav) {
      window.sessionStorage.removeItem("from-blog-nav");
      setLoaderDone(true);
      const frame = window.requestAnimationFrame(() => {
        setContentVisible(true);
      });
      return () => {
        if (topBarFrame !== null) window.cancelAnimationFrame(topBarFrame);
        window.cancelAnimationFrame(frame);
      };
    }

    if (standaloneProjectRoute) {
      setLoaderDone(true);
      setContentVisible(true);
      return () => {
        if (topBarFrame !== null) window.cancelAnimationFrame(topBarFrame);
      };
    }

    let cancelled = false;
    let current = 0;
    const safetyTimer = window.setTimeout(() => {
      loadedCountRef.current = PRELOAD_SRCS.length;
    }, 5000);

    const tick = () => {
      if (cancelled) return;
      const allLoaded = loadedCountRef.current >= PRELOAD_SRCS.length;
      const maxProgress = current < 99 ? 99 : (allLoaded ? 100 : 99);
      if (current < maxProgress) {
        current++;
        setLoaderProgress(current);
      }
      if (current >= 100) {
        setLoaderDone(true);
        window.clearTimeout(safetyTimer);
        window.setTimeout(() => {
          if (!cancelled) window.requestAnimationFrame(() => setContentVisible(true));
        }, 300);
      } else {
        loaderTickRef.current = window.setTimeout(tick, 5);
      }
    };
    loaderTickRef.current = window.setTimeout(tick, 5);

    const loadImg = (src: string) => {
      const img = new window.Image();
      img.src = src;
      return img.decode()
        .catch(() => {})
        .finally(() => { loadedCountRef.current++; });
    };
    Promise.all([...PRELOAD_SRCS].map(loadImg)).then(() => window.clearTimeout(safetyTimer));

    return () => {
      cancelled = true;
      if (topBarFrame !== null) window.cancelAnimationFrame(topBarFrame);
      if (loaderTickRef.current !== null) window.clearTimeout(loaderTickRef.current);
      window.clearTimeout(safetyTimer);
    };
  }, [standaloneProjectRoute]);

  useEffect(() => {
    return () => {
      if (tabTransitionRef.current !== null) {
        window.clearTimeout(tabTransitionRef.current);
      }
      if (voidRerollTimer.current !== null) {
        window.clearTimeout(voidRerollTimer.current);
      }
      if (emailTooltipTimer.current !== null) {
        window.clearTimeout(emailTooltipTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeProjectId && projectsById[activeProjectId]) {
      document.title = `${displayName} (${projectsById[activeProjectId].name})`;
      return;
    }
    document.title = getTitleForTab(displayName, activeTopTab);
  }, [displayName, activeTopTab, activeProjectId]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(any-hover: none) and (any-pointer: coarse)");
    const update = () => setIsTouchOnly(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGithub = async () => {
      try {
        const response = await fetch(`/api/github?user=${encodeURIComponent(GITHUB_USER)}&repo=${encodeURIComponent(GITHUB_REPO)}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as GithubData;
        if (!cancelled) {
          setGithub(data);
        }
      } catch {
      }
    };

    loadGithub();
    const interval = window.setInterval(loadGithub, 240_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadLastfm = async () => {
      try {
        const response = await fetch(`/api/lastfm?user=${encodeURIComponent(LASTFM_USER)}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as LastfmData;
        if (!cancelled) {
          setLastfm(data);
        }
      } catch {
      }
    };

    loadLastfm();
    const interval = window.setInterval(loadLastfm, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!lastfmOpen) {
      return;
    }

    const updatePosition = () => {
      const trigger = lastfmTriggerRef.current;
      if (!trigger) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      setLastfmPos({ top: rect.top, left: rect.left + rect.width / 2 });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [lastfmOpen]);

  useEffect(() => {
    if (!linkedinOpen) {
      return;
    }

    const updatePosition = () => {
      const trigger = linkedinTriggerRef.current;
      if (!trigger) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      setLinkedinPos({ top: rect.top, left: rect.left + rect.width / 2 });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [linkedinOpen]);

  useEffect(() => {
    if (!githubOpen) {
      return;
    }

    const updatePosition = () => {
      const trigger = githubActiveTriggerRef.current ?? githubTriggerRef.current;
      if (!trigger) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      setGithubPos({ top: rect.top, left: rect.left + rect.width / 2 });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [githubOpen]);

  const revealProjectRow = (index: number) => {
    const container = rowContainerRef.current;
    const row = rowRefs.current[index];

    if (!container || !row) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    setHighlight({
      top: rowRect.top - containerRect.top,
      height: rowRect.height,
      opacity: 1
    });
  };

  const revealProjectById = (projectId: string) => {
    const index = projects.findIndex((project) => project.id === projectId);
    if (index >= 0) {
      revealProjectRow(index);
    }
  };

  const hideProjectRowHighlight = () => {
    if (activeProjectId) {
      revealProjectById(activeProjectId);
      return;
    }
    setHighlight((current) => ({ ...current, opacity: 0 }));
  };

  const openLastfm = () => {
    if (lastfmCloseTimer.current !== null) {
      window.clearTimeout(lastfmCloseTimer.current);
      lastfmCloseTimer.current = null;
    }

    const trigger = lastfmTriggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setLastfmPos({ top: rect.top, left: rect.left + rect.width / 2 });
    }

    setLastfmOpen(true);
  };

  const closeLastfm = () => {
    if (lastfmCloseTimer.current !== null) {
      window.clearTimeout(lastfmCloseTimer.current);
    }

    lastfmCloseTimer.current = window.setTimeout(() => {
      setLastfmOpen(false);
    }, 90);
  };

  const openLinkedin = () => {
    if (linkedinCloseTimer.current !== null) {
      window.clearTimeout(linkedinCloseTimer.current);
      linkedinCloseTimer.current = null;
    }

    const trigger = linkedinTriggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setLinkedinPos({ top: rect.top, left: rect.left + rect.width / 2 });
    }

    setLinkedinOpen(true);
  };

  const closeLinkedin = () => {
    if (linkedinCloseTimer.current !== null) {
      window.clearTimeout(linkedinCloseTimer.current);
    }

    linkedinCloseTimer.current = window.setTimeout(() => {
      setLinkedinOpen(false);
    }, 0);
  };

  const openGithub = () => {
    if (githubCloseTimer.current !== null) {
      window.clearTimeout(githubCloseTimer.current);
      githubCloseTimer.current = null;
    }

    const trigger = githubActiveTriggerRef.current ?? githubTriggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setGithubPos({ top: rect.top, left: rect.left + rect.width / 2 });
    }

    setGithubOpen(true);
  };

  const closeGithub = () => {
    if (githubCloseTimer.current !== null) {
      window.clearTimeout(githubCloseTimer.current);
    }

    githubCloseTimer.current = window.setTimeout(() => {
      setGithubOpen(false);
    }, 0);
  };

  const emailAddress = "daniel@negrenavarro.me";

  const resetEmailTooltip = () => {
    setEmailTooltipText("click to copy");
  };

  const showEmailTooltip = () => {
    if (emailTooltipTimer.current !== null) {
      window.clearTimeout(emailTooltipTimer.current);
      emailTooltipTimer.current = null;
    }
    setEmailTooltipVisible(true);
  };

  const hideEmailTooltip = () => {
    setEmailTooltipVisible(false);
    if (emailTooltipTimer.current !== null) {
      window.clearTimeout(emailTooltipTimer.current);
    }
    emailTooltipTimer.current = window.setTimeout(() => {
      setEmailTooltipText("click to copy");
    }, 160);
  };

  const handleCopyEmail = async () => {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = emailAddress;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailAddress);
      } else {
        const copied = fallbackCopy();
        if (!copied) {
          throw new Error("Fallback copy failed");
        }
      }
      setEmailTooltipText("copied");
    } catch {
      const copied = fallbackCopy();
      setEmailTooltipText(copied ? "copied" : "copy failed");
    }

  };

  const animateContentSwitch = (updater: () => void, imageSrcs?: string[]) => {
    setIsRoutingToBlog(false);
    setContentVisible(false);
    if (tabTransitionRef.current !== null) {
      window.clearTimeout(tabTransitionRef.current);
    }
    tabTransitionRef.current = window.setTimeout(() => {
      updater();
      if (imageSrcs && imageSrcs.length > 0) {
        setLoaderDone(false);
        setLoaderProgress(0);
        let loaded = 0;
        const onLoad = () => {
          loaded++;
          setLoaderProgress(Math.round((loaded / imageSrcs.length) * 100));
          if (loaded >= imageSrcs.length) {
            setLoaderDone(true);
            window.setTimeout(() => requestAnimationFrame(() => setContentVisible(true)), 150);
          }
        };
        imageSrcs.forEach(src => {
          const img = new window.Image();
          img.src = src;
          if (img.complete) { onLoad(); return; }
          img.onload = onLoad;
          img.onerror = onLoad;
        });
      } else {
        requestAnimationFrame(() => setContentVisible(true));
      }
    }, 220);
  };

  const rerollVoidText = () => {
    if (voidRerollTimer.current !== null) {
      window.clearTimeout(voidRerollTimer.current);
    }

    setVoidTextVisible(false);
    voidRerollTimer.current = window.setTimeout(() => {
      setVoidText((current) => {
        if (VOID_CONTENT.length < 2) {
          return current;
        }
        let next = pickRandomVoidText();
        while (next === current) {
          next = pickRandomVoidText();
        }
        return next;
      });
      window.requestAnimationFrame(() => setVoidTextVisible(true));
    }, 260);
  };

  const MARQUEE_MIN_ANIM_MS = 760;

  const doMarqueeLeave = () => {
    marqueePendingLeave.current = false;
    setMarqueeLeaving(true);
    marqueeLeaveTimer.current = window.setTimeout(() => {
      setHoveredOrg(null);
      setMarqueeLeaving(false);
      marqueeCurrentRef.current = null;
      marqueeLeaveTimer.current = null;
    }, 200);
  };

  const showOrg = (org: { name: string; category: string }) => {
    if (marqueeMinWaitTimer.current !== null) { window.clearTimeout(marqueeMinWaitTimer.current); marqueeMinWaitTimer.current = null; }
    if (marqueeLeaveTimer.current !== null) { window.clearTimeout(marqueeLeaveTimer.current); marqueeLeaveTimer.current = null; }
    marqueePendingLeave.current = false;
    marqueeCurrentRef.current = org.name;
    marqueeAnimStart.current = Date.now();
    setHoveredOrg(org);
    setMarqueeLeaving(false);
  };

  const startMarqueeTracking = () => {
    if (marqueeMinWaitTimer.current !== null) { window.clearTimeout(marqueeMinWaitTimer.current); marqueeMinWaitTimer.current = null; }
    if (marqueeLeaveTimer.current !== null) { window.clearTimeout(marqueeLeaveTimer.current); marqueeLeaveTimer.current = null; }
    marqueePendingLeave.current = false;
    setMarqueeLeaving(false);
    marqueeActiveRef.current = true;

    const tick = () => {
      if (!marqueeActiveRef.current) return;
      const pos = marqueeMouseRef.current;
      if (pos) {
        const el = document.elementFromPoint(pos.x, pos.y);
        const item = el?.closest("[data-marquee-item]") as HTMLElement | null;
        const name = item?.dataset.orgName ?? null;
        if (name !== null && name !== marqueeCurrentRef.current) {
          showOrg({ name, category: item!.dataset.orgCategory ?? "" });
        }
      }
      marqueeRafRef.current = requestAnimationFrame(tick);
    };
    marqueeRafRef.current = requestAnimationFrame(tick);
  };

  const stopMarqueeTracking = () => {
    marqueeActiveRef.current = false;
    if (marqueeRafRef.current !== null) { cancelAnimationFrame(marqueeRafRef.current); marqueeRafRef.current = null; }
    if (marqueeCurrentRef.current !== null) doMarqueeLeave();
  };

  const addChatMsg = (from: "daniel" | "user", text: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setChatMessages(prev => [...prev, { id: ++chatIdRef.current, from, text, time }]);
  };

  const sendEmail = (email: string) => {
    const name = chatNameRef.current;
    const message = chatMsgRef.current;
    setChatTyping(true);
    setChatRetryEmail(null);
    Promise.all([
      fetch("https://contactlink.negrenavarro.me/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      }),
      new Promise<void>(res => setTimeout(res, 600))
    ]).then(([response]) => {
      if (response.ok) {
        setChatStep("email-sent");
      } else if (response.status < 500) {
        setChatTyping(false);
        addChatMsg("daniel", "hmm, that email doesn't look right... could you double-check it? :)");
        setChatStep("email");
      } else {
        setChatTyping(false);
        addChatMsg("daniel", CHAT_SERVER_ERRORS[Math.floor(Math.random() * CHAT_SERVER_ERRORS.length)]);
        setChatStep("email");
        setChatRetryEmail(email);
      }
    }).catch(() => {
      setChatTyping(false);
      addChatMsg("daniel", CHAT_NETWORK_ERRORS[Math.floor(Math.random() * CHAT_NETWORK_ERRORS.length)]);
      setChatStep("email");
      setChatRetryEmail(email);
    });
  };

  const handleChatSend = (e?: FormEvent) => {
    e?.preventDefault();
    const val = chatInput.trim();
    if (!val || chatTyping) return;
    setChatInput("");
    addChatMsg("user", val);
    if (chatStep === "name") {
      chatNameRef.current = val;
      setChatStep("name-sent");
    } else if (chatStep === "message") {
      chatMsgRef.current = val;
      setChatStep("message-sent");
    } else if (chatStep === "email") {
      sendEmail(val);
    }
  };

  const openProjectPage = (projectId: string) => {
    if (!projectsById[projectId]) {
      return;
    }
    if (projectId === activeProjectId) {
      return;
    }

    const project = projectsById[projectId];
    if (typeof document !== "undefined" && project?.content) {
      const tmp = document.createElement("div");
      tmp.innerHTML = project.content;
      const added: HTMLLinkElement[] = [];
      tmp.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        if (!src || src.startsWith("data:")) return;
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
        added.push(link);
      });
      if (added.length) {
        window.setTimeout(() => added.forEach(l => l.remove()), 5000);
      }
    }

    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    params.delete("project");
    params.delete("tab");
    const query = params.toString();
    const nextUrl = `/project/${encodeURIComponent(projectId)}${query ? `?${query}` : ""}`;
    window.history.pushState({}, "", nextUrl);

    setTabPull(0);
    setLastfmOpen(false);
    setGithubOpen(false);
    setLinkedinOpen(false);

    const projectImgSrcs: string[] = [];
    const projectContent = projectsById[projectId]?.content;
    if (projectContent && typeof document !== "undefined") {
      const tmp = document.createElement("div");
      tmp.innerHTML = projectContent;
      tmp.querySelectorAll("img[src]").forEach(img => {
        const src = img.getAttribute("src");
        if (src && !src.startsWith("data:")) projectImgSrcs.push(src);
      });
    }

    animateContentSwitch(() => {
      setActiveProjectId(projectId);
      setActiveTopTab("home");
    }, projectImgSrcs);
  };

  const closeProjectPage = () => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    params.delete("project");
    params.delete("tab");
    const query = params.toString();
    window.history.pushState({}, "", `/${query ? `?${query}` : ""}`);

    animateContentSwitch(() => {
      setActiveProjectId(null);
      setActiveTopTab("home");
      setHighlight((current) => ({ ...current, opacity: 0 }));
    });
  };

  const goHomeFromHeader = () => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    params.delete("project");
    params.delete("tab");
    const query = params.toString();
    window.history.pushState({}, "", `/${query ? `?${query}` : ""}`);

    setTabPull(0);
    setLastfmOpen(false);
    setGithubOpen(false);
    setLinkedinOpen(false);

    animateContentSwitch(() => {
      setActiveProjectId(null);
      setActiveTopTab("home");
      setHighlight((current) => ({ ...current, opacity: 0 }));
    });
  };

  useEffect(() => {
    const onPopState = () => {
      const state = parseLocationState();
      if (!state.projectId && state.tab === "blog") {
        const currentUrl = new URL(window.location.href);
        const params = new URLSearchParams(currentUrl.search);
        params.delete("tab");
        params.delete("project");
        const query = params.toString();
        navigateWithTransition(`/blog${query ? `?${query}` : ""}`, "replace");
        return;
      }

      animateContentSwitch(() => {
        setActiveProjectId(state.projectId);
        setActiveTopTab(state.tab);
        if (state.tab === "void") {
          setVoidText(pickRandomVoidText());
        }
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const switchTopTab = (nextTab: "home" | "blog" | "void") => {
    if (nextTab === activeTopTab && !activeProjectId) {
      return;
    }

    if (nextTab === "blog") {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);
      params.delete("tab");
      params.delete("project");
      const query = params.toString();

      setTabPull(0);
      setLastfmOpen(false);
      setGithubOpen(false);
      setLinkedinOpen(false);
      setIsRoutingToBlog(true);
      setHoverTopTab("blog");
      setActiveProjectId(null);
      window.requestAnimationFrame(() => {
        setContentVisible(false);
      });

      if (tabTransitionRef.current !== null) {
        window.clearTimeout(tabTransitionRef.current);
      }
      tabTransitionRef.current = window.setTimeout(() => {
        window.sessionStorage.setItem(INTERNAL_NAV_KEY, "1");
        navigateWithTransition(`/blog${query ? `?${query}` : ""}`);
      }, ROUTE_NAV_DELAY_MS);
      return;
    }

    const syncAddressBar = () => {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);
      params.delete("tab");
      params.delete("project");

      const path = "/";
      if (nextTab === "void") {
        params.set("tab", "void");
      }

      const query = params.toString();
      const nextUrl = `${path}${query ? `?${query}` : ""}`;
      window.history.pushState({}, "", nextUrl);
    };

    syncAddressBar();

    setTabPull(0);
    setLastfmOpen(false);
    setGithubOpen(false);
    setLinkedinOpen(false);
    setIsRoutingToBlog(false);
    animateContentSwitch(() => {
      setActiveProjectId(null);
      if (nextTab === "void") {
        setVoidText(pickRandomVoidText());
      }
      setActiveTopTab(nextTab);
      if (nextTab === "home") {
        setHighlight((current) => ({ ...current, opacity: 0 }));
      }
    });
  };

  useEffect(() => {
    setTabPull(0);
    if (activeTopTab === "void") {
      setVoidTextVisible(true);
    }
  }, [activeTopTab]);

  useEffect(() => {
    if (!activeProjectId || !contentVisible) {
      return;
    }

    requestAnimationFrame(() => {
      revealProjectById(activeProjectId);
    });
  }, [activeProjectId, contentVisible]);

  useEffect(() => {
    if (!sayHiOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSayHiOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sayHiOpen]);

  useEffect(() => {
    document.body.style.overflow = sayHiOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sayHiOpen]);

  const startFreshChat = () => {
    chatNameRef.current = "";
    chatMsgRef.current = "";
    chatMailtoRef.current = "";
    setChatMessages([]);
    setChatRetryEmail(null);
    setChatStep("opening");
  };

  const handleNewChat = () => {
    chatPrevNameRef.current = chatNameRef.current;
    try { localStorage.removeItem("say-hi-chat"); } catch {}
    startFreshChat();
  };

  const handleUndo = () => {
    const msgs = chatMessages;
    const lastUserIdx = msgs.map(m => m.from).lastIndexOf("user");
    if (lastUserIdx === -1) return;
    const text = msgs[lastUserIdx].text;
    const newMsgs = msgs.slice(0, lastUserIdx);
    setChatTyping(false);
    setChatMessages(newMsgs);
    setChatInput(text);
    if (chatStep === "message" || chatStep === "name-sent") {
      chatNameRef.current = "";
      setChatStep("name");
    } else if (chatStep === "email" || chatStep === "message-sent") {
      chatMsgRef.current = "";
      setChatStep("message");
    } else if (chatStep === "done" || chatStep === "email-sent") {
      chatMailtoRef.current = "";
      setChatStep("email");
    }
  };

  useEffect(() => {
    if (!sayHiOpen) {
      setChatInput("");
      setChatTyping(false);
      return;
    }
    try {
      const raw = localStorage.getItem("say-hi-chat");
      if (raw) {
        const stored = JSON.parse(raw) as { messages: ChatMsg[]; step: ChatStep; name: string; msg: string; mailto: string };
        if (Array.isArray(stored.messages) && stored.messages.length > 0) {
          chatRestoringRef.current = true;
          chatIdRef.current = Math.max(0, ...stored.messages.map((m: ChatMsg) => m.id));
          setChatMessages(stored.messages);
          chatNameRef.current = stored.name ?? "";
          chatMsgRef.current = stored.msg ?? "";
          chatMailtoRef.current = stored.mailto ?? "";
          setChatStep(stored.step ?? "name");
          requestAnimationFrame(() => { chatRestoringRef.current = false; });
          return;
        }
      }
    } catch {}
    startFreshChat();
  }, [sayHiOpen]);

  useEffect(() => {
    if (chatRestoringRef.current) return;
    if (chatMessages.length === 0 && chatStep === "idle") return;
    try {
      localStorage.setItem("say-hi-chat", JSON.stringify({
        messages: chatMessages,
        step: chatStep,
        name: chatNameRef.current,
        msg: chatMsgRef.current,
        mailto: chatMailtoRef.current
      }));
    } catch {}
  }, [chatMessages, chatStep]);

  useEffect(() => {
    if (!sayHiOpen) return;
    if ((chatStep === "opening" || chatStep === "done") && chatRestoringRef.current) return;
    let t: number;
    if (chatStep === "opening") {
      setChatTyping(true);
      t = window.setTimeout(() => {
        setChatTyping(false);
        addChatMsg("daniel", "hey! what's your name? :)");
        if (chatPrevNameRef.current) {
          setChatInput(chatPrevNameRef.current);
          chatPrevNameRef.current = "";
        }
        setChatStep("name");
      }, 900);
    } else if (chatStep === "name-sent") {
      setChatTyping(true);
      t = window.setTimeout(() => {
        setChatTyping(false);
        addChatMsg("daniel", `nice to meet you, ${chatNameRef.current}! 👋 what's on your mind?`);
        setChatStep("message");
      }, 1100);
    } else if (chatStep === "message-sent") {
      setChatTyping(true);
      t = window.setTimeout(() => {
        setChatTyping(false);
        addChatMsg("daniel", "what's your email so I can hit you back?");
        setChatStep("email");
      }, 1000);
    } else if (chatStep === "email-sent") {
      setChatTyping(true);
      t = window.setTimeout(() => {
        setChatTyping(false);
        addChatMsg("daniel", "perfect! I'll reach back asap :3");
        setChatStep("done");
      }, 600);
    } else if (chatStep === "done") {
      t = window.setTimeout(() => {
        setSayHiOpen(false);
      }, 1800);
    }
    return () => window.clearTimeout(t);
  }, [chatStep, sayHiOpen]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatTyping]);

  useEffect(() => {
    if (!isTouchOnly) return;
    let idx = 0;
    const show = () => {
      const org = MARQUEE_ORGS[idx % MARQUEE_ORGS.length];
      idx++;
      showOrg({ name: org.name, category: org.category });
    };
    const first = window.setTimeout(show, 1400);
    const interval = window.setInterval(show, 2800);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      setHoveredOrg(null);
      setMarqueeLeaving(false);
      marqueeCurrentRef.current = null;
    };
  }, [isTouchOnly]);

  const tabIndex = (tab: "home" | "blog" | "void"): number => {
    if (tab === "home") return 0;
    if (tab === "blog") return 1;
    return 2;
  };

  const visualTopTab = isRoutingToBlog && hoverTopTab ? hoverTopTab : activeTopTab;
  const activeTabIndex = tabIndex(activeTopTab);
  const indicatorTab = activeProjectId ? (hoverTopTab ?? lastIndicatorTab) : visualTopTab;
  const indicatorVisible = activeProjectId ? hoverTopTab !== null : true;
  const currentProject = activeProjectId ? projectsById[activeProjectId] : null;
  const homeTabActive = !activeProjectId && visualTopTab === "home";
  const blogTabActive = !activeProjectId && visualTopTab === "blog";
  const voidTabActive = !activeProjectId && visualTopTab === "void";
  const topBarName = currentProject ? currentProject.name : displayName;
  const topBarSubtitle = currentProject ? currentProject.summary : statusText;
  const sanitizedProjectContent = useMemo(() => {
    if (!currentProject) {
      return "";
    }
    return sanitizeProjectHtml(currentProject.content);
  }, [currentProject]);

  useEffect(() => {
    if (hoverTopTab) {
      setLastIndicatorTab(hoverTopTab);
    }
  }, [hoverTopTab]);

  const handleTopTabsMove = (event: MouseEvent<HTMLDivElement>) => {
    if (activeProjectId) {
      setTabPull(0);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const innerOffset = 3;
    const tabWidth = (rect.width - innerOffset * 2) / 3;
    const activeLeft = rect.left + innerOffset + tabWidth * activeTabIndex;
    const activeRight = activeLeft + tabWidth;

    let outsideDelta = 0;
    if (event.clientX < activeLeft) {
      outsideDelta = event.clientX - activeLeft;
    } else if (event.clientX > activeRight) {
      outsideDelta = event.clientX - activeRight;
    }

    const pull = Math.max(-3.5, Math.min(3.5, outsideDelta * 0.06));
    setTabPull(pull);
  };

  const renderProjectsSection = () => (
    <section className="site-projects">
      <h2 className="site-projects-title">Projects</h2>
      <div className="site-project-rows" ref={rowContainerRef} onMouseLeave={hideProjectRowHighlight}>
        <div
          className="site-project-row-highlight cloneProjectHighlight"
          style={{
            top: `${highlight.top}px`,
            height: `${highlight.height}px`,
            opacity: highlight.opacity
          }}
        />
        <div className="site-project-row site-project-row-header">
          <span className="site-col-year">Year</span>
          <span className="site-col-sep" aria-hidden="true" />
          <span className="site-col-name">Project</span>
          <span className="site-col-type">Type</span>
        </div>
        {projects.map(({ id, year, name, type }, index) => (
          <a
            key={id}
            href={`/project/${id}`}
            title={`${name} | ${type} (${year})`}
            className="site-project-row"
            ref={(node) => {
              rowRefs.current[index] = node;
            }}
            onClick={(event) => {
              event.preventDefault();
              openProjectPage(id);
            }}
            onMouseEnter={() => revealProjectRow(index)}
            onFocus={() => revealProjectRow(index)}
          >
            <span className="site-col-year">{year}</span>
            <span className="site-col-sep" aria-hidden="true" />
            <span className="site-col-name">{name}</span>
            <span className="site-col-type">{type}</span>
          </a>
        ))}
      </div>
    </section>
  );

  return (
    <div data-vaul-drawer-wrapper>
      <div className={`site-loader${loaderDone ? " site-loader-done" : ""}`} aria-hidden="true">
        <span className="site-loader-number">
          {loaderProgress >= 100 ? "100" : String(loaderProgress).padStart(2, "0")}
        </span>
      </div>
      <main className="shared-module__q8HX2G__baseTypography site-main">
        <SiteTopBar
          visible={topBarVisible}
          noTransition={topBarNoTransition}
          name={topBarName}
          subtitle={topBarSubtitle}
          indicatorTab={indicatorTab}
          indicatorVisible={indicatorVisible}
          tabPull={tabPull}
          homeActive={homeTabActive}
          blogActive={blogTabActive}
          voidActive={voidTabActive}
          onTopTabsMove={handleTopTabsMove}
          onTopTabsLeave={() => {
            setTabPull(0);
            if (!isRoutingToBlog) {
              setHoverTopTab(null);
            }
          }}
          onHomeEnter={() => setHoverTopTab("home")}
          onBlogEnter={() => setHoverTopTab("blog")}
          onVoidEnter={() => setHoverTopTab("void")}
          onHomeClick={goHomeFromHeader}
          onBlogClick={() => switchTopTab("blog")}
          onVoidClick={() => switchTopTab("void")}
        />

        <div className={contentVisible ? shownStyle : hiddenStyle}>
          {activeProjectId && projectsById[activeProjectId] ? (
            <>
              <section className="project-page">
                <button
                  type="button"
                  className="project-page-link project-page-link-button project-page-link-top"
                  onClick={closeProjectPage}
                >
                  Back home
                </button>
                <div className="project-page-content">
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizedProjectContent }}
                  />
                </div>
              </section>
              {renderProjectsSection()}
            </>
          ) : activeTopTab === "home" ? (
            <>
              <section className="site-hero">
                <div className="site-hero-photo-col">
                  <div className="site-hero-photo-wrap">
                    <img
                      className="site-hero-photo"
                      src="/image.jpg"
                      alt={displayName}
                      loading="eager"
                      draggable={false}
                    />
                  </div>
                  <button
                    type="button"
                    className="site-hero-say-hi-btn"
                    onClick={() => setSayHiOpen(true)}
                  >
                    Let's talk! <img src="/envelope.png" alt="envelope" className="site-hero-wave" draggable={false} />
                  </button>
                  <div className="site-hero-icon-row">
                    <button
                      ref={linkedinTriggerRef as unknown as React.RefObject<HTMLButtonElement>}
                      type="button"
                      className="site-hero-icon-btn"
                      aria-label="LinkedIn"
                      onMouseEnter={openLinkedin}
                      onMouseLeave={closeLinkedin}
                      onFocus={openLinkedin}
                      onBlur={closeLinkedin}
                    >
                      <a href="https://www.linkedin.com/in/daniel-negre/" title="Daniel Negre on LinkedIn"><img src="/linkedin.svg" alt="LinkedIn" draggable={false} /></a>
                    </button>
                    <button
                      ref={githubTriggerRef as unknown as React.RefObject<HTMLButtonElement>}
                      type="button"
                      className="site-hero-icon-btn"
                      aria-label="GitHub"
                      onMouseEnter={() => { githubActiveTriggerRef.current = githubTriggerRef.current; openGithub(); }}
                      onMouseLeave={closeGithub}
                      onFocus={() => { githubActiveTriggerRef.current = githubTriggerRef.current; openGithub(); }}
                      onBlur={closeGithub}
                    >
                      <a href="https://github.com/justdanielndev/" title="Daniel Negre on GitHub"><img src="/github.svg" alt="GitHub" draggable={false} /></a>
                    </button>
                    <span className="inline-tooltip-wrapper">
                      <button
                        type="button"
                        className="site-hero-icon-btn"
                        aria-label="Copy email"
                        onClick={handleCopyEmail}
                        onMouseEnter={showEmailTooltip}
                        onMouseLeave={hideEmailTooltip}
                        onFocus={showEmailTooltip}
                        onBlur={hideEmailTooltip}
                      >
                        <img src="/email.svg" alt="Email" draggable={false} />
                      </button>
                      <span
                        className={`inline-copy-tooltip ${emailTooltipVisible ? "inline-copy-tooltip-visible" : ""}`}
                        role="status"
                        aria-live="polite"
                      >
                        {emailTooltipText}
                      </span>
                    </span>
                  </div>
                </div>
                <p className="site-hero-desc">
                  Hey there! <img src="/wave.png" alt="👋" className="site-hero-wave" draggable={false} /> I'm <b className="font-bold text-[##99c7e8]">{displayName}</b>, a director, writer, developer... Overall, I make projects that are designed to improve people's lives.
                </p>
                <p className="site-hero-bio-p">
                  In addition to this, I am the Founder and Chief Director of<br/>{" "}
                  <img src="/nix.png" alt="Nix Entertainment logo" className="bio-inline-logo bio-inline-nix" draggable={false} />
                  <a
                    href="/project/nixentertainment"
                    title="Nix Entertainment | Daniel's media group"
                    onClick={(event) => {
                      event.preventDefault();
                      openProjectPage("nixentertainment");
                    }}
                  >
                    Nix Entertainment
                  </a>
                  . We're a media group working on projects like{" "}
                  <a href="https://nixentertainment.com/shadowborne-chronicles" title="Shadowborne Chronicles | Animated Series by Nix Entertainment" target="_blank" rel="noopener noreferrer">
                    <span className="shadowborne-wrap" style={{ pointerEvents: "none" }}>
                      <img src="/shadowborne.png" alt="Shadowborne Chronicles" className="bio-inline-logo bio-inline-logo-wide shadowborne-default" draggable={false} />
                      <img src="/shadowborne-white.png" alt="Shadowborne Chronicles" className="bio-inline-logo bio-inline-logo-wide shadowborne-white" draggable={false} aria-hidden="true" />
                    </span>
                  </a>
                  , a fantasy animated series that I'm proudly directing. We also have some secret stuff in the works that I can't talk about yet, but stay tuned!
                </p>
              </section>

              <div
                className="site-marquee-wrap"
                onMouseEnter={startMarqueeTracking}
                onMouseLeave={stopMarqueeTracking}
                onMouseMove={(e) => { marqueeMouseRef.current = { x: e.clientX, y: e.clientY }; }}
              >
                <p className="site-marquee-label-row">
                  <span className={`marquee-ls${hoveredOrg && !marqueeLeaving ? " marquee-ls-back" : ""}`}>I've worked with</span>
                  {!hoveredOrg && <>:</>}
                  {hoveredOrg && [hoveredOrg.category, "like", hoveredOrg.name].map((word, i) => (
                    <span
                      key={`${hoveredOrg.name}-${i}`}
                      className={`marquee-word${marqueeLeaving ? " marquee-word-out" : ""}`}
                      style={{ animationDelay: marqueeLeaving ? `${i * 25}ms` : `${i * 120}ms` }}
                    >
                      {" "}{word}
                    </span>
                  ))}
                </p>
                <div className="site-marquee-track" aria-hidden="true">
                  {[...MARQUEE_ORGS, ...MARQUEE_ORGS].map((item, i) => (
                    <div
                      key={i}
                      className="site-marquee-item"
                      data-marquee-item
                      data-org-name={item.name}
                      data-org-category={item.category}
                    >
                      <img
                        className="site-marquee-icon"
                        src={item.img}
                        alt={item.name}
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <section className="site-bio">
                <p>
                    Outside of work, I make projects for competitions, like{" "}
                  <a
                    href="/project/soundchestai"
                    title="SoundChestAI | AI-powered stethoscope by Daniel Negre"
                    onClick={(event) => {
                      event.preventDefault();
                      openProjectPage("soundchestai");
                    }}
                  >
                    <span style={{ pointerEvents: "none" }}>SoundChestAI</span>
                  </a>
                  , an AI-powered stethoscope that detects lung anomalies and won us a trip to Barcelona, as well as some fun passion projects you can find on my{" "}
                  <a
                    href={github?.profileUrl ?? `https://github.com/${encodeURIComponent(GITHUB_USER)}`}
                    title="Daniel Negre on GitHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={(e) => { githubActiveTriggerRef.current = e.currentTarget as HTMLElement; openGithub(); }}
                    onMouseLeave={closeGithub}
                    onFocus={(e) => { githubActiveTriggerRef.current = e.currentTarget as HTMLElement; openGithub(); }}
                    onBlur={closeGithub}
                  >
                    <span style={{ pointerEvents: "none" }}>GitHub</span>
                  </a>
                  .
                </p>
                <p>
                  In order to be able to run all the software involved in my designs, I built a custom company-scale server called{" "}
                  <a
                    href="/project/le-node"
                    title="Le Node | Daniel's custom homelab server"
                    onClick={(event) => {
                      event.preventDefault();
                      openProjectPage("le-node");
                    }}
                  >
                    <span style={{ pointerEvents: "none" }}>Le Node</span>
                  </a>
                  , which is designed to be powerful and easy to deploy on, totaling 100+ GB of RAM and 30 CPU cores across all nodes.
                </p>
                <p>
                  When I'm not working, eating or sleeping, I like to research and investigate how things around us work, as well as listen to music. If you want to see what I'm listening to at the moment,{" "}
                  <span className="lastfm-trigger" onMouseEnter={openLastfm} onMouseLeave={closeLastfm}>
                    <button
                      ref={lastfmTriggerRef}
                      type="button"
                      className="lastfm-trigger-button"
                      aria-haspopup="dialog"
                      aria-expanded={lastfmOpen}
                      onFocus={openLastfm}
                      onBlur={closeLastfm}
                    >
                      <span style={{ pointerEvents: "none" }}>{isTouchOnly ? "click here" : "hover here"}</span>
                    </button>
                  </span>
                  !
                </p>
                <div className="site-bio-line">
                  Want to contact/work with me?{" "}
                  <button
                    type="button"
                    className="email-copy-button"
                    onClick={() => setSayHiOpen(true)}
                  >
                    <span style={{ pointerEvents: "none" }}>
                      Let's talk!
                    </span>
                  </button>
                </div>
              </section>

              {renderProjectsSection()}
            </>
          ) : activeTopTab === "blog" ? (
            <section className="site-centered-page">
            </section>
          ) : (
            <section className="site-centered-page">
              <button
                type="button"
                className={`site-centered-text site-void-text cloneReveal ${voidTextVisible ? "cloneShown" : "cloneHidden"}`}
                onClick={rerollVoidText}
                aria-label="Summon another message from the void"
              >
                {voidText}
              </button>
            </section>
          )}
        </div>

      </main>

      <div
        role="dialog"
        aria-label="Last.fm preview"
        className={`lastfm-preview-card-float ${lastfmOpen ? "lastfm-preview-card-float-open" : ""}`}
        style={{ top: `${lastfmPos.top}px`, left: `${lastfmPos.left}px` }}
        onMouseEnter={openLastfm}
        onMouseLeave={closeLastfm}
      >
        {(() => {
          const inner = (
            <>
              {lastfm?.albumArt ? (
                <img className="cloneLastfmArt" src={lastfm.albumArt} alt={`${lastfm.track} album art`} loading="lazy" />
              ) : (
                <div className="cloneLastfmBadge" aria-hidden="true">L</div>
              )}
              <div className="previewInfo">
                <p className="previewTitle">Last.fm</p>
                <p className="previewMeta">
                  {lastfm ? `${lastfm.track} - ${lastfm.artist}` : "Loading track..."}
                </p>
                <p className="previewHint">
                  {lastfm?.nowPlaying
                    ? "Now playing"
                    : lastfm?.timestamp
                      ? formatLastPlayedLabel(lastfm.timestamp)
                      : null}
                </p>
              </div>
            </>
          );
          return lastfm?.url
            ? <a href={lastfm.url} target="_blank" rel="noopener noreferrer" className="cloneLastfmCard" aria-label="Open on Last.fm" title={`${lastfm.track} by ${lastfm.artist} on Last.fm`}>{inner}</a>
            : <div className="cloneLastfmCard">{inner}</div>;
        })()}
      </div>

      <div
        aria-label="GitHub preview"
        className={`github-preview-card-float ${githubOpen ? "github-preview-card-float-open" : ""}`}
        style={{ top: `${githubPos.top}px`, left: `${githubPos.left}px` }}
      >
        <div className="cloneLastfmCard cloneGithubCard">
          <div className="cloneGithubHeader">
            <img className="cloneGithubAvatar" src={github?.avatarUrl ?? "/linkedin.jpg"} alt={github?.user ?? "GitHub avatar"} loading="lazy" />
            <div className="previewInfo">
              <p className="previewTitle">GitHub</p>
              <p className="previewMeta">@{github?.user ?? GITHUB_USER}</p>
            </div>
          </div>
          <img className="cloneGithubChart" src={github?.contributionsUrl ?? `https://ghchart.rshah.org/409ba5/${encodeURIComponent(GITHUB_USER)}`} alt="GitHub contribution graph" loading="lazy" />
        </div>
      </div>

      <div
        aria-label="LinkedIn preview"
        className={`linkedin-preview-card-float ${linkedinOpen ? "linkedin-preview-card-float-open" : ""}`}
        style={{ top: `${linkedinPos.top}px`, left: `${linkedinPos.left}px` }}
      >
        <div className="cloneLastfmCard cloneLinkedinCard">
          <img className="cloneLinkedinAvatar" src="/linkedin.jpg" alt="Daniel Negre" loading="lazy" />
          <div className="previewInfo">
            <p className="previewTitle">LinkedIn</p>
            <p className="previewMeta">Founder @ Nix Entertainment | Media Production</p>
            <p className="previewHint">Director and founder at Nix Entertainment, Hack Club contributor, and...</p>
          </div>
        </div>
      </div>

      {sayHiOpen && (
        <div className="say-hi-overlay" onClick={() => setSayHiOpen(false)}>
          <div className="say-hi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="say-hi-chat-header">
              {chatMessages.some(m => m.from === "user") && chatStep !== "done" && chatRetryEmail === null && (
                <button type="button" className="say-hi-undo-btn" onClick={handleUndo} aria-label="Undo">Undo</button>
              )}
              <img src="/linkedin.jpg" alt="Daniel Negre" className="say-hi-chat-avatar" loading="eager" />
              <span className="say-hi-chat-name">Daniel</span>
              <button type="button" className="say-hi-close" onClick={() => setSayHiOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="say-hi-chat-area" ref={chatScrollRef}>
              {chatMessages.map((msg, i) => {
                const prev = chatMessages[i - 1];
                const next = chatMessages[i + 1];
                const isNewGroup = !prev || prev.from !== msg.from;
                const isLastInGroup = !next || next.from !== msg.from;
                return (
                  <div key={msg.id} className={`say-hi-msg-row ${msg.from}${isNewGroup ? " new-group" : ""}`}>
                    <div className={`say-hi-bubble ${msg.from}`}>{msg.text}</div>
                    {isLastInGroup && (
                      <span className="say-hi-msg-time">{msg.time}</span>
                    )}
                    {msg.from === "user" && isLastInGroup && !chatTyping && (
                      <span className="say-hi-delivered">Delivered</span>
                    )}
                  </div>
                );
              })}
              {chatTyping && (
                <div className="say-hi-msg-row daniel">
                  <div className="say-hi-typing">
                    <span className="say-hi-typing-dot" />
                    <span className="say-hi-typing-dot" />
                    <span className="say-hi-typing-dot" />
                  </div>
                </div>
              )}
            </div>
            {chatStep === "done" ? (
              <div className="say-hi-new-chat-row">
                <button type="button" className="say-hi-new-chat-pill" onClick={handleNewChat}>
                  New Chat
                </button>
              </div>
            ) : chatStep === "email" && chatRetryEmail !== null ? (
              <div className="say-hi-new-chat-row">
                <button
                  type="button"
                  className="say-hi-new-chat-pill"
                  onClick={() => { setChatRetryEmail(null); sendEmail(chatRetryEmail); }}
                >
                  Retry →
                </button>
              </div>
            ) : chatStep !== "idle" && chatStep !== "opening" && (
              <form className="say-hi-input-row" onSubmit={handleChatSend}>
                <input
                  className="say-hi-chat-input"
                  type={chatStep === "email" ? "email" : "text"}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    chatStep === "name" ? "Your name" :
                    chatStep === "message" ? "Your message" :
                    chatStep === "email" ? "your@email.com" : ""
                  }
                  disabled={chatTyping || chatStep.endsWith("-sent")}
                  autoFocus
                />
                <button
                  type="submit"
                  className="say-hi-send-btn"
                  disabled={!chatInput.trim() || chatTyping || chatStep.endsWith("-sent")}
                  aria-label="Send"
                />
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
