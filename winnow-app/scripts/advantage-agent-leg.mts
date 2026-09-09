// File: scripts/advantage-agent-leg.mts — agent legs for the TermiX advantage report (T5.2).
// Runs the three strategies exactly as the marketplace worker does, wall-clocked with Date.now.
// Cost = LLM token ESTIMATE (chars/4, haiku-4.5 $1/M in $5/M out) + $0 gas (mainnet reads only).
// Output: submission/advantage-runs/agent-legs.json (verbatim detail + reasoning per task).
import { gridTick, healthFactorTick, yieldTick } from "../src/lib/agents/strategies";
import fs from "node:fs";

const POOL = process.env.PCS_POOL as `0x${string}`;
const WATCH = process.env.WATCH_ADDR as `0x${string}`;
if (!POOL || !WATCH) throw new Error("PCS_POOL / WATCH_ADDR missing");

// haiku-4.5 list price; token counts estimated chars/4 (labeled estimate in the report)
const estCostUsd = (promptChars: number, outChars: number) =>
  (promptChars / 4) * (1 / 1e6) + (outChars / 4) * (5 / 1e6);

async function leg(task: string, promptHint: string, fn: () => Promise<{ kind: string; detail: string; reasoning: string }>) {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const r = await fn();
  const timeMs = Date.now() - t0;
  const costUsd = estCostUsd(promptHint.length + r.detail.length, r.reasoning.length);
  console.log(`${task}: ${timeMs}ms est $${costUsd.toFixed(5)} — ${r.kind}`);
  return { task, startedAt, timeMs, gasUsd: 0, llmCostUsdEstimate: Number(costUsd.toFixed(5)), kind: r.kind, detail: r.detail, reasoning: r.reasoning };
}

const runs = [
  await leg("A_grid", "Grid-trading analysis for BSC WBNB/USDT 0.05% pool, grid step 0.5% + live spot", () => gridTick(POOL)),
  await leg("B_health", "Aave v3 BSC health factor risk assessment", () => healthFactorTick(WATCH)),
  await leg("C_yield", "Venus BSC top supply APYs routing", () => yieldTick()),
];
fs.mkdirSync("submission/advantage-runs", { recursive: true });
fs.writeFileSync("submission/advantage-runs/agent-legs.json", JSON.stringify({ recordedAt: new Date().toISOString(), runs }, null, 2));
console.log("submission/advantage-runs/agent-legs.json written");
