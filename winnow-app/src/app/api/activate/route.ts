// File: src/app/api/activate/route.ts — demo-operator custody path (PRD 7.5; Safety L2)
import { activateAgent } from "@/lib/altana";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseEther } from "viem";
const B = z.object({ agentName: z.string().max(40), tokenId: z.number(), capBnb: z.number().min(0.001).max(0.05), hours: z.number().min(1).max(48) });
// INTERROGATE FIX (F-02+F-43): the single global 60s cooldown was both griefable (any visitor could
// consume it, starving a judge's take) and drainable (unlimited grants/day = anonymous gas drain).
// Now three layers: per-IP 60s cooldown, a rolling daily global budget of 24 grants, and 15s global
// spacing so two IPs never sign concurrently (protects the operator nonce + gas).
const perIp = new Map<string, number>();
let lastGlobal = 0;
let dayKey = "";
let dayCount = 0;
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const today = new Date().toISOString().slice(0, 10);
  if (dayKey !== today) { dayKey = today; dayCount = 0; }
  if (dayCount >= 24) return NextResponse.json({ error: "daily activation budget reached, try tomorrow" }, { status: 429 });
  if ((perIp.get(ip) ?? 0) > Date.now() - 60000) return NextResponse.json({ error: "one activation per minute per visitor. Try again in a moment" }, { status: 429 });
  if (lastGlobal > Date.now() - 15000) return NextResponse.json({ error: "another activation is signing right now. Try again in 15 seconds" }, { status: 429 });
  const p = B.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  perIp.set(ip, Date.now());
  lastGlobal = Date.now();
  dayCount++;
  try {
    const r = await activateAgent(p.data.agentName, p.data.tokenId, parseEther(String(p.data.capBnb)), p.data.hours * 3600);
    // DEBUG FIX (P5): honest labels — r.agentWallet is the agent's wallet, not the session key
    return NextResponse.json({ ok: true, sessionId: r.sessionId, wallet: r.wallet.address, agentWallet: r.agentWallet.address, grantTx: r.grantTx });
  } catch (e: any) {
    perIp.delete(ip); lastGlobal = 0; dayCount--; // DEBUG FIX (P5): a failed activation must not burn cooldowns or budget
    return NextResponse.json({ error: String(e?.message).slice(0, 200) }, { status: 500 });
  }
}
