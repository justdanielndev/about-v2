"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import TransitionLink from "@/components/transition-link";
import styles from "../blog.module.css";

type BlogListItem = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
};

type RowHighlight = {
  top: number;
  height: number;
  opacity: number;
};

type PostsListProps = {
  posts: BlogListItem[];
};

const ROUTE_NAV_DELAY_MS = 220;
const INTERNAL_NAV_KEY = "site-internal-nav";

function formatPublished(iso: string): { year: string; short: string } {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return {
      year: iso.slice(0, 4),
      short: iso
    };
  }

  return {
    year: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: "UTC"
    }).format(date),
    short: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    }).format(date)
  };
}

export default function PostsList({ posts }: PostsListProps) {
  const router = useRouter();
  const rowContainerRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const navTimeoutRef = useRef<number | null>(null);
  const [highlight, setHighlight] = useState<RowHighlight>({ top: 0, height: 0, opacity: 0 });

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current !== null) {
        window.clearTimeout(navTimeoutRef.current);
      }
    };
  }, []);

  const revealRow = (index: number) => {
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

  const hideHighlight = () => {
    setHighlight((current) => ({ ...current, opacity: 0 }));
  };

  const handlePostNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.defaultPrevented) {
      return;
    }

    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (navTimeoutRef.current !== null) {
      return;
    }

    window.dispatchEvent(new Event("site:blog-nav-start"));
    navTimeoutRef.current = window.setTimeout(() => {
      window.sessionStorage.setItem(INTERNAL_NAV_KEY, "1");
      router.push(href);
    }, ROUTE_NAV_DELAY_MS);
  };

  return (
    <section className={`site-projects ${styles.blogPostsSection} ${styles.blogTextRise} ${styles.blogTextRiseDelay1}`}>
      <h2 className="site-projects-title">Posts</h2>
      <div className={`site-project-rows ${styles.blogRows}`} ref={rowContainerRef} onMouseLeave={hideHighlight}>
        <div
          className="site-project-row-highlight cloneProjectHighlight"
          style={{
            top: `${highlight.top}px`,
            height: `${highlight.height}px`,
            opacity: highlight.opacity
          }}
        />

        <div className="site-project-row site-project-row-header">
          <span className={`site-col-year ${styles.blogYearColumn}`}>Year</span>
          <span className="site-col-sep" aria-hidden="true" />
          <span className="site-col-name">Article</span>
          <span className={`site-col-type ${styles.blogPublishedColumn}`}>Published</span>
        </div>

        {posts.map((post, index) => {
          const published = formatPublished(post.publishedAt);
          const href = `/blog/${post.slug}`;
          return (
            <TransitionLink
              href={href}
              key={post.slug}
              className={`site-project-row ${styles.blogRowLink}`}
              ariaLabel={`Open blog post: ${post.title}`}
              linkRef={(node) => {
                rowRefs.current[index] = node;
              }}
              onMouseEnter={() => revealRow(index)}
              onFocus={() => revealRow(index)}
              onBlur={hideHighlight}
              onClick={(event) => handlePostNavigate(event, href)}
            >
              <span className={`site-col-year ${styles.blogYearColumn}`}>{published.year}</span>
              <span className="site-col-sep" aria-hidden="true" />
              <span className={`site-col-name ${styles.blogNameColumn}`}>
                <span className={styles.blogPostTitle}>{post.title}</span>
                <span className={styles.blogPostDescription}>{post.description || post.excerpt}</span>
              </span>
              <span className={`site-col-type ${styles.blogPublishedColumn}`}>{published.short}</span>
            </TransitionLink>
          );
        })}
      </div>
    </section>
  );
}
