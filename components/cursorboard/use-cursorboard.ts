"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { computeFingerprint } from "@/lib/cursorboard/fingerprint";
import type { BoardLimits, BoardMessage, PeerPresence, ServerEvent } from "@/lib/cursorboard/types";

type Status = "idle" | "connecting" | "open" | "closed";

type BoardError = { code: string; message: string; at: number };

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

export function useCursorboard(serverUrl: string | undefined, enabled: boolean) {
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<BoardMessage[]>([]);
  const [limits, setLimits] = useState<BoardLimits | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [selfColor, setSelfColor] = useState<string | null>(null);
  const [error, setError] = useState<BoardError | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerPresence>>(new Map());

  const socketRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUsRef = useRef(false);

  useEffect(() => {
    if (!enabled || !serverUrl) {
      return;
    }

    let cancelled = false;
    closedByUsRef.current = false;

    const clearReconnect = () => {
      if (reconnectRef.current !== null) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (cancelled || closedByUsRef.current) {
        return;
      }
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attemptRef.current, RECONNECT_MAX_MS);
      attemptRef.current += 1;
      clearReconnect();
      reconnectRef.current = setTimeout(() => {
        void open();
      }, delay);
    };

    const open = async () => {
      if (cancelled) {
        return;
      }

      setStatus("connecting");

      let fingerprint: string;
      try {
        fingerprint = await computeFingerprint();
      } catch {
        fingerprint = "unavailable";
      }

      if (cancelled) {
        return;
      }

      const url = new URL(serverUrl);
      url.searchParams.set("fp", fingerprint);

      let socket: WebSocket;
      try {
        socket = new WebSocket(url.toString());
      } catch {
        scheduleReconnect();
        return;
      }

      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (cancelled) {
          socket.close();
          return;
        }
        attemptRef.current = 0;
        setStatus("open");
      });

      socket.addEventListener("message", (event) => {
        let payload: ServerEvent;
        try {
          payload = JSON.parse(event.data as string);
        } catch {
          return;
        }

        switch (payload.t) {
          case "welcome":
            setSelfId(payload.id);
            setSelfColor(payload.color);
            setLimits(payload.limits);
            break;
          case "board":
            setMessages(payload.messages);
            break;
          case "add":
            setMessages((current) => [
              ...current.filter((message) => message.id !== payload.message.id),
              payload.message,
            ]);
            break;
          case "remove": {
            const removed = new Set(payload.ids);
            setMessages((current) => current.filter((message) => !removed.has(message.id)));
            break;
          }
          case "presence-batch":
            setPeers(new Map(payload.entries.map((entry) => [entry.id, entry])));
            break;
          case "presence":
            setPeers((current) => {
              const next = new Map(current);
              next.set(payload.id, {
                id: payload.id,
                color: payload.color,
                xRatio: payload.xRatio,
                yRatio: payload.yRatio,
                typing: payload.typing,
              });
              return next;
            });
            break;
          case "presence-clear":
            setPeers((current) => {
              if (!current.has(payload.id)) {
                return current;
              }
              const next = new Map(current);
              next.delete(payload.id);
              return next;
            });
            break;
          case "error":
            setError({ code: payload.code, message: payload.message, at: Date.now() });
            break;
          default:
            break;
        }
      });

      socket.addEventListener("close", () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        setStatus("closed");
        setPeers(new Map());
        scheduleReconnect();
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    };

    void open();

    return () => {
      cancelled = true;
      closedByUsRef.current = true;
      clearReconnect();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [enabled, serverUrl]);

  const send = useCallback((payload: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  const place = useCallback(
    (input: { text: string; path: string; xRatio: number; yRatio: number }) => {
      if (!send({ t: "place", ...input })) {
        setError({ code: "offline", message: "Not connected.", at: Date.now() });
        return false;
      }
      return true;
    },
    [send]
  );

  const clearOwn = useCallback(() => {
    send({ t: "clear" });
  }, [send]);

  const subscribe = useCallback(
    (path: string) => {
      send({ t: "subscribe", path });
    },
    [send]
  );

  const unsubscribe = useCallback(() => {
    setPeers(new Map());
    send({ t: "unsubscribe" });
  }, [send]);

  const sendPresence = useCallback(
    (input: { xRatio: number; yRatio: number; typing: boolean }) => {
      send({ t: "presence", ...input });
    },
    [send]
  );

  const dismissError = useCallback(() => setError(null), []);

  const ownMessageId = useMemo(
    () => messages.find((message) => message.authorId === selfId)?.id ?? null,
    [messages, selfId]
  );

  const peerList = useMemo(() => [...peers.values()], [peers]);

  return {
    status,
    messages,
    limits,
    selfId,
    selfColor,
    ownMessageId,
    peers: peerList,
    error,
    place,
    clearOwn,
    subscribe,
    unsubscribe,
    sendPresence,
    dismissError,
  };
}
