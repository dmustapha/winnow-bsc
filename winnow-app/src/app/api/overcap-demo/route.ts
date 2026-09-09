// File: src/app/api/overcap-demo/route.ts — over-cap revert demo (ARCH §10 trailing spec; INVARIANT 5)
import { demonstrateOverCap } from "@/lib/altana";
import { NextResponse } from "next/server";
import { z } from "zod";
const recent = new Map<number, number>(); // 60s cooldown per session (same pattern as revoke route)
export async function POST(req: Request) {
  const p = z.object({ sessionId: z.number().int().positive() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  if ((recent.get(p.data.sessionId) ?? 0) > Date.now() - 60000) return NextResponse.json({ error: "cooldown 60s" }, { status: 429 });
  recent.set(p.data.sessionId, Date.now());
  try {
    const r = await demonstrateOverCap(p.data.sessionId);
    return NextResponse.json(r);
  } catch (e: any) {
    const msg = String(e?.message ?? e).slice(0, 200);
    // STRESS FIX (ST-API-1): unknown session is a client error, not a server crash
    return NextResponse.json({ error: msg }, { status: /no session|no stored session/.test(msg) ? 404 : 500 });
  }
}
