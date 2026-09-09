# PULSE — Pipeline Rolling Context

## Active Facts
| Fact | Source | Phase |
|------|--------|-------|

## Decisions Log
| Decision | Rationale | Phase |
|----------|-----------|-------|

## Downstream Items
<!-- Owner-routed, non-blocking deferred work. Every skill reads on entry, actions rows it owns. See PULSE-PROTOCOL § Downstream Items. -->
| ID | Raised by | Owner phase | Pri | Item | Acceptance | Status |
|----|-----------|-------------|:---:|------|-----------|:------:|
| D-1 | warroom | deploy | HIGH | Fund 0xc211C942946011859ca634F22400d80570ED12A5 with ~0.01 BNB on BSC mainnet (Dami, morning) then run mainnet attestation+session runbook | mainnet txs visible on BscScan + Altana explorer | open |

## Skill Sections

### intel — 2026-09-08T22:15Z

#### Done
- ID 9 deep intel: 4 parallel research agents, ~124 tool calls, 40+ sources. research/research-brief.md written (all required sections + kill list). config.json E1-E7 extractions complete. Roster audit: 20 entrants (research/roster-audit/strategy-density.md). Quality auto-assessed 5.0/5.

#### Additions
- [NEW] 8004scan API live-probed and confirmed open (not in original brief): api.8004scan.io/api/v1, OpenAPI at /openapi.json, 310,215 BSC agents, 30 req/min free.
- [NEW] Submission form located + full field extraction: https://forms.gle/9g9XPNFwnYaHAz9L8 — NO video field, NO live-URL field; GitHub README carries all proof.

#### Deviations
- [SKILL] Phase 2 social review skipped (autonomous mode) — compensated via GitHub roster + 8004scan issue-tracker mining.
- [SKILL] Wave 3 Copilot/Grid skipped (no PAT; Grid corpus Solana-centric) — roster audit substituted.

#### Verified Facts
- DEADLINE 2026-09-09 12:00 UTC (NOON — registration form header).
- ERC-8004 BSC: Identity 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432, Reputation 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 (testnet 97: 0x8004A818BFB912233c491871b3d84c89A494BD9e / 0x8004B663056A597Dffe9eCcC1965A193B7388713). ValidationRegistry NOT deployed anywhere.
- Altana Keystore BSC 0x6572427ED530BadcF7375Cf9A4709D8d2b0E7E0a (testnet 0x6b8361C29d05D498b1a12B54A37310f94171E94A); SDK @altananetwork/{sdk 0.9.0, mcp 0.9.0, x402-server 0.2.0}; MCP requires Bun>=1.1.
- Data-quality whitespace: ~4% of BSC agents declare live endpoints; 59.2% Sybil reviewers; 77.9% of rated agents have zero valid feedback after filtering (arXiv 2606.26028); 0 validations globally.
- 4 HIGH-threat competitors: Marque (mainnet PCS rebalance receipts, marque.trade), KaizenScope (verify-gated payments), AgentEra (TermiX report done), SmartSentinels (mainnet agents in all 4 categories).
- PCS agent contracts: NPM 0x46A15B0b27311cedF172AB29E4f4766fbE7F4364, VenusLens 0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA, Aave v3 Pool 0x6807dc923806fE8Fd134338EABCA509979a7e0cB, Multicall3 0xcA11bde05977b3631167028862bE2a173976CA11.
- b402.ai Vistara SDK archived Apr 2026; Venus API non-authoritative for liquidation safety (use VenusLens RPC); browser x402 blocked by CORS (server-side only).

#### Assumptions
- [ASSUMED] Demo video 2-3 min, linked in README/Description (no published requirement; form has no video field).
- [ASSUMED] "Agents live on BSC" reads as mainnet for eligibility; Altana explorer txs may be testnet (explicitly allowed for the bounty).

#### Blockers for Downstream
- None.

#### Key Decisions
- [AUTO] Social review + Copilot/Grid skipped with substitutes (see Deviations).

