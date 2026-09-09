// File: src/lib/session-status.ts — INTERROGATE FIX (F-06): one expiry-aware status derivation.
// The DB has no 'expired' state (the seed re-bakes status='live' on every boot), so every consumer
// (agent page, /proof, /api/sessions, /api/agent detail, revoke/overcap/exercise guards) derives it
// from the same helper — a status='live' row with expiry in the past renders as expired everywhere.
export type SessionLike = { status: string; expiry: number };

export const isSessionExpired = (s: SessionLike, nowMs: number = Date.now()): boolean =>
  s.status === "live" && s.expiry * 1000 <= nowMs;

export const deriveSessionStatus = (s: SessionLike, nowMs: number = Date.now()): string =>
  isSessionExpired(s, nowMs) ? "expired" : s.status;
