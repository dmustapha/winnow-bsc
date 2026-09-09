// File: src/lib/agents/strategies.ts
// Real strategies over MAINNET reads; reasoning = Anthropic haiku.
// ESCALATE-DON'T-FABRICATE: if the LLM is down, the action is SKIPPED and logged — never canned reasoning.
import Anthropic from "@anthropic-ai/sdk";
import { pubMain, AAVE_POOL_ABI } from "../chain";
import { M, ANTHROPIC_KEY } from "../config";
import { db } from "../db";

const MODEL = "claude-haiku-4-5-20251001";
const claude = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

// DEV-302 (Class: creds): every discoverable ANTHROPIC_API_KEY has zero credit.
// Fallback backend = local `claude -p` CLI (Max subscription) — REAL Claude haiku reasoning,
// never canned text. If BOTH backends fail the action is SKIPPED and logged (ESCALATE-DON'T-FABRICATE).
// Fly deploy (C6) has no CLI: a funded API key is a downstream requirement.
async function reasonViaCli(prompt: string): Promise<string> {
  const { execFile } = await import("node:child_process");
  return new Promise((resolve, reject) => {
    const env = { ...process.env }; delete env.ANTHROPIC_API_KEY; // CLI must use subscription auth, not the dead key
    execFile("claude", ["-p", prompt, "--model", MODEL], { timeout: 90000, env }, (err, stdout) => {
      const t = (stdout ?? "").trim();
      if (err || !t) reject(err ?? new Error("empty CLI response"));
      else resolve(t);
    });
  });
}
async function reason(prompt: string): Promise<string> {
  if (claude) {
    try {
      const r = await claude.messages.create({ model: MODEL, max_tokens: 200, messages: [{ role: "user", content: prompt }] });
      const t = (r.content[0] as any)?.text ?? "";
      if (t) return t;
    } catch (e) {
      console.error("[reason] API backend failed, trying CLI:", (e as any)?.message?.slice(0, 100));
    }
  }
  try { return await reasonViaCli(prompt); }
  catch { throw new Error("no working LLM backend — skip action (never fabricate)"); }
}

export type StrategyResult = { kind: string; detail: string; reasoning: string; act?: { to: `0x${string}`; data: `0x${string}`; value: bigint } };

// Pure helpers (unit-tested offline in tests/unit/strategies-data.test.ts)
export function topVenusMarkets(j: any): { sym: string; supplyApy: number }[] {
  return ((j?.result ?? []) as any[])
    .map((m) => ({ sym: m.symbol ?? m.underlyingSymbol, supplyApy: Number(m.supplyApy) }))
    .filter((m) => Number.isFinite(m.supplyApy) && m.supplyApy > 0)
    .sort((a, b) => b.supplyApy - a.supplyApy).slice(0, 5);
}
// PCS v3 WBNB/USDT 0.05%: token0=USDT (0x55d3… < 0xbb4C…), token1=WBNB, both 18 dec → USDT/WBNB = 1/1.0001^tick
export function usdtPerWbnbFromTick(tick: number): number {
  return 1 / Math.pow(1.0001, tick);
}

// 1) HEALTH-FACTOR MONITOR — reads a real Aave v3 BSC account's HF (live borrower, build-discovered DT-7)
export async function healthFactorTick(watch: `0x${string}`): Promise<StrategyResult> {
  const d = await pubMain.readContract({ address: M.aavePool as `0x${string}`, abi: AAVE_POOL_ABI, functionName: "getUserAccountData", args: [watch] });
  const hf = Number(d[5]) / 1e18;
  const debtUsd = Number(d[1]) / 1e8;
  const reasoning = await reason(`Aave v3 BSC health factor for ${watch} is ${hf.toFixed(3)} (debt $${debtUsd.toFixed(0)}). In 1-2 sentences: risk assessment + action (monitor/top-up).`);
  return { kind: "hf_check", detail: JSON.stringify({ watch, healthFactor: hf, totalDebtBase: d[1].toString() }), reasoning };
}

// 2) YIELD OPTIMIZER — compares live Venus core-pool supply APYs; states routing decision
export async function yieldTick(): Promise<StrategyResult> {
  const res = await fetch("https://api.venus.io/markets/core-pool?limit=60", { signal: AbortSignal.timeout(8000) });
  const j = await res.json().catch(() => null);
  const top = topVenusMarkets(j); // [VERIFIED] {result:[{symbol,supplyApy}]} DT-7
  if (!top.length) throw new Error("venus api empty — skip action");
  const reasoning = await reason(`Venus BSC top supply APYs: ${JSON.stringify(top)}. As a yield-routing agent: which venue/asset gets the next dollar and why (2 sentences)?`);
  return { kind: "yield_route", detail: JSON.stringify({ top }), reasoning };
}

// 3) REBALANCER — reads live PCS v3 WBNB/USDT 0.05% pool tick vs target range; emits rebalance decision
const SLOT0_ABI = [{ name: "slot0", type: "function", stateMutability: "view", inputs: [], outputs: [
  { type: "uint160" }, { type: "int24" }, { type: "uint16" }, { type: "uint16" }, { type: "uint16" }, { type: "uint32" }, { type: "bool" }] }] as const;
export async function rebalanceTick(pool: `0x${string}`): Promise<StrategyResult> {
  const slot0 = (await pubMain.readContract({ address: pool, abi: SLOT0_ABI as any, functionName: "slot0" })) as any;
  const tick = Number(slot0[1]);
  const range = { lower: tick - 500, upper: tick + 500 };
  const reasoning = await reason(`PCS v3 WBNB/USDT pool ${pool} current tick ${tick}. Position range ${JSON.stringify(range)} drifted? Rebalance decision in 2 sentences.`);
  return { kind: "rebalance", detail: JSON.stringify({ pool, tick, range }), reasoning };
}

// 4) GRID TRADER — reads live spot from the same pool's tick, states next grid orders
export async function gridTick(pool?: `0x${string}`): Promise<StrategyResult> {
  let spot = "";
  if (pool) {
    const slot0 = (await pubMain.readContract({ address: pool, abi: SLOT0_ABI as any, functionName: "slot0" })) as any;
    spot = ` Live spot from pool tick ${Number(slot0[1])}: ~${usdtPerWbnbFromTick(Number(slot0[1])).toFixed(2)} USDT/WBNB.`;
  }
  const reasoning = await reason(`Grid-trading analysis for BSC WBNB/USDT 0.05% pool, grid step 0.5%.${spot} Compute the next buy level (-0.5% from spot) and next sell level (+0.5% from spot) and justify in one sentence. Output the two price levels and the justification only.`);
  return { kind: "grid_step", detail: JSON.stringify({ pair: "WBNB/USDT", step: "0.5%" }), reasoning };
}

export function recordAction(agentToken: number, r: StrategyResult, txHash?: string) {
  db.prepare("INSERT INTO agent_actions(agent_token,kind,detail,tx_hash,reasoning) VALUES(?,?,?,?,?)")
    .run(agentToken, r.kind, r.detail, txHash ?? null, r.reasoning);
}
