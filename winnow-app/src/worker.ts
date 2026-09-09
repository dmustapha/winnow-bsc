// File: src/worker.ts
import { indexTick } from "./lib/scan8004";
import { gradeAgent } from "./lib/grade";
import { db, kvGet } from "./lib/db";
import * as S from "./lib/agents/strategies";
import fs from "node:fs";
import path from "node:path";

const REF = () => JSON.parse(kvGet("reference_agents") ?? "[]") as { name: string; tokenId: number; category: string }[];

// DEBUG FIX (C3 pidfile collision): single-instance guard. Two live workers double the
// 8004scan budget burn and race the prober. Stale pids (kill -9) are detected via signal-0
// liveness check and taken over; a live holder makes this start a no-op.
const PIDFILE = path.join(process.cwd(), "data", "worker.pid");
function acquireWorkerLock(): boolean {
  try {
    const prev = Number(fs.readFileSync(PIDFILE, "utf8").trim());
    if (prev && prev !== process.pid) {
      try { process.kill(prev, 0); return false; } // holder alive → refuse to start
      catch { /* stale pidfile (holder dead) → take over */ }
    }
  } catch { /* no pidfile yet */ }
  fs.mkdirSync(path.dirname(PIDFILE), { recursive: true });
  fs.writeFileSync(PIDFILE, String(process.pid));
  process.on("exit", () => {
    try { if (Number(fs.readFileSync(PIDFILE, "utf8").trim()) === process.pid) fs.unlinkSync(PIDFILE); } catch { }
  });
  return true;
}

async function loop(name: string, ms: number, fn: () => Promise<void>) {
  while (true) {
    try { await fn(); } catch (e) { console.error(`[${name}]`, (e as any)?.message ?? e); }
    await new Promise((r) => setTimeout(r, ms));
  }
}

// DT-7 build-discovered, both VERIFIED live on mainnet (scripts/resolve-inputs.mts):
//   PCS_POOL  = PCS v3 WBNB/USDT 0.05% pool (factory getPool)
//   WATCH_ADDR = live Aave v3 BSC borrower (totalDebtBase>0, HF~1.33 at discovery)
const PCS_POOL = (process.env.PCS_POOL ?? "0x36696169C63e42cd08ce11f5deeBbCeBae652050") as `0x${string}`;
const WATCH_ADDR = (process.env.WATCH_ADDR ?? "0xe5EC006540bE4F7CbB2CBc7Be79708a6d96F90dC") as `0x${string}`;

export function startWorker() {
  if (!acquireWorkerLock()) {
    console.error(`[worker] another instance holds ${PIDFILE} — not starting a second worker`);
    return;
  }
  loop("indexer", 2500, async () => { if (!kvGet("scan_done")) await indexTick(); else await new Promise((r) => setTimeout(r, 60000)); });
  loop("prober", 20000, async () => {
    const next = db.prepare(`SELECT a.chain_id, a.token_id FROM agents a LEFT JOIN grades g ON g.chain_id=a.chain_id AND g.token_id=a.token_id
      WHERE a.mcp_server IS NOT NULL AND g.token_id IS NULL LIMIT 1`).get() as any;
    if (next) await gradeAgent(next.chain_id, next.token_id);
  });
  // [CRITIQUE E-2] fast-grade lane: endpoint-less agents (the 96%) cost ZERO network to grade
  // (no-endpoint check + feedback heuristic + meta only) — grows honest graded coverage continuously.
  loop("fastgrader", 30000, async () => {
    const batch = db.prepare(`SELECT a.chain_id, a.token_id FROM agents a LEFT JOIN grades g ON g.chain_id=a.chain_id AND g.token_id=a.token_id
      WHERE a.mcp_server IS NULL AND a.a2a_endpoint IS NULL AND g.token_id IS NULL LIMIT 25`).all() as any[];
    for (const r of batch) await gradeAgent(r.chain_id, r.token_id);
  });
  loop("agents", 120000, async () => {
    for (const ra of REF()) {
      try {
        const r = ra.category === "health-factor" ? await S.healthFactorTick(WATCH_ADDR)
          : ra.category === "yield" ? await S.yieldTick()
          : ra.category === "rebalancing" ? await S.rebalanceTick(PCS_POOL)
          : await S.gridTick(PCS_POOL);
        S.recordAction(ra.tokenId, r);
      } catch (e) {
        // ESCALATE-DON'T-FABRICATE: LLM/data source down → skip-and-log, never canned reasoning
        console.error(`[agent:${ra.name}] SKIPPED tick:`, (e as any)?.message ?? e);
      }
    }
  });
  console.log("[worker] loops started: indexer/prober/fastgrader/agents");
}
