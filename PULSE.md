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
| D-2 | forge | package | MED | PRD.md has 37 em-dash/voice-pattern hits (internal doc) — ensure ZERO banned patterns in user-facing copy (README, submission description, demo VO) per Dami no-em-dash rule | grep -c em-dash on shipped copy = 0 | open |
| D-1 | warroom | deploy | HIGH | Fund 0xc211C942946011859ca634F22400d80570ED12A5 with ~0.01 BNB on BSC mainnet (Dami, morning) then run mainnet attestation+session runbook | mainnet txs visible on BscScan + Altana explorer | open |
| DH-1 | debug | wire | P1 | KNOWN-RISKS handoff: DEV-302/502 — all API keys credit-dry; local runs use `claude -p` CLI (proven live in debug); Fly has no CLI | wire proves a working LLM provider on the deploy host (funded key or AltLLM) OR verifies skip-and-log path + honest banner renders | done-with-note |
| W-1 | wire | deploy | P1 | No dedicated "LLM degraded" UI banner — if Fly runs without funded key, agent staleness only visible via action timestamps; land funded ANTHROPIC key (D-3) or add honest degraded banner | Fly either reasons live or renders explicit degraded state | open |
| DH-2 | debug | wire | P1 | KNOWN-RISKS handoff: reference agents' a2a_endpoints point at localhost:3000 (testnet ids 2288-2291) — dead from any public URL | deploy rewrites endpoints to Fly URL + scripts/regrade-refs.mts re-probes; wire proves cards reachable publicly and grades stay honest (C, not F) | mechanism-verified |
| DH-3 | debug | verify_milestone | P1 | KNOWN-RISKS handoff (from critique): "testnet-first vs LIVE on BSC" eligibility drift — recheck demo-path chain labels after DT-2 mainnet runbook runs (or doesn't) | demo path shows honest chain labels; if unfunded at 10:30 UTC, submit-as-is branch documented | done |
| DH-4 | debug | stress_test | P2 | KNOWN-RISKS handoff: test:source ratio 0.13 (5 aggregate test files / 39 sources) — edge/boundary coverage thin (grade formula bounds, probe malformed responses, api fuzz) | stress plan covers grade/probe/api edge classes; failures triaged | open |
| DH-5 | debug | stress_test | P2 | AI-agent edge classes (AgentAuditor): infinite loop, tool hallucination, cost blowup (LLM tick every 120s ×4 agents), prompt injection via external market-data strings, concurrent state, context overflow, per-instance config isolation | stress executes each class against worker strategies + reason() fallback chain | open |
| DH-6 | debug | wire | P2 | KNOWN-RISKS handoff: paced() retry-once proven via stubbed fetch only (deterministic 5xx not triggerable on demand) | wire observes real 8004scan calls under live budget (indexer ticking, budget counter sane, no double-burn) | done |
| DH-7 | debug | stress_test | P3 | Duplicate-name agent floods (e.g. "Ave.ai Trading Agent" ×100+ graded F fills search pages) — ranking/search behavior under name spam | search for a flooded name still surfaces distinct agents; no page dead-ends | open |
| DH-8 | debug | verify_milestone | P2 | Landing counter honesty: withEndpoints=5 while index at 19,307/310K and growing — ensure copy never implies full-registry endpoint coverage | counters + copy consistent with MUST-NOT-CLAIM rows at demo time | done-with-note |
| V-1 | verify_milestone | deploy | P2 | Counter optics: "Probed" counts grades incl zero-network fastgrades; "Declared endpoints: 5" low because 8004scan LIST payload lacks endpoint fields — relabel to "Graded" or split endpoint-probed vs fast-graded before demo; regenerate proof.md on VM (counters stale at 12,707) | landing counters unambiguous to a judge; proof.md counters current | open |

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

### critique — 2026-09-09T03:45Z

#### Done
- Full critique in autonomous emergency mode (~8.5h to deadline, 4–12h adaptation). Verdict **PROCEED**. Positioning: differentiated (saturated 20+ field; concrete demo-witnessable differentiator on the Data Quality criterion). Narrative: compelling. All 6 win-legibility axes strong. CRITIQUE-REPORT.md + .critique-state.json written; PRD/ARCHITECTURE/PLAN updated (winnow/ + root copies synced).

#### Additions
- [NEW] ARCH bug found+fixed: activateAgent never persisted kv session_handle_{id} (lived in a detached comment) — revoke() and demonstrateOverCap() (demo obligation c2) would throw on a copy-verbatim build. Now atomic inside activateAgent + GATE C3 check (E-4).
- [NEW] Probe engine burned one 8004scan call per probe → probe throughput silently coupled to the 900/day scan budget; 96% endpoint-less agents were never worker-graded. Fixed: refresh only for unindexed rows + new fastgrader worker lane (zero-network shell grading, 25/30s) (E-2).

#### Deviations
- [AUTO] Phase 2 peer cross-review degraded: crossmodel helper invocation failed on macOS (`timeout` not found) — advisory, recorded, continued.
- [AUTO] Copilot/Grid enrichment skipped (no PAT; Solana-centric corpus) — roster audit substituted, same as intel.
- [SKILL] Narrative phase compressed per 4–12h time adaptation (onboarding friction tests still run: 10s/30s/60s all PASS).

#### Verified Facts
- Drift scan: "We grade all of them" (landing/metadata/demo VO) violated our own MUST-NOT-CLAIM row 1 → E-1 applied (present-progressive + live probed counter). AC-2 ≤15s was numerically false pre-E-2 (worst case ~29s), true post-E-2 (≤12s).

#### Assumptions
- [ASSUMED] Testnet-first reference agents acceptable at submit-as-is cut (10:30 UTC) — acknowledged drift with honest chain labels; mainnet funding remains the top attackable surface vs SmartSentinels' mainnet fleet.

#### Blockers for Downstream
- None hard. D-1 mainnet funding urgency RAISED: treat as P0 eligibility hedge when Dami wakes (existing Downstream row stands).

#### Key Decisions
- [SKILL][AUTO] Approved E-1 (honest copy), E-2 (budget decoupling + fastgrader lane), E-3 (TermiX rubric fields: price+speed-vs-alternative line; trading window/quality/risk trio), E-4 (session-handle persistence) — all quick/none, applied to PRD+ARCH+PLAN with [CRITIQUE E-N] tags. [AUTO] Deferred E-5 (ERC-8183 hire path, medium effort) — build ONLY if C5 finishes early. No thesis amendment required (E-1/E-2 compatible; fastgrader makes "grades the whole registry" converge to true).

#### For Next Skill
- build: PLAN.md updated in place — new gate items: T2.1 zero-scan-call re-probe check, T3.2 fastgrader lane (+100 probed during 5-min run), GATE C3 kv session_handle_{id} exists post-activation, T4.2 grep "grade all" = 0, GATE C5 TermiX rubric fields. ARCH §7/§10/§12/§14 changed — copy the UPDATED code. E-5 is the only sanctioned stretch item.
- verify_milestone: recheck drift item "testnet-first vs LIVE on BSC" after DT-2 runs (or doesn't).

### debug — 2026-09-09T06:45Z

#### Done
- Full 6-phase gate, autonomous. Baseline green (1 TEST-BUG fixed: INVARIANT-3 assertion made data-robust). 7 KNOWN-RISKS dispositioned; all PLAN TEST MATRIX rows executed incl. live overcap (session 5 intact) + real dead-endpoint probe. Security: 0 CRIT/HIGH, 1 MED fixed (revoke rate limit). Senior critique 5 MUST-FIX → 4 fixed + 1 delegated (DH-2); 5 SHOULD-FIX fixed. Confidence **90**, PROCEED. 2 commits.

#### Additions
- [NEW] Fixes landed: paced() retry-once (DEV-006, 4-check test); gridTick "Risk:" line (DEV-503, verified via live `claude -p` tick); worker single-instance pidfile lock w/ stale-pid takeover (C3, kill -9 test); farm-pattern wording → "insufficient independently-validated feedback" + 2 honest re-probes (0 old-wording grades remain); detail-route chain-collision filters (actions/sessions/trackScore); prober lane now covers a2a-only agents; overcap only records SpendLimit-class reverts as proof; activate cooldown not burned on failure + honest response labels; detail-page break-words + cap shown in BNB; landing "Most are shells." → "Most never answer a probe.".
- [NEW] INVARIANT 5 witnessed live in debug: overcap-demo on session 5 → ExceededSpendLimit revert, session NOT revoked.

#### Deviations
- [SKILL] paced() retry proven via stubbed fetch (deterministic 5xx untriggerable) — real-path to wire (DH-6).
- [SKILL] Remaining SHOULD-FIX (next/link, Safari date parse) + NOTEs deferred under time pressure — in critique files.

#### Verified Facts
- Index grew 19,307→28,007 / probed 758→1,333 during debug (F-001 witnessed); verify-claims orphans 0, negatives 0 throughout.
- AC-1: 8/8 pages 200 cold, no wallet. AC-2: reprobe 2.3s. `.env` NOT git-tracked (verified ls-files -s + history).

#### Assumptions
- [ASSUMED] Demo recording runs against localhost OR post-rewrite Fly URL — reference agents' a2a endpoints are localhost-bound until deploy runs regrade-refs (DH-2, P1).

#### Blockers for Downstream
- None hard. D-1 (mainnet BNB) + D-3 (funded LLM key for Fly) remain morning items.

#### Key Decisions
- [AUTO] M2 (localhost a2a endpoints) delegated not patched — correct fix is deploy-time URL rewrite + re-probe; localhost recording works today.

#### For Next Skill
- wire: action DH-1/DH-2/DH-6 (P1s first). Session 5 live for demos — do NOT revoke it; overcap-demo has 60s/session cooldown, revoke now 10s cooldown. Worker pidfile lock means only ONE worker (Next instrumentation) — run-worker.mts will refuse while the server runs (by design).
- verify_milestone: DH-3 chain-label drift + DH-8 counter honesty; activate response shape changed (sessionId/wallet/agentWallet/grantTx) — update any consumer expectations.

### wire — 2026-09-09T05:20Z

#### Done
- Full 6-phase wire, autonomous. **WIRED-WITH-DEGRADATION** — 11 connections: 9 PASS / 1 PARTIAL (Anthropic) / 1 SKIPPED (Fly, deploy-owned). 0 failures, 0 fixes needed, 0 sentinel hits, 0 mock flags. WIRE-REPORT.md + .wire-state.json written. Dev server started and killed cleanly (port 3000 clear, pidfile released).

#### Additions
- [NEW] F-003 witnessed with a NEW real attestation: giveFeedback(2288, "liveness", 32 — measured from probe_log 462) → tx 0xd09508a9d8efb27b22000e645d7977ad54831f4614647f5ad3df6518f6e22280, receipt status 0x1, block 129965336, attestations row 3, signed by ATTESTOR2 (own-agent path exercised live).
- [NEW] F-004 witnessed: Keystore isValidKey(session 5) = true (live testnet read) + overcap-demo → reverted:true ExceededSpendLimit, session 5 STILL LIVE (not revoked).
- [NEW] Live probe of OpenOdds 56/49637 via POST /api/reprobe: probeLogId 1423, mcp_initialize HTTP 200 + a2a_card ok, honest C/59, 3.0s.
- [NEW] Index grew 29,007→33,207 agents DURING wire (F-001); scan_budget counter sane (369/900 day); verify-claims exit 0 (orphanGrades 0, negativeAttestations 0 — F-002).
- [NEW] Evidence scripts kept: scripts/wire-keycheck.mts, wire-attest.mts, wire-tick.mts (reproducible).

#### Deviations
- [SKILL] app→Fly connection SKIPPED (deploy-phase owned); local /api/stats 200 stand-in per Integration Map health check.
- [AUTO] /api/activate not re-run (would burn a real session grant + cooldown); debug already proved the flow. Latency marked NOT-TESTED (~8s est).

#### Verified Facts
- BSC RPCs live (testnet block 0x7bf1b4c, mainnet 0x733916f); Aave getUserAccountData(WATCH_ADDR) real (HF 1.3349, debt $28.8k); PCS slot0 live tick; VenusLens has code; Venus API real data. 8004scan list+detail+feedbacks all real payloads.
- Anthropic API key credit-dry (400) → `claude -p` CLI fallback returned REAL haiku reasoning in 12.9s (DEV-302 confirmed; Fly will run LLM-degraded without funded key).
- API route contracts: /api/agents takes `cat=` (not `category=`); /api/reprobe takes `{chain,id}` (not chainId/tokenId) — downstream consumers take note.
- testnet.bscscan.com returns 403 to curl (Cloudflare) — tx links must be browser-verified before demo; RPC receipts are the authoritative proof.

#### Assumptions
- [ASSUMED] Unauthenticated mutating endpoints (activate/revoke/reprobe/overcap) are BY DESIGN (walletless judge path AC-1, server-held custody D-12, cooldowns 20-60s) — not flagged as AUTH-GAP; residual operator-gas-spend risk routed to stress.

#### Blockers for Downstream
- None hard. Degradations: (1) DEV-302/D-3 LLM on Fly, (2) DH-2 localhost a2a endpoints until deploy rewrite, (3) D-1 mainnet unfunded.

#### Key Decisions
- [AUTO] Status WIRED-WITH-DEGRADATION (not WIRED): declared Anthropic API path strictly failed (credit-dry) and its working fallback does not exist on the deploy host — honest label per DEV-302.
- [AUTO] DH-1 → done-with-note (provider + skip-and-log proven; no dedicated degraded banner → new row W-1, owner deploy). DH-2 → mechanism-verified. DH-6 → done.

#### For Next Skill
- verify_milestone: Step 3 demo path — session 5 LIVE, do NOT revoke; cooldowns: overcap 60s/session, reprobe 20s/agent, activate 60s global. Wait guidance: reprobe ~3s, overcap ~4s, attest ~6s, LLM tick ~13s (SLOW — spinner/wait marker). DH-3 + DH-8 are yours. API params: `cat=`, `{chain,id}`.
- deploy: W-1 (funded LLM key or degraded banner), DH-2 rewrite + scripts/regrade-refs.mts, D-1 mainnet funding, keep host awake Sep 9-23.

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

## Cross-Review

```json
{"reviewer":"claude","phase":"positioning","verdict":"AGREE","findings":[{"claim_id":"positioning","question":"Is Winnow meaningfully differentiated from the documented competitor field (Marque, KaizenScope, AgentEra, SmartSentinels, 8004scan/RNWY incumbents) on the judged axes? Answer PASS or FAIL only.","lead_answer":"PASS","reviewer_answer":"PASS","reviewer_reasoning":"The three canonical documents establish meaningful differentiation on the judged axes. The research brief (research/research-brief.md) documents each competitor's strengths precisely — Marque (conformance tests, spend-capped 'charters', mainnet PCS receipts), KaizenScope (verification-gated payment, 66 agents probed), AgentEra (full bounty stack, TermiX report with 40.6x/163x/604x claims), SmartSentinels (mainnet agents in all 4 categories), and incumbents 8004scan/RNWY (registry explorers with static scores) — and identifies the whitespace: nobody owns data quality at scale (Sybil-filtered reputation + verified endpoints + receipts), which is explicitly a named judging criterion. Winnow's PRD competitive table shows capabilities absent from both incumbents: live re-probe at view time, recomputable evidence per number (probe transcript FK + verify script), onchain write-back via giveFeedback attestations, and in-product Keystore-enforced capped hiring with 1-click revoke. Against the hackathon field, no single competitor combines these: KaizenScope probes but doesn't recompute or write back; Marque's charters are bespoke vs Winnow's canonical-Keystore-enforced sessions with a live over-cap-revert demo; AgentEra's unbounded multiplier claims are countered by Winnow's honest-window framing; SmartSentinels' mainnet edge is a documented gap (testnet-first writes) but is honestly labeled with a funding runbook, and is a deployment posture rather than an axis-level capability gap. The critique report's own adversarial pass — overlap zones, drift scan, roster audit of 20+ repos — reaches 'differentiated' (not 'unique') with the differentiator concrete, demo-witnessable ('re-verify this number in front of me'), and mapped 1:1 to the published judging criteria. The differentiation is substantiated per-competitor rather than asserted, so the claim holds.","match":true,"resolution_note":"Weak-positive convergence; not proof."}],"resolved":false}
```

### build — 2026-09-09T05:45Z

#### Done
- C0-C5 complete via 5 implementation subagents, orchestrator-verified each: scaffold+franchise skeleton+CI → indexer (18K+ agents live-growing) → probe/grade/attestor → Altana sessions + 4 reference agents + worker → API+UI hero flow → proof + TermiX report. 15+ commits.

#### Additions
- [NEW] ONCHAIN SESSION LIFECYCLE PROVEN: grant 0xb4433aee… → in-cap exec 0xe22694b9… → over-cap REVERT ExceededSpendLimit → revoke 0x98660860… → isValidKey false. Demo session #5 LIVE (0.005 BNB/24h, grant 0x56918568…).
- [NEW] Reference agents (testnet ERC-8004 ids 2288-2291) serve REAL A2A cards at /api/a2a/{name} → honestly graded C (a2a_card probe passes). Deploy must rewrite endpoints to Fly URL + re-probe (scripts/regrade-refs.mts).
- [NEW] ATTESTOR2 second signer 0x5e6cBAb6… (funded 0.01 tBNB) — own-agent attestation path real (tx 0x43980a03…).
- [NEW] submission/proof.md + submission/AGENT-ADVANTAGE-REPORT.md generated from real runs.

#### Deviations
- [SKILL] DEV-302/502 (DEGRADED): ALL Anthropic API keys credit-dry — agent reasoning via local `claude -p` CLI (real haiku output). FLY DEPLOY runs LLM-degraded (skip-and-log) until a funded key lands (Downstream D-3).
- [SKILL] DEV-303/304/305: Altana reality vs ARCH — param is `sessionSigner`; relay requires explicit call targets; fresh session key per grant. All handled in code.
- [SKILL] DEV-501: TermiX manual legs are operator-tooling lower bounds (honest label); manual beat agent on raw seconds for 2 tasks — report reframes advantage as cost+cadence, deliberately candid.

#### Verified Facts
- verify-claims green at every gate (orphanGrades 0, negativeAttestations 0). typecheck/build clean. Curls 200 on all pages. Reprobe live ~4s + 429 cooldown works.

#### Assumptions
- [ASSUMED] Fly deploy will succeed with Dockerfile as written (docker build check running; DT-4 fallbacks ready).

#### Blockers for Downstream
- None hard. deploy: needs flyctl auth + rewrite a2a endpoints + re-run proof on VM. D-3 (LLM key) and D-1 (mainnet BNB) remain morning items.

#### Key Decisions
- Reference agents' honesty: graded by the same probe engine as everyone (now C via real cards, F before) — eats-own-dogfood is the demo story, not a weakness.

#### For Next Skill
- debug: known risks = paced() retry-once (DEV-006); gridTick prompt lacks risk-statement line (DEV-503); OpenOdds feedback=6 farm-branch (heuristic as specified — verify wording in UI is non-accusatory); worker pidfile collision (fixed by clean rerun — confirm single-instance guard); test suite = npm run test:unit + test:api + verify.

## Cross-Review

```json
{"reviewer":"claude","phase":"verify-observables","verdict":"AGREE","findings":[{"claim_id":"verify-observables","question":"Using only each p0_features item's command, exit_code, sentinel, and observed fields, derive one canonical status: NOT-BUILT if the command failed or observed says the implementation is absent; BUILT-UNTESTED if exit_code is 0 but sentinel matches observed mock/fallback evidence; otherwise BUILT-AND-TESTED when exit_code is 0 and no sentinel matches. If there are zero p0_features answer FAIL. Otherwise answer PASS iff BUILT-AND-TESTED / total p0_features is at least 0.80; else FAIL. Answer exactly PASS or FAIL.","lead_answer":"PASS","reviewer_answer":"PASS","reviewer_reasoning":"VERIFY-OBSERVABLE-EVIDENCE.json contains 7 p0_features, all with exit_code 0 and no observed absence of implementation. Checking each sentinel against observed: (1) indexed grew 34407→38307, not static at seed-size — no match; (2) grade has probeLogId 1774 and transcript checks, not orphaned — no match; (3) verify-claims exited 0 with orphanGrades:0 — no match; (4) all 3 receipts status 0x1 and attestation values 12,7,32 ≥0 — no match; (5) overcap reverted on-chain with ExceededSpendLimit and keystore state consistent — no match; (6) sentinel regex /(unavailable|fallback|mock)/i has one lexical hit on 'fallback', but observed explicitly states it is genuine analytical use within substantive reasoning, not mock/fallback evidence — not a sentinel match on mock/fallback evidence; (7) epoch-derived wall-clocks and both legs present, no simulated timings — no match. That yields 7/7 BUILT-AND-TESTED (1.00 ≥ 0.80). Even under the strictest reading where feature 6 counts as BUILT-UNTESTED due to the literal 'fallback' hit, the ratio is 6/7 ≈ 0.857, still ≥ 0.80. Either way the threshold is met, so the answer is PASS.","match":true,"resolution_note":"Weak-positive convergence; not proof."}],"resolved":false}
```

### verify_milestone — 2026-09-09T07:00Z

#### Done
- Milestone gate, autonomous, evidence-first (every check re-run live, not read from reports). **Decision: PROCEED.** Observables 6/6 STRONG (100). THESIS-1..5 all PASS. Critique elevations E-1..E-4 4/4 implemented (E-5 sanctioned deferral). P0 7/7 BUILT-AND-TESTED; blind cross-review verify-observables AGREE (event 175e9855). VERIFY-REPORT.md + .verify-state.json + docs/pipeline/claims.json (10 rows) written.

#### Additions
- [NEW] Live re-witnessed this run: reprobe 56/49637 → C/59 probeLogId 1774 in 6.7s; overcap-demo session 5 → ExceededSpendLimit revert 7.9s, session STILL VALID; all 3 attestation receipts recomputed status 0x1 via testnet RPC; isValidKey(session5)=true; index 34,407→38,307 during the run; verify-claims exit 0 throughout.
- [NEW] F-005 sentinel regex hit is a FALSE POSITIVE: "vFDUSD is the fallback if vUSDT pools tighten" is genuine analytical reasoning — do not "fix".

#### Deviations
- [SKILL] VF Recompute Sampling: PULSE VFs are legacy-format (no 4-state entries) → sampled 0 per protocol; substituted 6 voluntary recomputes, all passed. Future skills should emit 4-state VF lines.
- [SKILL] Prereq gate: wire status complete_with_blockers accepted as complete (verdict pass_with_blockers, 0 failures).
- [AUTO] /api/activate not re-run (burns a real grant + cooldown); debug+build receipts stand.

#### Verified Facts
- Chain labels honest end-to-end (DH-3): per-row BSC vs BSC-testnet + correct explorer hosts; proof.md header states write-side chain.
- Landing counters DB-derived and honest (DH-8); E-1 sanctioned wording in place; "grade all" grep clean.
- Agent CLI fallback works standalone (exact call, 7.9s, model claude-haiku-4-5-20251001) but NO new agent_action landed during the ~30min verify window (CLI contention with the verify session itself) — cadence rides on D-3.

#### Assumptions
- [ASSUMED] 38K surfaced index agents (BSC mainnet, chain 56) satisfy "agents live on BSC" eligibility; testnet reference agents honestly labeled, mainnet upgrade via D-1 runbook.

#### Blockers for Downstream
- None hard. Deadline-critical path: deploy (public accessibility Sep 9-23 = eligibility) + submission draft (KZ-2 warn: NO draft yet, deadline 12:00Z).

#### Key Decisions
- [AUTO] DH-3 → done; DH-8 → done-with-note (new row V-1, owner deploy, counter relabel + proof.md regen).

#### For Next Skill
- design_forge: do NOT touch honesty wording (E-1 line, "insufficient independently-validated feedback", chain labels) — verified compliant. Session 5 LIVE, do not revoke. Cooldowns: overcap 60s/session, reprobe 20s/agent, activate 60s global.
- stress_test: DH-4/DH-5/DH-7 are yours. API params: `cat=`, `{chain,id}`.
- deploy: V-1 + W-1 + DH-2 + D-1; regenerate proof.md on VM; keep host awake Sep 9-23.

### design_forge — 2026-09-09T06:55Z

#### Done
- Formalize: winnow-app/DESIGN_SYSTEM.md + brand.json extracted from shipped code (zinc-950 base, single emerald hue, Geist Sans/Mono, radius 4/6/8, pure-glow shadow philosophy). DESIGN_BRIEF.md identity gate consumed [AUTO].
- Craft floor to zero: audit.js 30 files, 0 violations. CF-1 radius tokens in :root; CF-2 card/well elevation ladder; CF-3 nav glass inset highlight; CF-4 hover translateY(-1px)+glow inside @media(hover:hover), focus-visible app-wide; CF-6 hero clamp(); .tnum tabular-nums.
- Landing signature moment: Counter.tsx (rAF tick-up to real /api/stats values, reduced-motion safe), pulsing live dot, category tiles carry real gradedByCat counts (new honest SQL in /api/stats).
- Agent detail: grade breakdown promoted to hero card with 4 meters (liveness/meta/feedback/track, aria roles), transcript stays as evidence drawer (.well), live-session panel shows spend cap (mono) + time-remaining meter. Category loading.tsx skeleton added.
- Em-dash sweep across UI copy only (title now "Winnow: the ..."); verified honesty wording in lib/ untouched per verify_milestone directive; session 5 not touched.
- Gates: tsc clean, next build clean, curls 200 on / /c/health-factor /agent/56/49637 /proof, server killed after. 4 desktop screenshots in winnow-app/screenshots/. Commits c444513 + follow-up in winnow-app repo.

#### Deviations
- [AUTO] logo_forge SKIPPED (50-min hard box per dispatch; existing favicon ships). Amplifier peer-perspective SKIPPED (advisory, time box). Persona critique not spawned; mobile screenshots not captured.
- [SKILL] audit.js Rule 23 hover check is a false positive by construction (negative lookbehind cannot cross the media query brace); satisfied via equivalent :is(.card-hover:hover) selector.

#### Blockers for Downstream
- None hard.

## Downstream Items
| P | Owner | Item |
|---|---|---|
| P2 | verify_preflight | design amplifier peer-perspective + persona critique skipped under time box; PERSPECTIVE-RESPONSE-design.json absent (advisory only) |
| P3 | package | no generated logo; favicon.ico only. Generate logo.svg/png if time allows |

#### For Next Skill
- stress_test: new surfaces = /api/stats gradedByCat map, Counter component, grade meters, session time-remaining meter, /c/[cat]/loading.tsx.
- deploy: brand.json + DESIGN_SYSTEM.md live in winnow-app/ for demo-video/README consumption; screenshots/ has fresh 1440px captures of all 4 pages.
