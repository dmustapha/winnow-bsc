// File: src/app/api/reprobe/route.ts — live regrade in front of the judge (Safety L2: 1/20s/agent)
import { gradeAgent } from "@/lib/grade";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
const B = z.object({ chain: z.number().int().min(0).max(1e9), id: z.number().int().min(0).max(1e12) });
const recent = new Map<string, number>(); // Safety L2: 1 reprobe / 20s / agent
export async function POST(req: Request) {
  const p = B.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  // STRESS FIX (ST-API-4): only grade agents that exist in the index — no orphan grade rows
  if (!db.prepare("SELECT 1 FROM agents WHERE chain_id=? AND token_id=?").get(p.data.chain, p.data.id))
    return NextResponse.json({ error: "unknown agent" }, { status: 404 });
  const k = `${p.data.chain}:${p.data.id}`;
  if ((recent.get(k) ?? 0) > Date.now() - 20000) return NextResponse.json({ error: "cooldown 20s" }, { status: 429 });
  recent.set(k, Date.now());
  try {
    const g = await gradeAgent(p.data.chain, p.data.id);
    return NextResponse.json(g);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e).slice(0, 200) }, { status: 500 });
  }
}
