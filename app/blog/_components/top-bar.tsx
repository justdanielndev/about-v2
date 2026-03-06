"use client";

import { getDefaultName } from "@/lib/name-resolution";
import SiteTopBar from "@/components/site-top-bar";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

type TopBarProps = {
  active: "home" | "blog" | "void";
};

const ROUTE_NAV_DELAY_MS = 220;
const INTERNAL_NAV_KEY = "site-internal-nav";

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

function tabIndex(tab: "home" | "blog" | "void"): number {
  if (tab === "home") return 0;
  if (tab === "blog") return 1;
  return 2;
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

function getRandomStatusLine(): string {
  const bucket = getTimeBucketInSpain();
  const options = STATUS_MESSAGES[bucket];
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

export default function TopBar({ active }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasInternalNav = typeof window !== "undefined" && window.sessionStorage.getItem(INTERNAL_NAV_KEY) !== null;
  const displayName = getDefaultName();
  const [topBarVisible, setTopBarVisible] = useState(hasInternalNav);
  const [topBarNoTransition, setTopBarNoTransition] = useState(hasInternalNav);
  const [statusText, setStatusText] = useState(" ");
  const [hoverTopTab, setHoverTopTab] = useState<"home" | "blog" | "void" | null>(null);
  const [navigatingTab, setNavigatingTab] = useState<"home" | "blog" | "void" | null>(null);
  const [tabPull, setTabPull] = useState(0);
  const navTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const storageKey = "site-status-line";
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) {
      setStatusText(existing);
      return;
    }

    const generated = getRandomStatusLine();
    window.sessionStorage.setItem(storageKey, generated);
    setStatusText(generated);
  }, []);

  useEffect(() => {
    let shown = false;
    const showTopBar = () => {
      if (shown) {
        return;
      }

      shown = true;
      setTopBarVisible(true);
    };

    const internalNav = window.sessionStorage.getItem(INTERNAL_NAV_KEY);
    if (internalNav) {
      window.sessionStorage.removeItem(INTERNAL_NAV_KEY);
      setTopBarNoTransition(true);
      showTopBar();
      return;
    }

    setTopBarNoTransition(false);
    const frame = window.requestAnimationFrame(showTopBar);
    const fallback = window.setTimeout(showTopBar, 120);
    const onPageShow = () => showTopBar();
    const onVisibilityChange = () => {
      if (!document.hidden) {
        showTopBar();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current !== null) {
        window.clearTimeout(navTimeoutRef.current);
      }
    };
  }, []);

  const goTo = (tab: "home" | "blog" | "void") => {
    const isBlogDetailPage = pathname !== "/blog";
    if (navigatingTab !== null) {
      return;
    }

    if (tab === "blog" && !isBlogDetailPage) {
      return;
    }

    if (tab !== "blog" && tab === active && !isBlogDetailPage) {
      return;
    }

    setTabPull(0);
    setHoverTopTab(tab);
    setNavigatingTab(tab);
    window.dispatchEvent(new Event("site:blog-nav-start"));

    if (tab === "home" || tab === "void") {
      window.sessionStorage.setItem("from-blog-nav", tab);
    }

    const href = tab === "home" ? "/" : tab === "void" ? "/?tab=void" : "/blog";
    navTimeoutRef.current = window.setTimeout(() => {
      window.sessionStorage.setItem(INTERNAL_NAV_KEY, "1");
      router.push(href);
    }, ROUTE_NAV_DELAY_MS);
  };

  const isBlogDetailPage = pathname !== "/blog";
  const inactiveLikeProject = isBlogDetailPage && navigatingTab === null;
  const effectiveTab = navigatingTab ?? active;
  const activeTabIndex = tabIndex(effectiveTab);
  const indicatorTab = inactiveLikeProject ? (hoverTopTab ?? effectiveTab) : effectiveTab;
  const indicatorVisible = inactiveLikeProject ? hoverTopTab !== null || navigatingTab !== null : true;

  const handleTopTabsMove = (event: MouseEvent<HTMLDivElement>) => {
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

  const homeActive = !inactiveLikeProject && effectiveTab === "home";
  const blogActive = !inactiveLikeProject && effectiveTab === "blog";
  const voidActive = !inactiveLikeProject && effectiveTab === "void";

  return (
    <SiteTopBar
      visible={topBarVisible}
      noTransition={topBarNoTransition}
      name={displayName}
      subtitle={statusText}
      indicatorTab={indicatorTab}
      indicatorVisible={indicatorVisible}
      tabPull={tabPull}
      homeActive={homeActive}
      blogActive={blogActive}
      voidActive={voidActive}
      onTopTabsMove={handleTopTabsMove}
      onTopTabsLeave={() => {
        setTabPull(0);
        if (navigatingTab === null) {
          setHoverTopTab(null);
        }
      }}
      onHomeEnter={() => setHoverTopTab("home")}
      onBlogEnter={() => setHoverTopTab("blog")}
      onVoidEnter={() => setHoverTopTab("void")}
      onHomeClick={() => goTo("home")}
      onBlogClick={() => goTo("blog")}
      onVoidClick={() => goTo("void")}
    />
  );
}
