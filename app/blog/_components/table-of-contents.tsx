"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Icon from "supercons";
import type { BlogHeading } from "@/lib/blog";
import styles from "../blog.module.css";

type TableOfContentsProps = {
  headings: BlogHeading[];
};

type TocNode = {
  id: string;
  title: string;
  level: 2 | 3;
  children: TocNode[];
};

function buildTree(headings: BlogHeading[]): TocNode[] {
  const root: TocNode[] = [];
  let currentH2: TocNode | null = null;

  headings.forEach((heading) => {
    const node: TocNode = {
      id: heading.id,
      title: heading.title,
      level: heading.level,
      children: []
    };

    if (heading.level === 2) {
      root.push(node);
      currentH2 = node;
      return;
    }

    if (!currentH2) {
      root.push(node);
      return;
    }

    currentH2.children.push(node);
  });

  return root;
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const headingIds = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const tocTree = useMemo(() => buildTree(headings), [headings]);
  const [activeId, setActiveId] = useState<string | null>(headingIds[0] ?? null);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const [markerTop, setMarkerTop] = useState<number>(0);
  const [markerLeft, setMarkerLeft] = useState<number>(0);
  const [markerVisible, setMarkerVisible] = useState(false);

  const listRef = useRef<HTMLOListElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const scrollSettleTimerRef = useRef<number | null>(null);
  const targetIdRef = useRef<string | null>(null);

  const updateMarker = (id: string | null) => {
    if (!id) {
      setMarkerVisible(false);
      return;
    }

    const activeLink = linkRefs.current[id];
    const rootList = listRef.current;
    if (!activeLink || !rootList) {
      setMarkerVisible(false);
      return;
    }

    const rootRect = rootList.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    setMarkerTop(linkRect.top - rootRect.top + linkRect.height / 2);
    setMarkerLeft(linkRect.left - rootRect.left - 12);
    setMarkerVisible(true);
  };

  useEffect(() => {
    if (headingIds.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll) {
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 1]
      }
    );

    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    const onHashChange = () => {
      const fromHash = window.location.hash.replace(/^#/, "");
      if (fromHash) {
        setActiveId(fromHash);
      }
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [headingIds, isProgrammaticScroll]);

  useEffect(() => {
    updateMarker(activeId);
  }, [activeId, tocTree]);

  useEffect(() => {
    const onResize = () => updateMarker(activeId);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId]);

  useEffect(() => {
    return () => {
      if (scrollSettleTimerRef.current !== null) {
        window.clearTimeout(scrollSettleTimerRef.current);
      }
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const handleBackToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (scrollSettleTimerRef.current !== null) {
      window.clearTimeout(scrollSettleTimerRef.current);
    }

    targetIdRef.current = null;
    setIsProgrammaticScroll(true);
    setActiveId(headingIds[0] ?? null);

    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", cleanUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const settle = () => {
      if (window.scrollY <= 4) {
        setIsProgrammaticScroll(false);
        return;
      }

      scrollSettleTimerRef.current = window.setTimeout(settle, 50);
    };

    scrollSettleTimerRef.current = window.setTimeout(settle, 120);
  };

  const renderNode = (node: TocNode) => {
    const isActive = activeId === node.id;

    const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (scrollSettleTimerRef.current !== null) {
        window.clearTimeout(scrollSettleTimerRef.current);
      }

      targetIdRef.current = node.id;
      setIsProgrammaticScroll(true);
      setActiveId(node.id);

      const element = document.getElementById(node.id);
      if (!element) {
        setIsProgrammaticScroll(false);
        return;
      }

      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 24;
      window.history.replaceState(null, "", `#${node.id}`);
      window.scrollTo({ top: offsetTop, behavior: "smooth" });

      const settle = () => {
        const targetId = targetIdRef.current;
        if (!targetId) {
          setIsProgrammaticScroll(false);
          return;
        }

        const target = document.getElementById(targetId);
        if (!target) {
          setIsProgrammaticScroll(false);
          return;
        }

        const distance = Math.abs(target.getBoundingClientRect().top - 24);
        if (distance <= 4) {
          setIsProgrammaticScroll(false);
          return;
        }

        scrollSettleTimerRef.current = window.setTimeout(settle, 50);
      };

      scrollSettleTimerRef.current = window.setTimeout(settle, 120);
    };

    return (
      <li key={node.id}>
        <a
          href={`#${node.id}`}
          ref={(element) => {
            linkRefs.current[node.id] = element;
          }}
          onClick={handleLinkClick}
          className={[
            styles.tocLink,
            isActive ? styles.tocLinkActive : "",
            node.level === 3 ? styles.tocLinkLevel3 : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {node.title}
        </a>
        {node.children.length > 0 ? <ol>{node.children.map(renderNode)}</ol> : null}
      </li>
    );
  };

  const showBackToTop = Boolean(activeId && activeId !== headingIds[0]);

  return (
    <table-of-contents className={styles.tableOfContents}>
      <nav aria-label="Table of Contents">
        <h2>Contents</h2>
        <ol ref={listRef}>
          <span
            className={styles.tocMarker}
            style={{
              top: `${markerTop}px`,
              left: `${markerLeft}px`,
              opacity: markerVisible ? 1 : 0
            }}
            aria-hidden="true"
          />
          {tocTree.map(renderNode)}
        </ol>
        <hr className={showBackToTop ? styles.backToTopVisible : ""} />
        <div className={`${styles.backToTop} ${showBackToTop ? styles.backToTopVisible : ""}`}>
          <a aria-label="Back to Top" href="#" onClick={handleBackToTop}>
            Go back up!
          </a>
        </div>
      </nav>
    </table-of-contents>
  );
}
