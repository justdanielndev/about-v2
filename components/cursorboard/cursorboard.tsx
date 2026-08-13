"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { readableTextColor } from "@/lib/cursorboard/color";

import { useCursorboard } from "./use-cursorboard";

const HINT_STORAGE_KEY = "cursorboard:hint-seen";
const ERROR_VISIBLE_MS = 3_000;
const MIN_INPUT_WIDTH = 6;
const CLOSE_ANIMATION_MS = 180;

const ANCHOR_SELECTORS = ["main", ".site-root-content", "body"];

const RATIO_MIN = -1;
const RATIO_MAX = 2;

type Point = { x: number; y: number };

function useIsDesktopPointer() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function useAnchorElement(active: boolean, pathKey: string) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      setAnchor(null);
      return;
    }

    const findAnchor = (): HTMLElement | null => {
      for (const selector of ANCHOR_SELECTORS) {
        const element = document.querySelector<HTMLElement>(selector);
        if (element) {
          return element;
        }
      }
      return null;
    };

    const existing = findAnchor();
    if (existing) {
      setAnchor(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const found = findAnchor();
      if (found) {
        setAnchor(found);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [active, pathKey]);

  useEffect(() => {
    if (!anchor) {
      return;
    }
    const previous = anchor.style.position;
    if (!previous) {
      anchor.style.position = "relative";
    }
    return () => {
      if (!previous) {
        anchor.style.position = "";
      }
    };
  }, [anchor]);

  return anchor;
}

export default function CursorBoard() {
  const serverUrl = process.env.NEXT_PUBLIC_CURSORBOARD_URL;
  const isDesktop = useIsDesktopPointer();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [renderNotes, setRenderNotes] = useState(false);
  const [draft, setDraft] = useState("");
  const [cursor, setCursor] = useState<Point>({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(false);
  const [inputWidth, setInputWidth] = useState(MIN_INPUT_WIDTH);
  const [composerCoversNote, setComposerCoversNote] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sizerRef = useRef<HTMLSpanElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const noteElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const enabled = mounted && isDesktop && Boolean(serverUrl);

  const currentPath = useMemo(() => {
    if (!pathname) {
      return "/";
    }
    return pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : "/";
  }, [pathname]);

  const anchor = useAnchorElement(enabled, currentPath);

  const {
    status,
    messages,
    limits,
    selfId,
    selfColor,
    peers,
    error,
    place,
    subscribe,
    unsubscribe,
    sendPresence,
    dismissError,
  } = useCursorboard(serverUrl, enabled);

  useEffect(() => setMounted(true), []);

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.path === currentPath),
    [messages, currentPath]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    try {
      setShowHint(!localStorage.getItem(HINT_STORAGE_KEY));
    } catch {
      setShowHint(false);
    }
  }, [enabled]);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_STORAGE_KEY, "1");
    } catch {}
  }, []);

  const updateComposerOverlap = useCallback(() => {
    const composer = composerRef.current;
    if (!composer) {
      return;
    }

    const composerRect = composer.getBoundingClientRect();
    let overlaps = false;

    for (const element of noteElementsRef.current.values()) {
      const rect = element.getBoundingClientRect();
      if (
        composerRect.left < rect.right &&
        composerRect.right > rect.left &&
        composerRect.top < rect.bottom &&
        composerRect.bottom > rect.top
      ) {
        overlaps = true;
        break;
      }
    }

    setComposerCoversNote((prev) => (prev === overlaps ? prev : overlaps));
  }, []);

  useEffect(() => {
    if (!boardOpen && composerCoversNote) {
      setComposerCoversNote(false);
    }
  }, [boardOpen, composerCoversNote]);

  useEffect(() => {
    if (boardOpen) {
      setRenderNotes(true);
      return;
    }
    const timer = setTimeout(() => setRenderNotes(false), CLOSE_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [boardOpen]);

  useEffect(() => {
    if (boardOpen && status === "open") {
      subscribe(currentPath);
    } else if (!boardOpen) {
      unsubscribe();
    }
  }, [boardOpen, currentPath, status, subscribe, unsubscribe]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let frame = 0;
    let latest: Point = { x: 0, y: 0 };

    const handleMove = (event: MouseEvent) => {
      latest = { x: event.clientX, y: event.clientY };
      if (frame === 0) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          setCursor(latest);
        });
      }
    };

    document.addEventListener("mousemove", handleMove);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!boardOpen) {
      return;
    }

    let frame = 0;
    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          updateComposerOverlap();
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, [boardOpen, updateComposerOverlap]);

  useEffect(() => {
    if (boardOpen) {
      updateComposerOverlap();
    }
  }, [cursor, boardOpen, visibleMessages, updateComposerOverlap]);

  const lastPresenceSentRef = useRef(0);
  useEffect(() => {
    if (!boardOpen) {
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }

    const now = Date.now();
    if (now - lastPresenceSentRef.current < 50) {
      return;
    }
    lastPresenceSentRef.current = now;

    const rect = overlay.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const bound = (value: number) => Math.min(RATIO_MAX, Math.max(RATIO_MIN, value));

    sendPresence({
      xRatio: bound((cursor.x - rect.left) / rect.width),
      yRatio: bound((cursor.y - rect.top) / rect.height),
      typing: draft.length > 0,
    });
  }, [cursor, draft, boardOpen, sendPresence]);

  useEffect(() => {
    if (!error) {
      return;
    }
    const timer = setTimeout(dismissError, ERROR_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [error, dismissError]);

  const closeBoard = useCallback(() => {
    setBoardOpen(false);
    setDraft("");
  }, []);

  useEffect(() => {
    setDraft("");
  }, [currentPath]);

  const commit = useCallback(() => {
    const text = draft.trim();
    const overlay = overlayRef.current;
    const composer = composerRef.current;
    if (!text || !overlay || !composer) {
      return;
    }

    const overlayRect = overlay.getBoundingClientRect();
    const bubbleRect = composer.getBoundingClientRect();
    if (overlayRect.width === 0 || overlayRect.height === 0) {
      return;
    }

    const bound = (value: number) => Math.min(RATIO_MAX, Math.max(RATIO_MIN, value));

    const sent = place({
      text,
      path: currentPath,
      xRatio: bound((bubbleRect.left - overlayRect.left) / overlayRect.width),
      yRatio: bound((bubbleRect.top - overlayRect.top) / overlayRect.height),
    });

    if (sent) {
      setDraft("");
      dismissHint();
    }
  }, [draft, place, currentPath, dismissHint]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "/") {
        const target = event.target as HTMLElement | null;
        const inOtherField =
          target instanceof HTMLElement &&
          target !== inputRef.current &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable);

        if (inOtherField) {
          return;
        }

        event.preventDefault();
        dismissHint();
        if (boardOpen) {
          closeBoard();
        } else {
          setBoardOpen(true);
        }
        return;
      }

      if (boardOpen && event.key === "Escape") {
        event.preventDefault();
        closeBoard();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, boardOpen, closeBoard, dismissHint]);

  useEffect(() => {
    if (boardOpen) {
      inputRef.current?.focus();
    }
  }, [boardOpen]);

  useLayoutEffect(() => {
    if (!boardOpen) {
      setInputWidth(MIN_INPUT_WIDTH);
      return;
    }
    const sizer = sizerRef.current;
    if (sizer) {
      setInputWidth(Math.max(MIN_INPUT_WIDTH, Math.ceil(sizer.getBoundingClientRect().width) + 1));
    }
  }, [draft, boardOpen]);

  if (!enabled || !anchor) {
    return null;
  }

  const maxLength = limits?.maxLength ?? 80;
  const composerColor = selfColor ?? "hsl(210 70% 60%)";

  return (
    <>
      {createPortal(
        <div
          ref={overlayRef}
          className={`cursorboard-layer${boardOpen ? " is-open" : ""}`}
          aria-hidden="true"
        >
          {renderNotes && visibleMessages.map((message) => (
            <div
              key={message.id}
              ref={(element) => {
                if (element) {
                  noteElementsRef.current.set(message.id, element);
                } else {
                  noteElementsRef.current.delete(message.id);
                }
              }}
              className={`cursorboard-note${message.authorId === selfId ? " is-own" : ""}`}
              style={{
                left: `${message.xRatio * 100}%`,
                top: `${message.yRatio * 100}%`,
                background: message.color,
                color: readableTextColor(message.color),
              }}
            >
              {message.text}
            </div>
          ))}

          {renderNotes &&
            peers.map((peer) => (
              <div
                key={peer.id}
                className="cursorboard-peer"
                style={{ left: `${peer.xRatio * 100}%`, top: `${peer.yRatio * 100}%` }}
              >
                <svg
                  className="cursorboard-peer-arrow"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3L3 17L8 12L13 12L3 3Z"
                    fill={peer.color}
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                {peer.typing ? (
                  <span
                    className="cursorboard-peer-typing"
                    style={{ background: peer.color, color: readableTextColor(peer.color) }}
                  >
                    <span className="cursorboard-peer-dot" />
                    <span className="cursorboard-peer-dot" />
                    <span className="cursorboard-peer-dot" />
                  </span>
                ) : null}
              </div>
            ))}
        </div>,
        anchor
      )}

      {createPortal(
        <>
          {boardOpen ? (
            <div
              className="cursorboard-capture"
              onMouseDown={(event) => {
                event.preventDefault();
                commit();
              }}
            >
              <div
                ref={composerRef}
                className={`cursorboard-composer${composerCoversNote ? " is-faded" : ""}`}
                style={{
                  transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                  background: composerColor,
                  color: readableTextColor(composerColor),
                }}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <input
                  ref={inputRef}
                  className="cursorboard-composer-input"
                  style={{ width: `${inputWidth}px` }}
                  value={draft}
                  maxLength={maxLength}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commit();
                    }
                  }}
                />
                <span ref={sizerRef} className="cursorboard-composer-sizer" aria-hidden="true">
                  {draft}
                </span>
              </div>
            </div>
          ) : null}

          {error ? <div className="cursorboard-toast">{error.message}</div> : null}

          {showHint && !boardOpen ? (
            <button type="button" className="cursorboard-hint" onClick={dismissHint}>
              Press <kbd>/</kbd> to see and leave messages
            </button>
          ) : null}
        </>,
        document.body
      )}
    </>
  );
}
