<p align="center"><img src="public/logo.svg" width="72" alt="Winnow logo: a sieve grid with one solid node among hollow shells"/></p>

# Winnow: the trust-graded agent marketplace for BSC

BSC hosts 310,000+ AI agents registered under ERC-8004, and almost none of them can be trusted at face value: roughly 4% declare a live endpoint, 59.2% of reviewers show coordinated feedback patterns (arXiv 2606.26028), and burned registrations outrank live agents in today's search. Winnow is a marketplace where every number is recomputable: it live-probes agents' declared MCP/A2A endpoints, grades them from raw evidence you can re-run yourself, writes verified liveness back to the canonical onchain registry, and lets you hire a graded agent inside a spend-capped session you can revoke in one click (activation ships for the reference agents today; grading covers everyone).

**Live: https://winnow-bsc.onrender.com** · [Proof page](https://winnow-bsc.onrender.com/proof) · [Agent Advantage Report](submission/AGENT-ADVANTAGE-REPORT.md) · [Onchain proof](submission/proof.md)

Built solo for BNB Chain's Build the Era hackathon (Smart Money Era). Judged criteria: Functionality, Data Quality, Agent Diversity. Bounties targeted: Altana, TermiX, PancakeSwap.

## The stats line (all recomputable)

60,907 agents indexed from the BSC registry (growing live, honest counters). 3,358 graded, each grade joined to a raw probe transcript by a NOT NULL foreign key: a grade without evidence cannot exist in the schema. 3 onchain attestations, 5 Altana sessions (grant, in-cap execute, over-cap revert, revoke all proven with receipts), 93 real agent actions with LLM reasoning. Recompute any of it against the committed snapshot: `DB_PATH=./seed/winnow-seed.db npx tsx scripts/verify-claims.ts`.

## How it works

1. **Index honestly.** A paced worker mirrors the full ERC-8004 registry through the 8004scan API (30 req/min budget, resumable cursor). Ungraded agents stay listed and labeled: ungraded never means hidden.
2. **Probe for real.** Each agent's declared MCP endpoint gets a real `initialize` call; its A2A card gets fetched. Timeouts and refusals are results, not errors. The raw transcript ships with the grade, and every grade has a "Re-probe now" button that re-derives it in front of you.
3. **Grade from evidence.** Liveness (40) + metadata (15) + feedback validity (30, a published coordinated-farming heuristic, never rendered as an accusation) + onchain track record (15) = a letter grade. The formula is public; the inputs are replayable.
4. **Write truth back.** Verified liveness becomes an ERC-8004 `giveFeedback` attestation on the canonical Reputation Registry, readable by any third-party 8004 app. Positive and neutral findings only: caution stays in the UI, accusations never go onchain.
5. **Hire on a leash.** Activating an agent grants an Altana session with a spend cap, call allowlist, and expiry, enforced by the onchain Keystore. Firing it is one transaction. We demo the over-cap attempt reverting (`ExceededSpendLimit`), because a cap that only lives in the UI is not a cap.

## Agent Diversity: four categories, each with a live reference agent

| Category | Reference agent | ERC-8004 id (BSC testnet) | What it does |
|---|---|---|---|
| Health Factor Monitoring | Winnow Sentinel | 2288 | Watches a real Aave v3 BSC account's health factor via `getUserAccountData`, reasons on liquidation distance |
| Yield Optimisation | Winnow Harvester | 2289 | Ranks live Venus supply APYs and routes the next dollar |
| Rebalancing | Winnow Ranger | 2290 | Reads PCS v3 pool tick vs position range, decides rebalances |
| Grid Trading | Winnow Gridsmith | 2291 | Quotes both directions on PCS and places grid decisions with a risk statement |

All four serve real A2A agent cards from this app (`/api/a2a/{name}`) and are graded by the same probe engine as everyone else. Their actions run against live mainnet data (Aave pool `0x6807dc92…`, VenusLens `0x595e9DDf…`, PCS v3 pool `0x36696169…`) with real LLM reasoning per action.

## Integration showcase

### ERC-8004 (identity + reputation, the data backbone)
Canonical registries on BSC: Identity `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`, Reputation `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` (testnet: `0x8004A818BFB912233c491871b3d84c89A494BD9e` / `0x8004B663056A597Dffe9eCcC1965A193B7388713`). Winnow reads the whole corpus and is the registry's write-path too: probe verdicts become `giveFeedback` attestations. Sample receipts (BSC testnet): [`0xa35e384c…`](https://testnet.bscscan.com/tx/0xa35e384cc957f27ff3cb16f24ab765e0f1a0f1b72ada1ca589e30ec73cb0796b), [`0x43980a03…`](https://testnet.bscscan.com/tx/0x43980a03874ea116c9e6cfd01e3515547ecc3a6c84577ec3eb041ad8faa0d063). Own-agent attestations use a second signer (`0x5e6cBAb6C130C21f329209697e050773f72F92c1`) because the spec bars self-feedback.

