"use client";

import { useEffect } from "react";
import { buildSiteTitle, resolveDisplayName } from "@/lib/name-resolution";

function applyResolvedName() {
  const resolvedName = resolveDisplayName({
    hostname: window.location.hostname,
    searchParams: new URLSearchParams(window.location.search)
  });

  document.title = buildSiteTitle(resolvedName);
  document.documentElement.setAttribute("data-display-name", resolvedName);

  const mobileTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (mobileTitle) {
    mobileTitle.setAttribute("content", resolvedName);
  }
}

export default function LayoutNameSync() {
  useEffect(() => {
    applyResolvedName();

    const onNav = () => applyResolvedName();
    window.addEventListener("popstate", onNav);
    window.addEventListener("hashchange", onNav);

    return () => {
      window.removeEventListener("popstate", onNav);
      window.removeEventListener("hashchange", onNav);
    };
  }, []);

  return null;
}
