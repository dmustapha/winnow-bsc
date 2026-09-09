// File: src/app/api/a2a/[name]/route.ts — REAL A2A agent cards for the 4 reference agents.
// Winnow's reference agents were grading F purely because they declared no endpoint (the 96% case).
// Now they serve honest machine-readable cards from the same DB rows the marketplace grades —
// the probe's a2a_card check fetches THIS route. Slug = name lowercased, spaces → dashes.
// NOTE (deploy phase): agents.a2a_endpoint currently points at http://localhost:3000 for local
// grading; C6 must rewrite to https://winnow-bsc.fly.dev/api/a2a/{slug} and re-probe all 4.
import { db, kvGet } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const STRATEGY: Record<string, string> = {
  "health-factor": "healthFactorTick",
  yield: "yieldTick",
  rebalancing: "rebalanceTick",
  "grid-trading": "gridTick",
};
const slugOf = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export function GET(req: Request, { params }: { params: { name: string } }) {
  const refs = JSON.parse(kvGet("reference_agents") ?? "[]") as { name: string; tokenId: number; category: string }[];
  const ref = refs.find((r) => slugOf(r.name) === params.name.toLowerCase());
  if (!ref) return NextResponse.json({ error: "unknown reference agent" }, { status: 404 });
  const row = db.prepare("SELECT description, a2a_endpoint FROM agents WHERE chain_id=97 AND token_id=? AND is_reference=1").get(ref.tokenId) as any;
  return NextResponse.json({
    name: ref.name,
    description: row?.description ?? `Winnow reference agent (${ref.category})`,
    category: ref.category,
    skills: [STRATEGY[ref.category] ?? "tick"],
    provider: "winnow",
    url: row?.a2a_endpoint ?? `${new URL(req.url).origin}/api/a2a/${slugOf(ref.name)}`,
  });
}