### Altana (sessions = the hire button)
`@altananetwork/sdk` 0.9.0. Activate mints a session with a calls allowlist, a per-day spend cap, and an expiry, enforced onchain by the Keystore (`0x6b8361C29d05D498b1a12B54A37310f94171E94A` testnet). Full lifecycle proven with receipts: grant [`0xb4433aee…`](https://testnet.bscscan.com/tx/0xb4433aeec60cbe2f57f570e4217a3aeec6c0cade5bc24da6b978ce3c265f5953), in-cap execute, over-cap attempt reverting with `ExceededSpendLimit`, revoke, and `isValidKey` flipping onchain. A live demo session stays granted. Operator wallet: `0xc211C942946011859ca634F22400d80570ED12A5`.

Wallet model, stated plainly: sessions are granted from one operator EIP-7702 smart wallet, with per-agent wallets as the allowlisted call targets. This is a deliberate custody-minimizing demo design that keeps one funded key while every grant stays capped, expiring, and revocable onchain. Per-agent Altana wallets, each agent signing from its own smart wallet, are the roadmap. The Keystore enforcement story is identical in both models.

### TermiX (prove it beats DIY)
The [Agent Advantage Report](submission/AGENT-ADVANTAGE-REPORT.md) runs three real tasks both ways (agent vs step-by-step manual execution) with wall-clocked timings, costs, a scoring rubric, and every output attached verbatim. One is a trading task with a window label, calibration framing, and a risk statement. The candid finding: on raw seconds the scripted manual path wins two tasks; the agent's provable advantage is cost per decision and 24/7 cadence, and the report says exactly that instead of inventing a multiplier.

### PancakeSwap (two of the four categories)
Rebalancer and grid agents run on PCS v3 primitives per PancakeSwap's own "Building Trading Agents on V3" guide: pool `slot0` ticks, the Quoter (`0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997`), and the factory-resolved WBNB/USDT pool. Safe by construction: capped sessions, read-heavy strategies, no user funds at risk.

## Try it (60 seconds, no wallet needed)

1. Open https://winnow-bsc.onrender.com (free-tier host: first load after idle can take about 40s to wake).
2. Pick a category. Open any agent. Read its grade breakdown and raw probe transcript.
3. Click "Re-probe now": a real probe fires at the agent's endpoint and the grade re-derives in front of you.
4. Open an attestation link: the same feedback is on BscScan and in any third-party 8004 reader.
5. Visit [/proof](https://winnow-bsc.onrender.com/proof) for wallets, receipts, counters, and the recompute paths.

## Testing

Dev suite: `npm run typecheck && npm run test:unit && npm run test:api && npm run verify` (invariant verifier: zero orphan grades, zero negative attestations). Falsification tests feed the system lies and assert red: a dead-endpoint agent must grade F (`tests/falsify/garbage-endpoint.test.ts`), an over-cap spend must revert (`tests/falsify/overcap-live.test.ts`). Stress: 65/65 checks including a 43-case adversarial API battery with zero 500s, worker kill -9 recovery, and 20-way concurrent load.

## On-chain verification (chain-labeled)

Writes currently run on BSC testnet (chain 97), reads on mainnet (chain 56); every explorer link above is labeled with its chain. The mainnet migration path (re-run registration, attestation, and one real action per agent on chain 56, about $6 of gas) uses the identical code already proven end-to-end on testnet. Altana's bounty explicitly accepts testnet.

## Stack

Next.js 14 (App Router) · better-sqlite3 · viem · `@altananetwork/sdk` 0.9.0 · Anthropic (agent reasoning) · Docker on Render. No custom contracts: Winnow composes the canonical ERC-8004 registries and the Altana Keystore, which is the point: anything it writes, every other agent app can read.

## Honesty ledger

Claims and their evidence live in [CLAIMS.md](CLAIMS.md); [SECURITY.md](SECURITY.md) covers custody (operator key server-side only, agent keys capped and expiring). Known limits, stated plainly: feedback validity is a heuristic (method note in the footer), grading coverage grows continuously and the counters say exactly how far it has gotten, and the free-tier host sleeps when idle (an always-on upgrade is one billing toggle away).
