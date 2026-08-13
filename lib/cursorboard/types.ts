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

export type PeerPresence = {
  id: string;
  color: string;
  xRatio: number;
  yRatio: number;
  typing: boolean;
};

export type ServerEvent =
  | { t: "welcome"; id: string; color: string; limits: BoardLimits }
  | { t: "board"; messages: BoardMessage[] }
  | { t: "add"; message: BoardMessage }
  | { t: "remove"; ids: string[] }
  | { t: "presence-batch"; entries: PeerPresence[] }
  | { t: "presence"; id: string; color: string; xRatio: number; yRatio: number; typing: boolean }
  | { t: "presence-clear"; id: string }
  | { t: "pong" }
  | { t: "error"; code: string; message: string; retryInMs?: number };
