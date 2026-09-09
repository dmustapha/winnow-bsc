// File: src/app/api/reprobe/route.ts — live regrade in front of the judge (Safety L2: 1/20s/agent)
import { gradeAgent } from "@/lib/grade";
import { NextResponse } from "next/server";
import { z } from "zod";
const B = z.object({ chain: z.number(), id: z.number() });
const recent = new Map<string, number>(); // Safety L2: 1 reprobe / 20s / agent
export async function POST(req: Request) {
  const p = B.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
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
