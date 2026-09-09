// File: src/app/api/activate/route.ts — demo-operator custody path (PRD 7.5; Safety L2: global 1/min)
import { activateAgent } from "@/lib/altana";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseEther } from "viem";
const B = z.object({ agentName: z.string().max(40), tokenId: z.number(), capBnb: z.number().min(0.001).max(0.05), hours: z.number().min(1).max(48) });
let lastActivate = 0; // Safety L2: global 1/min
export async function POST(req: Request) {
  if (lastActivate > Date.now() - 60000) return NextResponse.json({ error: "cooldown 60s" }, { status: 429 });
  const p = B.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  lastActivate = Date.now();
  try {
    const r = await activateAgent(p.data.agentName, p.data.tokenId, parseEther(String(p.data.capBnb)), p.data.hours * 3600);
    return NextResponse.json({ ok: true, wallet: r.wallet.address, sessionKey: r.agentWallet.address });
  } catch (e: any) { return NextResponse.json({ error: String(e?.message).slice(0, 200) }, { status: 500 }); }
}
