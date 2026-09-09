// File: src/lib/scan8004.ts
import { db, kvGet, kvSet } from "./db";
import { SCAN_API } from "./config";
let lastCall = 0;
async function paced(url: string): Promise<any | null> {
  const today = new Date().toISOString().slice(0, 10);
  const budget = JSON.parse(kvGet("scan_budget") ?? "{}");
  if (budget.day === today && budget.n >= 900) return null; // daily cap guard
  const wait = Math.max(0, lastCall + 2300 - Date.now());
  if (wait) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  kvSet("scan_budget", JSON.stringify({ day: today, n: budget.day === today ? budget.n + 1 : 1 }));
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}
const UP = db.prepare(`INSERT INTO agents(chain_id,token_id,name,description,owner,image_url,mcp_server,a2a_endpoint,x402,scan_feedbacks,scan_score,created_at)
 VALUES(@chain_id,@token_id,@name,@description,@owner,@image_url,@mcp,@a2a,@x402,@fb,@score,@created)
 ON CONFLICT(chain_id,token_id) DO UPDATE SET name=excluded.name,description=excluded.description,mcp_server=excluded.mcp_server,a2a_endpoint=excluded.a2a_endpoint,x402=excluded.x402,scan_feedbacks=excluded.scan_feedbacks,scan_score=excluded.scan_score`);
export function upsertAgent(it: any) {
  const svc = it.services ?? {};
  UP.run({
    chain_id: it.chain_id, token_id: Number(it.token_id), name: it.name ?? `Agent #${it.token_id}`,
    description: it.description ?? "", owner: it.owner_address ?? "", image_url: it.image_url ?? "",
    mcp: it.mcp_server ?? svc?.mcp?.endpoint ?? null, a2a: it.a2a_endpoint ?? svc?.a2a?.endpoint ?? null, // DEV-004: detail responses carry a2a under services.a2a.endpoint
    x402: it.x402_supported ? 1 : 0, fb: it.total_feedbacks ?? 0, score: it.average_score ?? null,
    created: it.created_at ?? null,
  });
}
export async function indexTick(): Promise<number> {
  const cursor = kvGet("scan_cursor") ?? "";
  const url = `${SCAN_API}/agents?chain_id=56&limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
  const j = await paced(url);
  if (!j?.items?.length) return 0;
  const tx = db.transaction((items: any[]) => items.forEach(upsertAgent));
  tx(j.items);
  if (j.next_cursor) kvSet("scan_cursor", j.next_cursor);
  else kvSet("scan_done", "1");
  return j.items.length;
} // [UNVERIFIED] cursor field name — build gate: log first response keys; fallback offset pagination (DT-3)
export async function agentDetail(chainId: number, tokenId: number): Promise<any | null> {
  return paced(`${SCAN_API}/agents/${chainId}/${tokenId}`);
}
export async function recentFeedbacks(limit = 50): Promise<any[]> {
  const j = await paced(`${SCAN_API}/feedbacks?chain_id=56&limit=${limit}`);
  return j?.items ?? [];
}
