// File: scripts/agent-advantage.ts — TermiX report: 3 tasks BOTH WAYS with timing/cost/quality (PRD 7.8, CRITIQUE E-3).
// Reads the recorded runs (submission/advantage-runs/*.json — agent legs via the marketplace strategies,
// manual legs REAL sequential CLI commands with REAL wall-clocks; never simulated timings) and assembles
// submission/AGENT-ADVANTAGE-REPORT.md. Rubric scores below are operator-scored with justifications inline;
// manual legs win several quality dimensions — that is the honest result.
import fs from "node:fs";

type AgentRun = { task: string; startedAt: string; timeMs: number; gasUsd: number; llmCostUsdEstimate: number; kind: string; detail: string; reasoning: string };
type ManualRun = { task: string; timeMs: number; window: string; gasUsd: number; steps: { cmd: string; out: string }[]; decision: string };
const agent = JSON.parse(fs.readFileSync("submission/advantage-runs/agent-legs.json", "utf8")) as { recordedAt: string; runs: AgentRun[] };
const manual = JSON.parse(fs.readFileSync("submission/advantage-runs/manual-legs.json", "utf8")) as { operatorNote: string; runs: ManualRun[]; calibration: { realizedAt: string; cmd: string; out: string } };
const a = (t: string) => agent.runs.find((r) => r.task === t)!;
const m = (t: string) => manual.runs.find((r) => r.task === t)!;
const sec = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

// Rubric: 1-5 per dimension per leg, operator-scored, justification required. Honest: manual wins where it wins.
type Score = { correctness: number; riskAwareness: number; reproducibility: number; clarity: number; why: string };
const RUBRIC: Record<string, { agent: Score; manual: Score }> = {
  A_grid: {
    agent: { correctness: 4, riskAwareness: 2, reproducibility: 3, clarity: 5,
      why: "Levels 747.82/755.33 are a correct ±0.5% bracket of live tick-derived spot (~751.58), but spot came from one side only (tick) with no spread check; NO explicit risk statement in the output (scored down hard — the strategy prompt must add one); LLM output varies run-to-run so only the recorded transcript reproduces; the two-levels-one-sentence format is maximally clear." },
    manual: { correctness: 5, riskAwareness: 4, reproducibility: 5, clarity: 4,
      why: "Two-sided quoter mid (751.51) with the ~0.10% spread measured and used as a floor on grid width; risk handled for spread but silent on inventory/liquidation risk; every command pasted and deterministic; decision is two dense lines." },
  },
  B_health: {
    agent: { correctness: 4, riskAwareness: 5, reproducibility: 3, clarity: 4,
      why: "HF 1.332 and the >25%-drawdown-liquidates figure are both right (hand check: 24.90%), but '0.08 HF points from critical zone' is an unanchored threshold and 'high-risk territory' overstates a 1.33 HF; risk framing and concrete actions (top-up target, hourly cadence) are excellent; LLM nondeterminism again; minor verbosity." },
    manual: { correctness: 5, riskAwareness: 4, reproducibility: 5, clarity: 4,
      why: "Full conversion (collateral, debt, available borrows, threshold, exact 24.90% drop-to-liquidation); calibrated 'elevated-but-not-critical' read with a 1.20 top-up trigger; commands fully reproducible; assessment is compact." },
  },
  C_yield: {
    agent: { correctness: 4, riskAwareness: 3, reproducibility: 3, clarity: 4,
      why: "Top-5 ranking is correct against the same API; it names vU's concentration risk but still routes the next dollar to a non-stable for a 6bp edge; 'vU isn't a stablecoin' is asserted without verification; API snapshot recorded but LLM verdict varies; readable." },
    manual: { correctness: 4, riskAwareness: 5, reproducibility: 5, clarity: 4,
      why: "Same correct ranking (first jq attempt genuinely failed on null supplyApy rows — failure kept in the transcript); explicitly prices the 6bp-vs-concentration tradeoff and takes the stable venue; deterministic pipeline; compact decision." },
  },
};
const avg = (s: Score) => ((s.correctness + s.riskAwareness + s.reproducibility + s.clarity) / 4).toFixed(2);
const fmt = (s: Score) => `${avg(s)}/5 (corr ${s.correctness}, risk ${s.riskAwareness}, repro ${s.reproducibility}, clarity ${s.clarity})`;
const cost = (r: AgentRun) => `$${r.llmCostUsdEstimate.toFixed(5)} LLM (token estimate) + $0 gas`;
const OPERATOR_HOUR = 60; // USD/hr — stated assumption for valuing operator time
const mCost = (r: ManualRun) => `$0 gas + operator time (${sec(r.timeMs)} recorded ≈ $${((r.timeMs / 3600000) * OPERATOR_HOUR).toFixed(2)} at $${OPERATOR_HOUR}/hr)`;

const TASKS: { key: string; title: string; alt: string }[] = [
  { key: "A_grid", title: "Task A — WBNB/USDT grid decision (trading, high-stakes)", alt: "an operator running factory→slot0→two-sided-quoter→arithmetic by hand" },
  { key: "B_health", title: "Task B — Aave v3 health-factor assessment (security-adjacent)", alt: "an operator running getUserAccountData + hand conversion" },
  { key: "C_yield", title: "Task C — Venus yield routing", alt: "an operator running curl + jq + hand comparison" },
];

