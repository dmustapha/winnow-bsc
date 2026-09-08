# WINNER-BRIEF — BNB Chain Build the Era (Smart Money Era)
**Idea:** Winnow (warroom codename TRIAGE) | **Track:** Main + Altana + TermiX + PancakeSwap | **Warroom Version:** V1 | **Date:** 2026-09-08

---

## Chosen Idea
**Winnow** — the trust-graded agent marketplace for BSC. It indexes all 310K+ ERC-8004 agents, live-probes their published MCP/A2A endpoints, runs Sybil-cluster analysis over the onchain feedback graph, detects burned/dead registrations, and renders every agent as a recomputable grade ("re-probe now" button on every number). Verified-live findings are written back onchain as ERC-8004 attestations other apps can read. Hiring any agent = granting a spend-capped, allowlisted, expiring Altana session — with live spend monitoring and one-click onchain revocation in-product. Four first-class categories (rebalancing, grid trading, yield, health factor) each carry live, hireable reference agents built from Altana production skills.

## Problem Statement
Finding a real agent on BSC is nearly impossible: of 310,215 registered agents, **only ~4% declare a live endpoint, 59.2% of reviewers are Sybil-coordinated, and 77.9% of rated agents have zero valid feedback after filtering** (arXiv 2606.26028). Burned agents outrank live ones in today's search. BNB Chain's own framing: "hiring one today means digging through X threads and GitHub repos."
**The one shocking number:** 310,215 registered agents — ~12,000 plausibly real.