#### For Next Skill
- Deliverable is PRESCRIBED (the marketplace). Warroom deliberates DIFFERENTIATION, not what-to-build. Lead whitespace axis = DATA QUALITY (Sybil-filtered reputation, live endpoint verification, onchain performance receipts) — it is both the competitor gap AND a named judging criterion.
- All 4 bounties stack into one coherent build: Altana sessions power the "activate" step; PCS agents cover rebalancing+yield; TermiX Agent Advantage Report is generated FROM the marketplace's own agents.
- Kill list highlights: raw-count directory over 8004scan (20+ teams building it), ValidationRegistry trust, mock agents, single-category depth, b402 SDK.
- ~13.5h remain. "Agents live on BSC" is an eligibility gate — plan how our surfaced agents become REAL (Altana skills playbooks + own reference agents registered in ERC-8004).

### warroom — 2026-09-09T00:45Z

#### Done
- Full 13-phase deliberation: 30 ideas (5 parallel generators) → 6 presented → Round-0 (4 scorers) → demo scripts → pool checkpoint → hands-on fact-check → cross-exam → challenge → selection. Winner: **Winnow** (TRIAGE shape) 8.23/10 unanimous. WINNER-BRIEF.md with Thesis locked; FINAL-VERDICT-V1.md; round-scorecard.md auto-emitted.

#### Additions
- [NEW] Fact-check evidence: wallet 0xc211C942946011859ca634F22400d80570ED12A5 — BSC mainnet ~0 BNB, testnet 0.147 tBNB; Altana SDK exports verified incl. hireErc8183Agent; npm needs --fetch-retries=5 (ETIMEDOUT seen).
- [NEW] Incumbent trust-scorers found at challenge: RNWY BNB explorer + BASCAN (BNB-retweeted) — comparison table now a build obligation.

#### Deviations
- [USER] Pool checkpoint answered interactively (TRIAGE-led top-3) BEFORE user went to sleep; all subsequent checkpoints [AUTO] per user directive "continue in proper autonomous mode… don't stop."
- [AUTO] Project name selected autonomously: Winnow (CP2 Part B naming session compressed; L12-clean vs roster).

#### Verified Facts
- 8004scan API: 310,215 BSC agents; per-agent mcp_server/a2a_endpoint/services exposed; feedbacks carry base64 JSON with clientAddress (Sybil raw material); 30 req/min.
- ReputationRegistry 0x8004BAa1… + VenusLens 0x595e9DDf… + PCS Quoter 0xB048Bbc1… all have code on BSC mainnet (eth_getCode).
- REMATCH registry-locality attack REFUTED: agents ARE on BSC IdentityRegistry (agent_id 56:0x8004a169…:341620 observed live).

#### Assumptions
- [ASSUMED] Mainnet gas (~$2 BNB) arrives when Dami wakes; until then all writes rehearse on testnet (Altana bounty explicitly accepts testnet).

#### Blockers for Downstream
- None hard. Soft: mainnet writes deferred to morning funding (see Downstream Items).

#### Key Decisions
- Winner Winnow: trust-graded marketplace (probe+Sybil-filter+recompute) + Altana session hire/revoke + 4 live reference agents + attest-on-probe (positive-only onchain). REMATCH vetoed as headline (authored baseline; health-factor no-counterfactual) — salvaged as TermiX report method. FOREMAN vetoed as specced — optional late showcase.
- Binding build obligations (de-facto-veto tripwires): full index w/ grade overlay (never probe-gated listings); cut list enforced; positive-only onchain attestations; non-sleeping host for Sep 9-23.

#### For Next Skill
- forge: read WINNER-BRIEF.md (Thesis + Non-Negotiables + Out-of-Scope are binding). Architecture must include: 8004scan paginated indexer + cache; probe engine (HTTP liveness vs published MCP/A2A endpoints) with background queue honoring 30 req/min; Sybil-cluster scoring offchain (method note published, no onchain accusations); ERC-8004 giveFeedback attestation writer (testnet first, mainnet runbook); Altana session grant/monitor/revoke UI (@altananetwork/sdk v0.9.0 pinned); 4 reference agents from Altana skills (PCS Liquidity=rebalancing, PCS Trading=grid, Venus=health-factor, Lista/Venus=yield); TermiX report generator from our agents' both-ways runs; Fly.io/paid host. PLAN THE AGENT ADVANTAGE REPORT FROM DAY ONE. ~11h to deadline: cut list is law.

### forge — 2026-09-09T02:05Z

