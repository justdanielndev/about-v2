"use client";

import { useEffect, useState } from "react";
import styles from "./blog.module.css";

const INTERNAL_NAV_KEY = "site-internal-nav";

export default function BlogTemplate({ children }: { children: React.ReactNode }) {
  const hasInternalNav = typeof window !== "undefined" && window.sessionStorage.getItem(INTERNAL_NAV_KEY) !== null;
  const [shown, setShown] = useState(hasInternalNav);
  const [noTransition, setNoTransition] = useState(hasInternalNav);

  useEffect(() => {
    const internalNav = window.sessionStorage.getItem(INTERNAL_NAV_KEY);
    if (internalNav) {
      setNoTransition(true);
      setShown(true);
      const frame = window.requestAnimationFrame(() => {
        setNoTransition(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setNoTransition(false);
    setShown(false);
    const frame = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onNavigateStart = () => {
      setNoTransition(false);
      setShown(false);
      return;
    }

    window.addEventListener("site:blog-nav-start", onNavigateStart);
    return () => {
      window.removeEventListener("site:blog-nav-start", onNavigateStart);
    };
  }, []);

  return (
    <div
      className={`${styles.blogPageReveal} ${shown ? styles.blogPageShown : styles.blogPageHidden}${noTransition ? ` ${styles.blogPageNoTransition}` : ""}`}
    >
      {children}
    </div>
  );
}
