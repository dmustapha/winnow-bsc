// File: src/lib/probe.ts
import { db } from "./db";
import { agentDetail } from "./scan8004";
type Check = { name: string; ok: boolean; ms: number; detail: string };
async function timed(name: string, fn: () => Promise<string>): Promise<Check> {
  const t0 = Date.now();
  try { const detail = await fn(); return { name, ok: true, ms: Date.now() - t0, detail }; }
  catch (e: any) { return { name, ok: false, ms: Date.now() - t0, detail: String(e?.message ?? e).slice(0, 200) }; }
}
export async function runProbe(chainId: number, tokenId: number) {
  const row = db.prepare("SELECT * FROM agents WHERE chain_id=? AND token_id=?").get(chainId, tokenId) as any;
  // [CRITIQUE E-2] scan refresh ONLY for unindexed rows — every probe used to burn one 8004scan call,
  // coupling probe throughput (4,320/day at 1/20s) to the 900/day scan budget. Indexed rows probe from stored endpoints (also holds AC-2 ≤15s: checks are ≤2×6s).
  const detail = row ? null : await agentDetail(chainId, tokenId);
  if (detail) require("./scan8004").upsertAgent(detail);
  const a = db.prepare("SELECT * FROM agents WHERE chain_id=? AND token_id=?").get(chainId, tokenId) as any;
  const checks: Check[] = [];
  if (a?.mcp_server) checks.push(await timed("mcp_initialize", async () => {
    const r = await fetch(a.mcp_server, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "winnow-probe", version: "1" } } }),
      signal: AbortSignal.timeout(6000) });
    return `HTTP ${r.status}`;
  }));
  if (a?.a2a_endpoint) checks.push(await timed("a2a_card", async () => {
    const r = await fetch(a.a2a_endpoint, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json(); return `card ok: ${j?.name ?? "unnamed"}`;
  }));
  if (!a?.mcp_server && !a?.a2a_endpoint) checks.push({ name: "endpoints", ok: false, ms: 0, detail: "no declared MCP or A2A endpoint" });
  // scoring
  const liveOk = checks.some((c) => (c.name === "mcp_initialize" || c.name === "a2a_card") && c.ok);
  const liveness = liveOk ? (checks.filter((c) => c.ok).length > 1 ? 40 : 32) : 0;
  const meta = (a?.name && !/^Agent #/.test(a.name) ? 5 : 0) + (a?.description?.length > 40 ? 5 : 0) + (a?.image_url ? 3 : 0) + (a?.x402 ? 2 : 0);
  const { feedback, fbDetail } = feedbackScore(a);
  const track = trackScore(chainId, tokenId);
  const transcript = JSON.stringify({ checks, meta: { name: a?.name, hasDesc: !!a?.description }, feedback: fbDetail, track }, null, 1);
  const info = db.prepare("INSERT INTO probe_logs(chain_id,token_id,transcript,liveness,meta,feedback,track) VALUES(?,?,?,?,?,?,?)")
    .run(chainId, tokenId, transcript, liveness, meta, feedback, track);
  return { probeLogId: Number(info.lastInsertRowid), liveness, meta, feedback, track, checks };
}
// Coordinated-feedback heuristic (published method — NOT accusations; INVARIANT 2):
function feedbackScore(a: any): { feedback: number; fbDetail: string } {
  const n = a?.scan_feedbacks ?? 0;
  if (n === 0) return { feedback: 12, fbDetail: "no feedback (neutral floor — nothing to validate)" };
  const s = a?.scan_score ?? 0;
  const plausible = s > 0 && s < 100 && n < 500; // perfect-100 mass-feedback = farm signature
  return plausible ? { feedback: 24, fbDetail: `n=${n} avg=${s} plausible-range` }
                   // DEBUG FIX (INVARIANT 2 spirit): descriptive, not accusatory — transcript renders on the agent's public page
                   : { feedback: 6, fbDetail: `n=${n} avg=${s} outside plausible range (uniform or extreme volume) — insufficient independently-validated feedback` };
}
function trackScore(chainId: number, tokenId: number): number {
  // DEBUG FIX (P5 M1 class): agent_actions is keyed by token only — count it solely for our
  // reference agents so a marketplace agent with a colliding token_id never inherits track points.
  const isRef = (db.prepare("SELECT is_reference r FROM agents WHERE chain_id=? AND token_id=?").get(chainId, tokenId) as any)?.r ?? 0;
  const acts = isRef ? db.prepare("SELECT COUNT(*) c FROM agent_actions WHERE agent_token=?").get(tokenId) as any : { c: 0 };
  const att = db.prepare("SELECT COUNT(*) c FROM attestations WHERE chain_id=? AND token_id=?").get(chainId, tokenId) as any;
  return Math.min(15, (acts?.c ?? 0) * 3 + (att?.c ?? 0) * 2);
}
