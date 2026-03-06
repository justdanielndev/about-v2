"use client";

import type { CSSProperties, MouseEvent } from "react";

export type TopTab = "home" | "blog" | "void";

type SiteTopBarProps = {
  visible: boolean;
  noTransition?: boolean;
  name: string;
  subtitle: string;
  indicatorTab: TopTab;
  indicatorVisible: boolean;
  tabPull: number;
  homeActive: boolean;
  blogActive: boolean;
  voidActive: boolean;
  onTopTabsMove: (event: MouseEvent<HTMLDivElement>) => void;
  onTopTabsLeave: () => void;
  onHomeClick: () => void;
  onBlogClick: () => void;
  onVoidClick: () => void;
  onHomeEnter: () => void;
  onBlogEnter: () => void;
  onVoidEnter: () => void;
};

function tabIndex(tab: TopTab): number {
  if (tab === "home") return 0;
  if (tab === "blog") return 1;
  return 2;
}

export default function SiteTopBar({
  visible,
  noTransition = false,
  name,
  subtitle,
  indicatorTab,
  indicatorVisible,
  tabPull,
  homeActive,
  blogActive,
  voidActive,
  onTopTabsMove,
  onTopTabsLeave,
  onHomeClick,
  onBlogClick,
  onVoidClick,
  onHomeEnter,
  onBlogEnter,
  onVoidEnter
}: SiteTopBarProps) {
  const wrapperClass = `${visible ? "cloneReveal cloneShown" : "cloneReveal cloneHidden"}${noTransition ? " cloneRevealNoTransition" : ""}`;
  const indicatorIndex = tabIndex(indicatorTab);

  const topTabsStyle = {
    ["--tab-index" as string]: indicatorIndex,
    ["--tab-pull" as string]: `${tabPull}px`,
    ["--tab-visible" as string]: indicatorVisible ? 1 : 0
  } as CSSProperties;

  return (
    <div className={wrapperClass}>
      <header className="site-header">
        <button
          type="button"
          className="site-header-home"
          aria-label="Go to home"
          onClick={onHomeClick}
        >
          <h1 id="display-name" className="site-name" suppressHydrationWarning>
            {name}
          </h1>
          <div className="site-tagline">{subtitle}</div>
        </button>
        <div
          className="cloneTopTabs"
          role="tablist"
          aria-label="Primary sections"
          style={topTabsStyle}
          onMouseMove={onTopTabsMove}
          onMouseLeave={onTopTabsLeave}
        >
          <div className="cloneTopTabsIndicator" />
          <button
            type="button"
            role="tab"
            aria-selected={homeActive}
            className={`cloneTopTab ${homeActive ? "cloneTopTabActive" : ""}`}
            onMouseEnter={onHomeEnter}
            onClick={onHomeClick}
            aria-label="Go to home"
          >
            Home
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={blogActive}
            className={`cloneTopTab ${blogActive ? "cloneTopTabActive" : ""}`}
            onMouseEnter={onBlogEnter}
            onClick={onBlogClick}
            aria-label="Go to blog"
          >
            Blog
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={voidActive}
            className={`cloneTopTab ${voidActive ? "cloneTopTabActive" : ""}`}
            onMouseEnter={onVoidEnter}
            onClick={onVoidClick}
            aria-label="Go to void"
          >
            ???
          </button>
        </div>
      </header>
    </div>
  );
}
