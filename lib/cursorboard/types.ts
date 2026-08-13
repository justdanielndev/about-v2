export type BoardMessage = {
  id: string;
  authorId: string;
  color: string;
  text: string;
  path: string;
  xRatio: number;
  yRatio: number;
  ts: number;
};

export type BoardLimits = {
  maxMessages: number;
  maxLength: number;
  cooldownMs: number;
};

export type PeerIdentity = {
  slot: number;
  id: string;
  color: string;
  typing: boolean;
};

export type PresenceSeed = {
  slot: number;
  id: string;
  color: string;
  x: number | null;
  y: number | null;
  typing: boolean;
};

export type PresenceRow = [slot: number, x: number, y: number, typing: 0 | 1];

export type ServerEvent =
  | { t: "welcome"; id: string; color: string; limits: BoardLimits }
  | { t: "board"; messages: BoardMessage[] }
  | { t: "add"; message: BoardMessage }
  | { t: "remove"; ids: string[] }
  | { t: "presence-init"; slot: number; peers: PresenceSeed[] }
  | { t: "presence-join"; slot: number; id: string; color: string }
  | { t: "presence-leave"; slot: number }
  | { t: "presence"; u: PresenceRow[] }
  | { t: "pong" }
  | { t: "error"; code: string; message: string; retryInMs?: number };