#### Done
- Emergency-mode forge complete: winnow/PRD.md (compressed, all sections), winnow/ARCHITECTURE.md (881 lines, complete code for all core files, 24 sections incl. Integration Map), winnow/PLAN.md (7 phases C0-C6, gates, DT-1..DT-7), winnow/INVARIANTS.md (6 non-negotiables w/ judge-attack pairs, structural headline enforcement, 12 source-lock rows), .env.example + .input-manifest.json (lint PASS), FEATURE-OBSERVABLES.md (F-001..F-006).

#### Additions
- [NEW] Day-0 platform probe PROVEN on BSC testnet: register() → agentId 2287 (tx 0x9c127594fce179e231b52a97fdc170969138ae890df92a682bd7106be4157195); giveFeedback → tx 0xd40ae6873aa4ff58aa6efac1878374c130c5c23f5168ad6b54d50582435fbded; tokenURI read-back exact; **GOTCHA: getSummary REVERTS on empty clientAddresses**.
- [NEW] Stack locked: Next.js 14 + better-sqlite3 + viem + @altananetwork/sdk@0.9.0 on Fly.io (auto_stop=false for Sep 9-23), worker loops via instrumentation hook.

#### Deviations
- [SKILL] scope_mode=emergency (<1 build day): [MOCK-x402-SELL] cut-first; seed-agents/agent-advantage/mainnet-runbook are labeled spec-stubs for build to implement; boilerplate (tsconfig/globals.css) via create-next-app.
- [AUTO] Amplifier peer_perspective degraded rc=1 (Codex unreachable headless) — advisory, recorded, continued.

#### Verified Facts
- Registry round trip works from our wallet (txs above). All mainnet integration addresses code-checked (SOURCE LOCK table).

#### Assumptions
- [ASSUMED→DT-5] Altana grantSession session-key param naming — build checks SDK d.ts first; fallback DT-5b degrades to app-enforced caps w/ honest banner (Altana bounty at risk only in that branch).
- [ASSUMED→DT-7] VenusLens ABI shape + venus API fields — Aave getUserAccountData is the verified fallback.

#### Blockers for Downstream
- None hard. Mainnet funding remains Downstream D-1 (morning; DT-2 says submit as-is at 10:30 UTC if unfunded).

#### Key Decisions
- D-1..D-12 in INVARIANTS.md RESOLVED DECISIONS (host=Fly, DB=SQLite, testnet-first w/ mainnet runbook, server-held demo-operator custody w/ keys-off-host judge path).

#### For Next Skill
- critique: attack PRD/ARCHITECTURE/PLAN cold — key surfaces: DT-5 Altana param risk, index-completeness optics, TermiX report manual-leg integrity, 14-day worker durability, category-tagging heuristic honesty.
- build: PLAN.md is law; INVARIANTS.md is law; C0 franchise skeleton first; spike Altana hire path FIRST in C3 (30m box); npm --fetch-retries=5 everywhere; commit per task.

## Cross-Review

```json
{"reviewer":"claude","phase":"thesis-2","verdict":"DISAGREE","findings":[{"claim_id":"thesis-2","question":"Does the demo script witness the thesis DEMO OBLIGATION and does the primary flow equal the HERO FLOW? Answer PASS or FAIL only.","lead_answer":"PASS","reviewer_answer":"FAIL","reviewer_reasoning":"ARCHITECTURE.md contains no demo script section at all — the closest artifacts are the hero-flow UI (landing → category → agent detail with re-probe/activate/revoke) and §21's 'P1 demo deliverable (index+grades+hero flow)'. Checked against the WINNER-BRIEF DEMO OBLIGATION (warroom/WINNER-BRIEF.md:35): (a) live re-probe with visible rank update is covered (api/reprobe + 'Re-probe now' button updating the stored grade); (b) onchain liveness attestation tx is covered (attestor.ts giveFeedback with tx links in UI/proof page); but (c) is NOT witnessed: the obligation requires a 1-click ONCHAIN revoke and an over-cap attempt visibly reverting, yet the architecture's revoke() (src/lib/altana.ts) only sets the DB row to status='revoked' with revoke_tx='pending' — the actual onchain revocation path is explicitly [UNVERIFIED] (DT-5 fallback), and no component, route, script, or demo step anywhere in the file stages or demonstrates an over-cap spend attempt reverting. The primary flow does substantially equal the HERO FLOW (Land → category tiles → graded compare via AgentCard/GradeBadge → Activate with 0.005 BNB cap → Recent actions from real mainnet DeFi reads → 'Fire (revoke)' button), but since the demo-obligation half of the conjunctive claim fails — no demo script exists and obligation (c) is unwitnessed — the overall answer is FAIL.","match":false,"resolution_note":"Resolve the claim from canonical inputs before acceptance."}],"resolved":false}
```

