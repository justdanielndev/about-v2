"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

type BlogPostAnalyticsProps = {
  slug: string;
  title: string;
  estimatedReadingMinutes: number;
  publishedAt: string;
  updatedAt: string;
};

const CHECKPOINTS = [10, 25, 50, 75, 90, 100] as const;

function getScrollProgress(): number {
  const doc = document.documentElement;
  const body = document.body;
  const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
  const fullHeight = Math.max(
    doc.scrollHeight,
    body.scrollHeight,
    doc.offsetHeight,
    body.offsetHeight
  );
  const totalScrollable = Math.max(1, fullHeight - window.innerHeight);
  const progress = (scrollTop / totalScrollable) * 100;

  return Math.max(0, Math.min(100, Math.round(progress)));
}

export default function BlogPostAnalytics({
  slug,
  title,
  estimatedReadingMinutes,
  publishedAt,
  updatedAt
}: BlogPostAnalyticsProps) {
  const sentCheckpointsRef = useRef<Set<number>>(new Set());
  const maxProgressRef = useRef(0);
  const startAtRef = useRef(0);
  const closedRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    startAtRef.current = Date.now();

    const getElapsedMinutes = () => {
      const elapsedSeconds = Math.max(0, Math.round((Date.now() - startAtRef.current) / 1000));
      return Number((elapsedSeconds / 60).toFixed(2));
    };

    const baseProperties = {
      post_slug: slug,
      post_title: title,
      estimated_reading_minutes: estimatedReadingMinutes,
      published_at: publishedAt,
      updated_at: updatedAt
    };

    posthog.capture("blog_post_opened", {
      ...baseProperties,
      reading_minutes: 0
    });

    const emitCheckpoint = (checkpoint: number, currentProgress: number) => {
      if (sentCheckpointsRef.current.has(checkpoint)) {
        return;
      }

      sentCheckpointsRef.current.add(checkpoint);
      posthog.capture("blog_post_progress", {
        ...baseProperties,
        reading_minutes: getElapsedMinutes(),
        checkpoint_percent: checkpoint,
        progress_percent: currentProgress
      });

      if (checkpoint === 100) {
        const secondsToComplete = Math.max(0, Math.round((Date.now() - startAtRef.current) / 1000));
        posthog.capture("blog_post_completed", {
          ...baseProperties,
          reading_minutes: Number((secondsToComplete / 60).toFixed(2)),
          seconds_to_complete: secondsToComplete
        });
      }
    };

    const evaluateProgress = (forceCompletion = false) => {
      const currentProgress = getScrollProgress();
      maxProgressRef.current = Math.max(maxProgressRef.current, currentProgress);

      for (const checkpoint of CHECKPOINTS) {
        if (currentProgress >= checkpoint) {
          emitCheckpoint(checkpoint, currentProgress);
        }
      }

      if (forceCompletion && maxProgressRef.current >= 95) {
        emitCheckpoint(100, maxProgressRef.current);
      }
    };

    const onScroll = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        evaluateProgress();
      });
    };

    const captureClose = () => {
      if (closedRef.current) {
        return;
      }

      closedRef.current = true;
      evaluateProgress(true);

      const secondsOnPage = Math.max(0, Math.round((Date.now() - startAtRef.current) / 1000));
      const maxProgress = maxProgressRef.current;

      posthog.capture("blog_post_closed", {
        ...baseProperties,
        reading_minutes: Number((secondsOnPage / 60).toFixed(2)),
        seconds_on_page: secondsOnPage,
        max_progress_percent: maxProgress,
        completed: maxProgress >= 95
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        captureClose();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", captureClose);
    document.addEventListener("visibilitychange", onVisibilityChange);

    evaluateProgress();

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", captureClose);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      captureClose();
    };
  }, [slug, title, estimatedReadingMinutes, publishedAt, updatedAt]);

  return null;
}
