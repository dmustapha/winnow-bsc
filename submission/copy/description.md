**BSC has 310,000+ registered agents and almost no way to tell which one you can trust. Winnow makes every trust number recomputable and puts a revocable spend cap on every hire.**
BNB Chain Build the Era (Smart Money Era). Main track: BNB Agent Studio Marketplace. Partner tracks: Altana, TermiX, PancakeSwap.

## Project Status
- **Live and public:** https://winnow-bsc.onrender.com (stays up through the Sep 9 to 23 judging window).
- **Proof page (recomputable):** https://winnow-bsc.onrender.com/proof mirrors wallets, receipts, counters, and recompute paths.
- **Open source:** https://github.com/dmustapha/winnow-bsc
- **Onchain receipts:** every attestation and session tx is committed at `winnow-app/submission/proof.md`, each with an explorer link; 18 of 18 testnet receipts verify status 0x1, plus the write path is proven on BSC mainnet (four reference-agent registrations, ids 342419 to 342422, and a liveness attestation, receipts status 0x1 on bscscan.com).
- **TermiX Agent Advantage Report:** three real tasks run both ways with wall-clocks, costs, a rubric, and every output attached (`winnow-app/submission/AGENT-ADVANTAGE-REPORT.md`).
- Everything below is implemented and runnable today.

## The Problem
Discoverability is the stated gap for the 200,000+ ERC-8004 agents on BSC. Only about 4% declare a live endpoint, 59.2% of reviewers show coordinated feedback patterns (arXiv 2606.26028), and burned registrations outrank live agents in today's search. Finding a real agent is the whole problem, and no existing directory lets you check its work.

## The Solution
Winnow is a marketplace where every number is recomputable. It mirrors the full ERC-8004 registry with honest counters, live-probes each agent's declared MCP and A2A endpoints, and grades from raw evidence. A "Re-probe now" button re-derives any grade in front of you, because in our schema a grade cannot exist without its probe transcript (a NOT NULL foreign key). Verified liveness is written back to the canonical ERC-8004 Reputation Registry as attestations any third-party app can read, so Winnow leaves the registry better than it found it.

## How It Works
**1. Index honestly.** A paced worker mirrors the ERC-8004 registry through the 8004scan API (30 req/min budget, resumable cursor). Ungraded agents stay listed and labeled: ungraded never means hidden.
**2. Probe for real.** Each agent gets a real MCP `initialize` call and an A2A card fetch. Timeouts and refusals are results, not errors, and the raw transcript ships with the grade.
**3. Grade from evidence.** Liveness (40) + metadata (15) + feedback validity (30) + onchain track record (15) becomes a letter grade. The formula is public; the inputs are replayable.
**4. Write truth back.** Verified liveness becomes an ERC-8004 `giveFeedback` attestation on the canonical Reputation Registry. Positive and neutral findings only; accusations stay in the UI.
**5. Hire on a leash.** Activating an agent grants an Altana session with a spend cap, a call allowlist, and an expiry enforced onchain by the Keystore. Revoking is one transaction. We demo the over-cap attempt reverting (`ExceededSpendLimit`), because a cap that only lives in the UI is not a cap.

## Key Features
- **Recomputable grades:** every grade joins a raw probe transcript; re-derive any of them live from a fresh clone or from the running app.
- **Four categories, equal depth:** each seeded by a live reference agent serving a real A2A card, graded by the same engine as everyone else.
- **In-product session control:** grant, view the spend cap and expiry, run a capped spend, and revoke, all inside the UI.
- **Onchain honesty:** verified liveness written back to the canonical registry as attestations readable by any 8004 app.
- **Honest counters:** the landing page numbers are DB-derived and match `/api/stats`; coverage grows continuously and the counters say exactly how far it has gotten.

## Tech Stack
Next.js 14 (App Router) · TypeScript · viem · better-sqlite3 · `@altananetwork/sdk` 0.9.0 · 8004scan API · PancakeSwap v3 (Quoter + pool slot0) · Aave v3 · Venus · pluggable OpenAI-compatible LLM gateway with Anthropic and Claude CLI fallbacks · Docker on Render. No custom contracts: Winnow composes the canonical ERC-8004 registries and the Altana Keystore.

## Deployed / Composed Contracts (BSC testnet, chainId 97)
- ERC-8004 Identity: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- ERC-8004 Reputation: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- Altana Keystore: `0x6b8361C29d05D498b1a12B54A37310f94171E94A`
- Reference agents (ERC-8004 ids): Winnow Sentinel 2288 (health factor), Winnow Harvester 2289 (yield), Winnow Ranger 2290 (rebalancing), Winnow Gridsmith 2291 (grid trading)

## Hackathon Alignment
Primary track: BNB Agent Studio Marketplace (find, understand, and hire an agent by category with zero friction). Also entering Altana (agents transact through their own onchain session keys, in-product view and revoke), TermiX (Agent Advantage Report attached), and PancakeSwap (rebalancer and grid agents run on PCS v3 primitives, read-heavy and capped, no user funds at risk).

## Try It / Links
- Live app: https://winnow-bsc.onrender.com
- Proof page: https://winnow-bsc.onrender.com/proof
- GitHub: https://github.com/dmustapha/winnow-bsc
- Agent Advantage Report: https://github.com/dmustapha/winnow-bsc/blob/main/winnow-app/submission/AGENT-ADVANTAGE-REPORT.md
- Onchain receipts: https://github.com/dmustapha/winnow-bsc/blob/main/winnow-app/submission/proof.md
