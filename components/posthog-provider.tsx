"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import type { PostHogConfig } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

type PostHogProviderProps = {
  children: React.ReactNode;
  apiKey?: string;
  apiHost?: string;
};

let hasInitializedPostHog = false;

function PostHogPageviewTracker() {
  const enabled = Boolean(posthog.__loaded);
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const query = window.location.search.replace(/^\?/, "");
    const url = `${window.location.origin}${pathname}${window.location.search}${window.location.hash}`;
    posthog.capture("$pageview", { $current_url: url });
    posthog.capture("page_loaded", {
      pathname,
      search: query,
      url,
      referrer: document.referrer || null
    });
  }, [enabled, pathname]);

  return null;
}

export default function PostHogClientProvider({ children, apiKey, apiHost }: PostHogProviderProps) {
  useEffect(() => {
    if (!apiKey || hasInitializedPostHog) {
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost || "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "memory",
      cookieless_mode: "always"
    } as Partial<PostHogConfig>);

    hasInitializedPostHog = true;
  }, [apiKey, apiHost]);

  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogPageviewTracker />
      {children}
    </PostHogProvider>
  );
}
