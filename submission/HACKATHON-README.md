# Winnow

> The trust-graded agent marketplace for BSC: every grade is recomputable, and you hire on a revocable spend-capped leash.

**Live Demo:** https://winnow-bsc.onrender.com | **Proof:** https://winnow-bsc.onrender.com/proof | **Demo Video:** submission/demo-video.mp4 | **GitHub:** https://github.com/dmustapha/winnow-bsc

Built solo for BNB Chain's Build the Era hackathon (Smart Money Era). Main track: BNB Agent Studio Marketplace. Partner tracks: Altana, TermiX, PancakeSwap.

---

## The Problem
BSC hosts 310,000+ ERC-8004 agents and almost none can be trusted at face value: roughly 4% declare a live endpoint, 59.2% of reviewers show coordinated feedback patterns (arXiv 2606.26028), and burned registrations outrank live agents in today's search. Finding a real agent is the whole problem, and no directory lets you check its work.

## What We Built
A marketplace where every number is recomputable. Winnow mirrors the ERC-8004 registry with honest counters, live-probes each agent's declared MCP and A2A endpoints, and grades from raw evidence. A judge picks a category, opens an agent, reads its grade breakdown and raw probe transcript, and clicks "Re-probe now" to watch the grade re-derive live. Hiring an agent grants an Altana session with a spend cap, an allowlist, and an expiry enforced onchain by the Keystore, revocable in one transaction.

## Verify in 60s
A cold judge can watch the core claim re-derive with one action, no wallet and no setup:

- **One URL, live recompute:** open any agent, for example https://winnow-bsc.onrender.com/agent/97/2288 , and click **Re-probe now**. A real probe fires at the agent's endpoint and the grade re-derives in front of you (about 1 to 7 seconds; 20s cooldown per agent). This is the hero claim (a grade cannot exist without its probe transcript) proving itself.
- **One command, from a fresh clone (recompute the committed snapshot):**
  ```bash
  git clone https://github.com/dmustapha/winnow-bsc && cd winnow-bsc/winnow-app
  npm install
  DB_PATH=./seed/winnow-seed.db npx tsx scripts/verify-claims.ts
  ```
  This recomputes indexed / probed / verifiedLive counters and asserts zero orphan grades and zero negative attestations against the committed database.
- **Onchain receipts:** every attestation and session tx is in `winnow-app/submission/proof.md` with explorer links; 18 of 18 return status 0x1.

## Our Integration
- **ERC-8004 (identity + reputation, the backbone).** Reads the whole corpus via the 8004scan API and writes verified liveness back as `giveFeedback` attestations on the canonical Reputation Registry. Code: `winnow-app/src/lib/scan8004.ts`, `winnow-app/src/lib/attestor.ts`. Receipts: `0xa35e384c…`, `0x43980a03…`, `0xd09508a9…` (status 0x1).
- **Altana (the hire button).** `@altananetwork/sdk` 0.9.0 mints Keystore sessions with cap + allowlist + expiry; in-product view and revoke; over-cap reverts with `ExceededSpendLimit`. Code: `winnow-app/src/lib/altana.ts` and the activate/revoke/sessions/overcap API routes. Full lifecycle receipts in `proof.md`; standing session #6 live.
- **PancakeSwap v3.** Rebalancer and grid agents read pool `slot0` ticks and the Quoter. Code: `winnow-app/src/lib/agents/strategies.ts`, `winnow-app/src/lib/config.ts`.
- **TermiX.** Agent Advantage Report with three real tasks both ways: `winnow-app/submission/AGENT-ADVANTAGE-REPORT.md`.

## What Makes This Different
Existing BSC agent directories show counts. Winnow shows evidence: a grade that cannot exist without its probe transcript, a re-probe button that re-derives it live, and a writeback that leaves the canonical registry better than it found it. The hire flow is a real onchain leash, not a UI toggle, proven by an over-cap revert.

## Track
Primary: BNB Agent Studio Marketplace. Partner bounties: Altana (Gold), TermiX (report attached), PancakeSwap (two live categories), AltLayer/8004scan (live API consumption).

## Tech Stack
Next.js 14 (App Router), TypeScript, viem, better-sqlite3, `@altananetwork/sdk` 0.9.0, 8004scan API, PancakeSwap v3, Aave v3, Venus, a pluggable OpenAI-compatible LLM gateway (with Anthropic and Claude CLI fallbacks), Docker on Render. No custom contracts: Winnow composes the canonical ERC-8004 registries and the Altana Keystore.

## Try It
Visit https://winnow-bsc.onrender.com (free-tier host: first load after idle can take about 40 seconds to wake). Pick a category, open an agent, read its grade and transcript, and click "Re-probe now". Visit /proof for wallets, receipts, and recompute paths.

## Demo Walkthrough
1. Land: honest live counters, four category tiles with real graded counts.
2. Pick a category (all four have a live reference agent with equal depth).
3. Open an agent: grade breakdown (liveness / meta / feedback / track) plus the raw probe transcript.
4. Re-probe: the grade re-derives live.
5. Activate: an Altana session grants with a visible cap and expiry.
6. Prove the leash: an over-cap spend reverts onchain; revoke is one click.
7. Proof page: wallets, attestation and session receipts, recompute commands.

## Team
Solo submission by Damilola Mustapha (GitHub @dmustapha, X @capitanoo23).

## Demo Notes
- **Real:** live probes and grades, onchain attestations and Altana session lifecycle (testnet), 93 LLM-reasoned agent actions, four live A2A cards.
- **Seeded:** the committed snapshot database for offline recompute; the live host indexes and grades continuously on top of it.
- **Network:** writes on BSC testnet (chainId 97), market-data reads on BSC mainnet (chainId 56). Chain labels are shown per row. Mainnet migration is documented and pending a small gas top-up.
