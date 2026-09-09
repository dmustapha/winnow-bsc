// File: src/app/api/revoke/route.ts — one-click onchain fire (demo obligation c2)
import { revoke } from "@/lib/altana";
import { db } from "@/lib/db";
import { isSessionExpired } from "@/lib/session-status";
import { NextResponse } from "next/server";
import { z } from "zod";
const recent = new Map<number, number>(); // DEBUG FIX (P4): 10s/session cooldown — spam guard on a gas-burning route; first (legit) revoke never blocked
let lastGlobal = 0; // INTERROGATE FIX (F-03): global 60s on top of the per-session guard — bounds anonymous grief to 1 gas-burning tx/min (external cron re-grants hourly)
export async function POST(req: Request) {
  const p = z.object({ sessionId: z.number().int().positive() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  // INTERROGATE FIX (F-03+F-06): read the row first — revoking an already-revoked or expired session
  // would only burn gas onchain for nothing. 409 with friendly copy, never a raw 500.
  const row = db.prepare("SELECT status, expiry FROM sessions WHERE id=?").get(p.data.sessionId) as any;
  if (!row) return NextResponse.json({ error: "no session with that id" }, { status: 404 });
  if (row.status === "revoked") return NextResponse.json({ error: "this session is already revoked" }, { status: 409 });
  if (isSessionExpired(row)) return NextResponse.json({ error: "this session has already expired onchain, nothing to revoke" }, { status: 409 });
  if ((recent.get(p.data.sessionId) ?? 0) > Date.now() - 10000) return NextResponse.json({ error: "cooldown 10s" }, { status: 429 });
  if (lastGlobal > Date.now() - 60000) return NextResponse.json({ error: "one revoke per minute. Try again shortly" }, { status: 429 });
  recent.set(p.data.sessionId, Date.now());
  lastGlobal = Date.now();
  try {
    const tx = await revoke(p.data.sessionId);
    return NextResponse.json({ ok: true, tx });
  } catch (e: any) {
    const msg = String(e?.message ?? e).slice(0, 200);
    // STRESS FIX (ST-API-1): unknown session is a client error, not a server crash
    // INTERROGATE FIX (F-06): expired-session errors from the relay surface as 409, never a raw 500
    if (/expired|expiry/i.test(msg)) return NextResponse.json({ error: "this session has already expired onchain, nothing to revoke" }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: /no session|no stored session/.test(msg) ? 404 : 500 });
  }
}