const section = (t: { key: string; title: string; alt: string }) => {
  const ag = a(t.key), mn = m(t.key), rb = RUBRIC[t.key];
  const ratio = mn.timeMs / ag.timeMs;
  const speedLine = ratio >= 1
    ? `a ${ratio.toFixed(1)}× recorded speed edge for the agent`
    : `the tool-driven manual leg was ${(1 / ratio).toFixed(1)}× faster on the recorded clock (agent time includes LLM reasoning latency)`;
  return `## ${t.title}

| Leg | Time | Cost | Quality (rubric avg) |
|---|---|---|---|
| Agent (marketplace strategy, ${ag.kind}) | ${sec(ag.timeMs)} | ${cost(ag)} | ${fmt(rb.agent)} |
| Manual (${t.alt}) | ${sec(mn.timeMs)} | ${mCost(mn)} | ${fmt(rb.manual)} |

**Price + speed vs alternative:** agent ${sec(ag.timeMs)} / ${cost(ag)} vs manual ${sec(mn.timeMs)} recorded — ${speedLine}; the receipt: the manual clock is an operator-tooling LOWER BOUND (a human at a keyboard doing these steps takes minutes${t.key === "A_grid" ? "; PRD expectation 8–15 min for this task" : ""}). The agent's real advantage is cadence: it makes this decision every worker tick, unattended, at ~$${a(t.key).llmCostUsdEstimate.toFixed(4)}/decision.

**Rubric notes (agent):** ${rb.agent.why}
**Rubric notes (manual):** ${rb.manual.why}

**Agent output (verbatim):**
> detail: \`${ag.detail}\`
${ag.reasoning.split("\n").map((l) => `> ${l}`).join("\n")}

**Manual leg (every command + output, verbatim, sequential — wall-clock ${sec(mn.timeMs)} over ${mn.window}):**
${mn.steps.map((s) => "```\n$ " + s.cmd + "\n" + s.out + "\n```").join("\n")}
> Decision (hand-written): ${mn.decision}
`;
};

const A_ = a("A_grid");
const md = `# Winnow — Agent Advantage Report (TermiX)
Generated ${new Date().toISOString()}

**Honest labeling:** calibration runs executed by the operator on 2026-09-09; agent legs via the marketplace's own strategy code (\`src/lib/agents/strategies.ts\`, live BSC mainnet reads, Claude haiku reasoning — API key was creditless so legs ran through the local \`claude\` CLI fallback, cost shown is the token *estimate* at haiku API list prices); manual legs performed by hand as real sequential CLI commands with real wall-clocks (never simulated); receipts inline. ${manual.operatorNote}

**Summary (honest):** on the recorded clocks the agent beat the manual leg only on Task A (${sec(A_.timeMs)} vs ${sec(m("A_grid").timeMs)}); on B and C the tool-driven manual legs were faster because agent time includes LLM reasoning latency — but the manual clocks are operator-tooling lower bounds, and a human at a keyboard takes minutes per task (PRD expectation 8–15 min for Task A alone). The agent's provable wins are **cost** (≈$0.0004–0.0005/decision vs priced operator time) and **cadence** (unattended, every worker tick). The manual legs win **reproducibility** on all three tasks and **correctness/risk-awareness** on two — a human analyst given time matches or beats per-decision quality. The agent's advantage is doing near-par work continuously for ~a twentieth of a cent; we state that plainly instead of a 600× multiplier.

${TASKS.map(section).join("\n---\n\n")}
---

## Task A trading trio (TermiX rubric)
- **Evaluation window:** single decision cycle — agent leg ${A_.startedAt}, manual leg ${m("A_grid").window}. Single-session calibration, 1 decision cycle on 2026-09-09. No longer window exists yet; absent long-window data is stated as absent, not extrapolated.
- **Decision-quality vs realized spot (labeled CALIBRATION — assessed by rubric, not P&L, not a win rate):** at ${manual.calibration.realizedAt} (after both legs) \`${manual.calibration.cmd}\` → ${manual.calibration.out}. Both legs' grid levels bracket the realized spot at ±0.5% (agent 747.82/755.33, manual 747.75/755.27); neither level was touched in the window; tick was unchanged.
- **Risk statement:** grid orders on WBNB/USDT carry inventory risk (a trending move fills one side repeatedly), AMM spread/slippage cost (~0.10% measured two-sided), and stale-quote risk between decision and execution. Nothing here is financial advice; no P&L is claimed — no live orders were placed in this calibration.

## Method
- Agent legs: \`npx tsx --env-file=.env scripts/advantage-agent-leg.mts\` → \`submission/advantage-runs/agent-legs.json\` (wall-clock via Date.now around the exact strategy call the worker uses).
- Manual legs: commands run one at a time in a real shell, epochs captured with \`date -u +%s.%N\` before the first and after the last step; transcripts in \`submission/advantage-runs/manual-legs.json\` including the genuine first-attempt jq failure on Task C.
- Rubric: correctness, risk-awareness, reproducibility, clarity, 1–5 each, both legs, operator-scored with written justification above. Regenerate this file: \`npm run advantage\`.
`;
fs.writeFileSync("submission/AGENT-ADVANTAGE-REPORT.md", md);
console.log("submission/AGENT-ADVANTAGE-REPORT.md written");