## Why It Won
| Criterion | Weight | Round-0 | Rationale |
|-----------|:---:|:---:|---|
| Functionality | ~33% | 8.0 | Cleanest zero-knowledge journey: graded list → understand → activate; nothing gates or blocks |
| Data Quality | ~33% | 8.3+ | Only idea producing data 8004scan doesn't have (live verdicts, Sybil clusters, attestation trail), all recomputable |
| Agent Diversity | ~33% | 8.3 | Grading is category-agnostic; Altana skills make one live agent per category feasible |
Round-0 criteria-weighted total: **8.23 (unanimous #1 of 6)**

## Key Deliberation Arguments (Why This Won)
1. ORACLE: "D is the only idea that produces data a judge could NOT get from 8004scan today… that is exactly the criterion's 'beyond basic counts.'"
2. WILD: "BNB would actually adopt D — the only shape that leaves their 310K-agent registry better than it found it, keeps producing honest signal with zero operator babysitting across the two-week judging window, and turns the marketplace into the reputation graph's write-path rather than another reader."
3. Cross-exam: REMATCH's baseline-authorship KILLING BLOW stood unanswered; the registry-locality attack on TRIAGE was REFUTED with live fact-check evidence (agents verifiably on BSC IdentityRegistry 0x8004A169…).

## Whitespace Occupied
Gap-map whitespace #1 (trust-graded data at scale as the hiring signal) + #4 (marketplace as the reputation graph's write-path) — no roster entrant ships either; incumbents (8004scan/RNWY) score statically without live probes, recompute buttons, or in-product capped hiring.
**Event Class:** open_buildathon (declared)
**Selection Path:** scored_pool

## Thesis
WINNING ARGUMENT: In a field of 20+ look-alike directories over a registry that is 96% shells, the adoptable marketplace is the one whose every number can be re-verified live — Winnow grades the whole registry with recomputable probes, writes verified liveness back onchain, and lets anyone hire a graded agent inside a spend-capped, one-click-revocable session.
EVIDENCE:
1. Data Quality is a named 1/3 criterion AND the proven whitespace (4% live endpoints, 59.2% Sybil — nobody in the 20+ roster ships trust-graded data). | 2. Unanimous Round-0 8.23; survived cross-exam on fact-checked claims (open 8004scan API, writable ReputationRegistry, probe-able per-agent endpoints — all live-verified). | 3. Adoption logic: the only shape that leaves BNB's registry better than it found it — attestations any third-party 8004 reader displays.
DEMO OBLIGATION: The judge must WITNESS (a) a grade recomputed live — "re-probe now" runs a real probe and the rank visibly updates; (b) a liveness attestation tx landing onchain; (c) a hire completing through a spend-capped Altana session with a 1-click onchain revoke (and an over-cap attempt reverting).
HERO FLOW: Land → pick a category → compare graded agents (live vitals + onchain track record) → activate with a spend cap → watch it act on real DeFi state → revoke in one click.
INVARIANTS:
- Demo state is never fabricated: grades exist only from probes that actually ran (U7).
- Negative findings are NEVER written onchain — attestations are positive/neutral (liveness-verified) only; caution signals stay UI-side.
- Ungraded ≠ unlisted: the full registry index ships; grades are an overlay, never a listing gate.
- Every displayed number links its recompute path (evidence URI or re-probe button).
DRIFT TRIPWIRES:
- If "our 4 reference agents" becomes the headline instead of "the trust-graded 310K-agent marketplace," that is drift.
- If onchain attestation-writing becomes the demo's main event instead of the zero-knowledge hiring journey, that is drift.

## Top Risks + Mitigations
| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | 12h solo scope fantasy (probe engine + UI + sessions + 4 live agents + report) | CRITICAL | Pre-ranked cut list enforced at forge: core = full index + grades + hire flow + 1 reference agent/category via Altana skills; cut-first tier = burned-key detection depth, Aave duplicate agent, foreman showcase |
| 2 | Low probed coverage reads as demo-scale index | CRITICAL | Full 310K index imported day one (paginated 8004scan pull + cache); grades overlay a subset honestly labeled ("graded N, growing") |
| 3 | 14-day liveness Sep 9–23 (adoption judges test late) | CRITICAL | Non-sleeping host (Fly/paid tier) + health checks + auto-restart + background probe queue; uptime monitor |
| 4 | Mainnet wallet unfunded until morning | HIGH | Build+rehearse all onchain writes on BSC testnet tonight (0.147 tBNB funded); scripted mainnet runbook for morning top-up (~$2 BNB); Altana bounty explicitly accepts testnet |
| 5 | Trust-scoring differentiation vs 8004scan/RNWY unarticulated | MED | README comparison table; pitch leads with live-probe + recompute + write-back + capped hiring (incumbents have none) |

## Non-Negotiables (Must Be In Build)
- Full end-to-end hero flow with zero dead ends (land→category→compare→activate→act→revoke)
- All 4 categories with equal-depth UI AND at least one live hireable agent each (eligibility: agents LIVE on BSC)
- Altana: real session txs visible in explorer + in-product view/revoke + wallet addresses recorded for submission
- TermiX Agent Advantage Report: ≥3 tasks run both ways with time/cost/quality + outputs, ≥1 trading/security — generated from our own reference agents' runs (REMATCH salvage), labeled honestly as calibration runs
- Recompute affordance on every grade (timestamped snapshot + "re-probe now" that updates the stored grade)
- Honest coverage framing everywhere (never imply all 310K probed)

## Explicit Out-of-Scope
- Writing negative/Sybil accusations onchain (defamation risk — UI-side only)
- Probing all 310K agents (rate-limited queue, prioritized: agents with declared endpoints first)
- REMATCH's DIY-baseline as a ranking mechanism (authored-counterfactual veto) — both-ways runs exist ONLY in the TermiX report artifact
- FOREMAN autonomy chain as core (optional hour-9+ showcase, cuttable without trace)
- Mainnet-only insistence: testnet writes acceptable where bounty rules allow

## Minority Dissent (Unresolved Concerns)
- QUARTET scored SECOND OPINION (7.7) above TRIAGE on Agent Diversity ("categories as roles is the only shape where a health-factor agent is load-bearing"). Resolution: Winnow's cross-category depth comes from equal live supply + category-agnostic grading; the auditor-quorum mechanic loses on Functionality dead-end risk (JOURNEY 3/10).
- Challenge flag stands: if build enters with probe-gated listings or the full 4×4 reference fleet intact, that is a de facto VETO state — forge must enforce the cut list.
- Concern #15 note: Winnow's probe+attest kernel is combinable-flagged against shipped Agent Auditor (per built-projects.md "combinable" guidance); the product (hiring venue with session lifecycle + escrow supply) is a different load-bearing shape. Logged transparently.
