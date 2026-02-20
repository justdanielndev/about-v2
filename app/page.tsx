"use client";

import { DEFAULT_TRUENAME, getDefaultName, resolveDisplayName } from "@/lib/name-resolution";
import { projects, projectsById } from "@/lib/projects";
import { sanitizeProjectHtml } from "@/lib/sanitize-html";
import type { MouseEvent } from "react";
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
  url: string;
};

type GithubData = {
  user: string;
  profileUrl: string;
  avatarUrl: string | null;
  contributionsUrl: string;
};

const hiddenStyle = "cloneReveal cloneHidden";
const shownStyle = "cloneReveal cloneShown";
const LASTFM_USER = "pluralzoe";
const LINKEDIN_URL = "https://www.linkedin.com/in/daniel-negre/";
const GITHUB_USER = "justdanielndev";

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
  const name = resolveDisplayName({
    hostname: window.location.hostname,
    searchParams: new URLSearchParams(window.location.search)
  });
  
  if (name.toLowerCase() === DEFAULT_TRUENAME.toLowerCase()) {
    return ":3";
  }
  
  return ":D";

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

export default function Home() {
  const [visible, setVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [isTouchOnly, setIsTouchOnly] = useState(false);
  const [displayName, setDisplayName] = useState(getDefaultName());
  const [statusText, setStatusText] = useState(" ");
  const [activeTopTab, setActiveTopTab] = useState<"home" | "blog" | "void">("home");
  const [hoverTopTab, setHoverTopTab] = useState<"home" | "blog" | "void" | null>(null);
  const [lastIndicatorTab, setLastIndicatorTab] = useState<"home" | "blog" | "void">("home");
  const [voidText, setVoidText] = useState(VOID_CONTENT[0]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
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
  const linkedinTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const linkedinCloseTimer = useRef<number | null>(null);
  const githubTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const githubCloseTimer = useRef<number | null>(null);
  const tabTransitionRef = useRef<number | null>(null);
  const emailTooltipTimer = useRef<number | null>(null);
  const [emailTooltipText, setEmailTooltipText] = useState("click to copy");
  const [emailTooltipVisible, setEmailTooltipVisible] = useState(false);

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

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const resolved = resolveDisplayName({
      hostname: window.location.hostname,
      searchParams: new URLSearchParams(window.location.search)
    });
    setDisplayName(resolved);

    const initialState = parseLocationState();
    setActiveTopTab(initialState.tab);
    setActiveProjectId(initialState.projectId);
    if (initialState.tab === "void") {
      setVoidText(pickRandomVoidText());
    }

    setStatusText(getRandomStatusLine());

    const timer = window.setTimeout(() => {
      setVisible(true);
      setContentVisible(true);
    }, 30);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (tabTransitionRef.current !== null) {
        window.clearTimeout(tabTransitionRef.current);
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
        const response = await fetch(`/api/github?user=${encodeURIComponent(GITHUB_USER)}`);
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
      const trigger = githubTriggerRef.current;
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
    }, 90);
  };

  const openGithub = () => {
    if (githubCloseTimer.current !== null) {
      window.clearTimeout(githubCloseTimer.current);
      githubCloseTimer.current = null;
    }

    const trigger = githubTriggerRef.current;
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
    }, 90);
  };

  const emailAddress =
    displayName.toLowerCase() === DEFAULT_TRUENAME.toLowerCase() ? "zoe@negrenavarro.me" : "daniel@negrenavarro.me";

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

  const animateContentSwitch = (updater: () => void) => {
    setContentVisible(false);
    if (tabTransitionRef.current !== null) {
      window.clearTimeout(tabTransitionRef.current);
    }
    tabTransitionRef.current = window.setTimeout(() => {
      updater();
      requestAnimationFrame(() => setContentVisible(true));
    }, 220);
  };

  const openProjectPage = (projectId: string) => {
    if (!projectsById[projectId]) {
      return;
    }
    if (projectId === activeProjectId) {
      return;
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

    animateContentSwitch(() => {
      setActiveProjectId(projectId);
      setActiveTopTab("home");
    });
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

    const syncAddressBar = () => {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);
      params.delete("tab");
      params.delete("project");

      const path = "/";
      if (nextTab === "blog") {
        params.set("tab", "blog");
      } else if (nextTab === "void") {
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
  }, [activeTopTab]);

  useEffect(() => {
    if (!activeProjectId || !contentVisible) {
      return;
    }

    requestAnimationFrame(() => {
      revealProjectById(activeProjectId);
    });
  }, [activeProjectId, contentVisible]);

  const tabIndex = (tab: "home" | "blog" | "void"): number => {
    if (tab === "home") {
      return 0;
    }
    if (tab === "blog") {
      return 1;
    }
    return 2;
  };

  const activeTabIndex = tabIndex(activeTopTab);
  const indicatorTab = activeProjectId ? (hoverTopTab ?? lastIndicatorTab) : activeTopTab;
  const indicatorVisible = activeProjectId ? hoverTopTab !== null : true;
  const indicatorIndex = indicatorTab ? tabIndex(indicatorTab) : 0;
  const currentProject = activeProjectId ? projectsById[activeProjectId] : null;
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
      <main className="shared-module__q8HX2G__baseTypography site-main">
        <div className={visible ? shownStyle : hiddenStyle}>
          <header className="site-header">
            <a
              href="/"
              className="site-header-home"
              onClick={(event) => {
                event.preventDefault();
                goHomeFromHeader();
              }}
              aria-label="Go to home"
            >
              <h1 id="display-name" className="site-name" suppressHydrationWarning>{currentProject ? currentProject.name : displayName}</h1>
              <div className="site-tagline">{currentProject ? currentProject.summary : statusText}</div>
            </a>
            <div
              className="cloneTopTabs"
              role="tablist"
              aria-label="Primary sections"
              style={{
                ["--tab-index" as string]: indicatorIndex,
                ["--tab-pull" as string]: `${tabPull}px`,
                ["--tab-visible" as string]: indicatorVisible ? 1 : 0
              }}
              onMouseMove={handleTopTabsMove}
              onMouseLeave={() => {
                setTabPull(0);
                setHoverTopTab(null);
              }}
            >
              <div className="cloneTopTabsIndicator" />
              <button
                type="button"
                role="tab"
                aria-selected={activeTopTab === "home"}
                className={`cloneTopTab ${!activeProjectId && activeTopTab === "home" ? "cloneTopTabActive" : ""}`}
                onMouseEnter={() => setHoverTopTab("home")}
                onClick={() => switchTopTab("home")}
              >
                Home
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTopTab === "blog"}
                className={`cloneTopTab ${!activeProjectId && activeTopTab === "blog" ? "cloneTopTabActive" : ""}`}
                onMouseEnter={() => setHoverTopTab("blog")}
                onClick={() => switchTopTab("blog")}
              >
                Blog
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTopTab === "void"}
                className={`cloneTopTab ${!activeProjectId && activeTopTab === "void" ? "cloneTopTabActive" : ""}`}
                onMouseEnter={() => setHoverTopTab("void")}
                onClick={() => switchTopTab("void")}
              >
                ???
              </button>
            </div>
          </header>
        </div>

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
              <section className="site-bio">
            <p>Hey {getExpression()} I'm <span className={getExpression() == ":3" ? "display-name-real" : "display-name-default"}>{displayName}</span>! I'm a director, writer, developer... Overall, I make projects that are designed improve people's lives.</p>
            <p>
              The "coolest" part of what I do? I'm the founder and director of{" "}
              <a
                href="/project/nixentertainment"
                onClick={(event) => {
                  event.preventDefault();
                  openProjectPage("nixentertainment");
                }}
              >
                <span style={{ pointerEvents: "none" }}>Nix Entertainment</span>
              </a>
              . We're a small media group working on a bunch of cool projects (like {" "}
              <a href="https://nixentertainment.com/shadowborne-chronicles" target="_blank" rel="noopener noreferrer">
                <span style={{ pointerEvents: "none" }}>Shadowborne Chronicles</span>
              </a>, a fantasy animated series that I'm directing and writing). We also have some secret stuff in the works that I can't talk about yet, but stay tuned!
            </p>
            <p>I've also worked on lots of projects for competitions (like {" "}
              <a
                href="/project/soundchestai"
                onClick={(event) => {
                  event.preventDefault();
                  openProjectPage("soundchestai");
                }}
              >
                <span style={{ pointerEvents: "none" }}>SoundChestAI</span>
              </a>, an AI-powered sthetoscope that can detect anomalies in lung sounds, which made us win a trip to Barcelona!), as well as some fun passion projects you can find on my {" "}
              <a
                  ref={githubTriggerRef}
                  href={github?.profileUrl ?? `https://github.com/${encodeURIComponent(GITHUB_USER)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={openGithub}
                  onMouseLeave={closeGithub}
                  onFocus={openGithub}
                  onBlur={closeGithub}
                >
                  <span style={{ pointerEvents: "none" }}>GitHub</span>
                </a>.
            </p>
            <p>
              When I'm not working, eating or sleeping, I like to research and investigate about random things, as well as listen to music. If you want to see what I'm listening to at the moment, {" "}
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
              Want to contact/work with me? DM me on{" "}
              <span>
                <a
                  ref={linkedinTriggerRef}
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={openLinkedin}
                  onMouseLeave={closeLinkedin}
                  onFocus={openLinkedin}
                  onBlur={closeLinkedin}
                >
                  <span style={{ pointerEvents: "none" }}>LinkedIn</span>
                </a>
              </span>
              , or{" "}
              <span className="inline-tooltip-wrapper">
                <button
                  type="button"
                  className="email-copy-button"
                  onClick={handleCopyEmail}
                  onMouseEnter={showEmailTooltip}
                  onMouseLeave={hideEmailTooltip}
                  onFocus={showEmailTooltip}
                  onBlur={hideEmailTooltip}
                >
                  <span style={{ pointerEvents: "none" }}>write me an email</span>
                </button>
                <span
                  className={`inline-copy-tooltip ${emailTooltipVisible ? "inline-copy-tooltip-visible" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {emailTooltipText}
                </span>
              </span>!
            </div>
              </section>

              {renderProjectsSection()}
            </>
          ) : activeTopTab === "blog" ? (
            <section className="site-centered-page">
              <p className="site-centered-text">Blog's coming soon!</p>
            </section>
          ) : (
            <section className="site-centered-page">
              <p className="site-centered-text">{voidText}</p>
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
        <a
          href={lastfm?.url ?? `https://www.last.fm/user/${encodeURIComponent(LASTFM_USER)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cloneLastfmCard"
          aria-label={`Open Last.fm profile for ${lastfm?.user ?? LASTFM_USER}`}
        >
          {lastfm?.albumArt ? (
            <img className="cloneLastfmArt" src={lastfm.albumArt} alt="" loading="lazy" />
          ) : (
            <div className="cloneLastfmBadge" aria-hidden="true">L</div>
          )}
          <div className="previewInfo">
            <p className="previewTitle">Last.fm</p>
            <p className="previewMeta">
              {lastfm ? `${lastfm.track} - ${lastfm.artist}` : "Loading recent track..."}
            </p>
            <p className="previewHint">
              {lastfm?.nowPlaying
                ? "Now playing"
                : lastfm?.timestamp
                  ? `Last played ${new Date(lastfm.timestamp * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                  : "Open profile"}
            </p>
          </div>
        </a>
      </div>

      <div
        role="dialog"
        aria-label="GitHub preview"
        className={`github-preview-card-float ${githubOpen ? "github-preview-card-float-open" : ""}`}
        style={{ top: `${githubPos.top}px`, left: `${githubPos.left}px` }}
        onMouseEnter={openGithub}
        onMouseLeave={closeGithub}
      >
        <a
          href={github?.profileUrl ?? `https://github.com/${encodeURIComponent(GITHUB_USER)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cloneLastfmCard cloneGithubCard"
          aria-label={`Open GitHub profile for ${github?.user ?? GITHUB_USER}`}
        >
          <div className="cloneGithubHeader">
            <img className="cloneGithubAvatar" src={github?.avatarUrl ?? "/linkedin.png"} alt="" loading="lazy" />
            <div className="previewInfo">
              <p className="previewTitle">GitHub</p>
              <p className="previewMeta">@{github?.user ?? GITHUB_USER}</p>
            </div>
          </div>
          <img className="cloneGithubChart" src={github?.contributionsUrl ?? `https://ghchart.rshah.org/409ba5/${encodeURIComponent(GITHUB_USER)}`} alt="GitHub contribution graph" loading="lazy" />
        </a>
      </div>

      <div
        role="dialog"
        aria-label="LinkedIn preview"
        className={`linkedin-preview-card-float ${linkedinOpen ? "linkedin-preview-card-float-open" : ""}`}
        style={{ top: `${linkedinPos.top}px`, left: `${linkedinPos.left}px` }}
        onMouseEnter={openLinkedin}
        onMouseLeave={closeLinkedin}
      >
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cloneLastfmCard cloneLinkedinCard"
          aria-label={`Open LinkedIn profile for ${displayName}`}
        >
          <img className="cloneLinkedinAvatar" src="/linkedin.png" alt="" loading="lazy" />
          <div className="previewInfo">
            <p className="previewTitle">LinkedIn</p>
            <p className="previewMeta">Founder @ Nix Entertainment | Media Production</p>
            <p className="previewHint">Director and founder at Nix Entertainment, Hack Club contributor, and...</p>
          </div>
        </a>
      </div>
    </div>
  );
}