## Cross-Review

```json
{"reviewer":"claude","phase":"thesis-2","verdict":"AGREE","findings":[{"claim_id":"thesis-2","question":"Does the demo script witness the thesis DEMO OBLIGATION and does the primary flow equal the HERO FLOW? Answer PASS or FAIL only.","lead_answer":"PASS","reviewer_answer":"PASS","reviewer_reasoning":"The PRD's Demo Script (winnow/PRD.md §6) witnesses all three parts of the thesis DEMO OBLIGATION from warroom/WINNER-BRIEF.md:35: (a) 0:50–1:20 shows 'Re-probe now' running a live probe with the grade timestamp updating (grade recomputed live); (b) 1:20–1:50 shows the attestation tx on BscScan plus a third-party 8004 reader (liveness attestation tx landing onchain); (c) 1:50–2:30 shows activation with a $10/day spend cap and a real DeFi action through the Altana session (c1), and 2:30–3:00 shows the 1-click revocation tx killing the Keystore key and an over-cap attempt reverting (c2). Each scene is explicitly tagged with its obligation letter. The PRD's primary flow (User Flow 1, marked 'HERO FLOW = flow 1' and 'Hire (hero)' at winnow/PRD.md:35-36) equals the brief's HERO FLOW at WINNER-BRIEF.md:36 step-for-step: Land → pick category → ranked graded list (compare graded agents) → open agent with vitals/liveness/onchain history (live vitals + onchain track record) → Activate with cap $/day (activate with a spend cap) → agent visibly working with its txs streaming (watch it act on real DeFi state) → Revoke in 1 tx (revoke in one click). ARCHITECTURE.md corroborates: real onchain revocation and over-cap revert are implemented for obligations c1/c2 (lines 392, 400) and the hero flow is the P1 demo deliverable (line 882).","match":true,"resolution_note":"Weak-positive convergence; not proof."}],"resolved":false}
```

## Cross-Review

```json
{"reviewer":"claude","phase":"thesis-2","verdict":"AGREE","findings":[{"claim_id":"thesis-2","question":"Does the demo script witness the thesis DEMO OBLIGATION and does the primary flow equal the HERO FLOW? Answer PASS or FAIL only.","lead_answer":"PASS","reviewer_answer":"PASS","reviewer_reasoning":"The thesis DEMO OBLIGATION in warroom/WINNER-BRIEF.md:35 requires the judge to witness (a) a live grade recompute via re-probe with visible rank/grade update, (b) a liveness attestation tx landing onchain, and (c) a hire through a spend-capped Altana session with 1-click onchain revoke plus an over-cap attempt reverting. The demo script in winnow/PRD.md §6 explicitly satisfies all of these: 0:50–1:20 'Re-probe now → live transcript streams → grade timestamp updates' is tagged (obligation a); 1:20–1:50 'attestation → BscScan tx in view; third-party 8004 reader shows the same feedback' is tagged (obligation b); 1:50–2:30 'set $10/day cap, 24h expiry → session grant tx → agent executes a real DeFi action' is tagged (obligation c1); 2:30–3:00 'one click → revocation tx → Keystore key dead; over-cap attempt shown reverting' is tagged (obligation c2). The HERO FLOW in WINNER-BRIEF.md:36 (Land → pick category → compare graded agents with live vitals + onchain track record → activate with spend cap → watch it act on real DeFi state → revoke in one click) equals PRD.md §3 flow 1, marked 'HERO FLOW = flow 1' and 'Hire (hero)': Land → pick category → ranked graded list → open agent (vitals: liveness, grade breakdown, evidence links, onchain history) → Activate (cap $/day + expiry, session granted onchain) → agent visible working (txs stream) → Revoke (1 tx). Each stage corresponds one-to-one, and ARCHITECTURE.md is consistent (hero flow as P1 demo deliverable, over-cap revert and real onchain revocation implementing obligations c1/c2). Both conditions hold.","match":true,"resolution_note":"Weak-positive convergence; not proof."}],"resolved":false}
```
