// File: src/app/api/exercise/route.ts — INTERROGATE FIX (F-45): one live in-cap spend through the
// stored session handle (0.0001 BNB to the session's allowlisted target, well inside the 0.005 cap).
// Makes "see it transact" real in the UI: returns the tx hash for a testnet explorer link.
import { exerciseSession } from "@/lib/altana";
import { db } from "@/lib/db";
import { isSessionExpired } from "@/lib/session-status";
import { NextResponse } from "next/server";
import { z } from "zod";
const recent = new Map<number, number>(); // 60s/session — same spam-guard pattern as overcap-demo
let lastGlobal = 0; // 60s global — bounds this gas-spending route to 1 tx/min total
export async function POST(req: Request) {
  const p = z.object({ sessionId: z.number().int().positive() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  const row = db.prepare("SELECT status, expiry FROM sessions WHERE id=?").get(p.data.sessionId) as any;
  if (!row) return NextResponse.json({ error: "no session with that id" }, { status: 404 });
  if (row.status !== "live") return NextResponse.json({ error: "this session is not live anymore" }, { status: 409 });
  if (isSessionExpired(row)) return NextResponse.json({ error: "this session has expired, activate a fresh one" }, { status: 409 });
  if ((recent.get(p.data.sessionId) ?? 0) > Date.now() - 60000) return NextResponse.json({ error: "cooldown 60s" }, { status: 429 });
  if (lastGlobal > Date.now() - 60000) return NextResponse.json({ error: "one test spend per minute. Try again shortly" }, { status: 429 });
  recent.set(p.data.sessionId, Date.now());
  lastGlobal = Date.now();
  try {
    const tx = await exerciseSession(p.data.sessionId);
    return NextResponse.json({ ok: true, tx });
  } catch (e: any) {
    const msg = String(e?.message ?? e).slice(0, 200);
    // Sessions granted before the last restart have no kv handle on an ephemeral disk — honest 409, not a 500
    if (/no stored session/.test(msg)) return NextResponse.json({ error: "this session was granted before the last restart, activate a fresh one" }, { status: 409 });
    if (/expired|expiry/i.test(msg)) return NextResponse.json({ error: "this session has expired, activate a fresh one" }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: /no session/.test(msg) ? 404 : 500 });
  }
}
