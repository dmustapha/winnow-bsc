# PRD — Winnow
## [EMERGENCY MODE — compressed scope; mocked/deferred components labeled inline]

**One-liner:** The trust-graded agent marketplace for BSC — every number recomputable, every hire inside a spend-capped revocable session.
**Hackathon:** BNB Chain Build the Era — Smart Money Era | Track: Main + Altana + TermiX + PancakeSwap | **Deadline: 2026-09-09 12:00 UTC**
**Thesis framing (WINNING ARGUMENT):** In a field of 20+ look-alike directories over a registry that is 96% shells, the adoptable marketplace is the one whose every number can be re-verified live — Winnow grades the whole registry with recomputable probes, writes verified liveness back onchain, and lets anyone hire a graded agent inside a spend-capped, one-click-revocable session.
**Problem + shocking number:** 310,215 agents registered on BSC; ~4% declare a live endpoint; 59.2% of reviewers Sybil-coordinated; 77.9% of rated agents have zero valid feedback (arXiv 2606.26028). Burned agents outrank live ones in today's search.
**Why this wins:** Data Quality (recomputable trust data nobody else ships) × Functionality (zero-dead-end hire journey) × Agent Diversity (category-agnostic grading + 1 live agent per category).

## 1. Emergency Mode Notice
Deferred/mocked (labeled through all docs): [MOCK-x402-SELL] paid grade API (cut-first tier); [DEFERRED-MAINNET] attestations + agent actions run testnet tonight, mainnet via morning runbook (D-12); [MOCK-SYBIL-DEPTH] Sybil filter is a published-method heuristic, not arXiv-grade clustering (labeled in UI method note).

## 2. System Overview
```
                      ┌────────────────────────────────────────────┐
                      │ Next.js 14 (Fly.io, single container)      │
  8004scan API ──────▶│ indexer (30/min pace) ─▶ SQLite (/data)    │
  BSC RPC (viem) ────▶│ probe engine ─▶ grades (FK probe_log)      │◀── judge browser
  MCP/A2A endpoints ─▶│ attestor ─▶ giveFeedback (ERC-8004 Rep)    │
                      │ worker: 4 reference agents (Altana sessions│
                      │  + strategies vs PCS/Venus live data)      │
                      └────────────────────────────────────────────┘
```
| Component | Type | Purpose |
|---|---|---|
| indexer | worker job | paginated 8004scan pull → SQLite `agents` (full 310K, growing; honest counters) |
| probe-engine | worker job + on-demand API | live-test MCP/A2A endpoints, metadata, feedback validity → grade with raw transcript |
| grades | data layer | A–F letter grade; grade row REQUIRES probe_log FK (structural honesty) |
| attestor | service | writes positive/neutral liveness attestations via `giveFeedback` (testnet→mainnet) |
| session-layer | service + UI | Altana grantSession (cap/allowlist/expiry) = Activate; revokeSession = Fire; live Keystore reads |
| reference-agents ×4 | worker loops | rebalancer (PCS v3), grid (PCS), yield (Venus/Lista APR), health (VenusLens) — real onchain actions via their sessions |
| web UI | Next.js pages | land → categories → compare → agent detail → activate → monitor → revoke |
| advantage-report | script | TermiX report: 3 tasks both ways w/ receipts |

## 3. User Flows (HERO FLOW = flow 1)
1. **Hire (hero):** Land → pick category (4 tiles) → ranked graded list → open agent (vitals: liveness, grade breakdown, evidence links, onchain history) → Activate (choose cap $/day + expiry → session granted onchain) → agent visible "working" (its txs stream) → Revoke (1 tx) → Keystore shows dead key.
2. **Recompute:** any grade → "Re-probe now" → live probe runs → transcript shown → stored grade updates (snapshot semantics, timestamped).
3. **Verify onchain:** agent detail → attestation link → BscScan tx + any third-party 8004 reader.
4. **Browse honesty:** ungraded agents listed with "not yet probed" state; global counters (indexed/probed/verified-live) always visible.
5. Error paths: dead endpoint → grade F w/ evidence, hire disabled with explanation; RPC down → cached data w/ staleness banner; probe timeout → "unreachable (timed out 5s)" verdict (that IS a result).

## 4/5. Component Specs + External APIs (emergency-merged)
- **8004scan** `api.8004scan.io/api/v1` — GET /agents?chain_id=56&limit=100&cursor=…; GET /agents/56/{id}; GET /feedbacks?chain_id=56. No auth; 30 req/min, 1000/day cap → indexer paces 1 req/2.2s, daily-budget aware; risk: R-6.
- **BSC RPC** bsc-dataseed.bnbchain.org (+publicnode fallback), testnet data-seed-prebsc-1-s1; Multicall3 0xcA11bde05977b3631167028862bE2a173976CA11.
- **ERC-8004** Identity 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 / Reputation 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 (testnet: 0x8004A818BFB912233c491871b3d84c89A494BD9e / 0x8004B663056A597Dffe9eCcC1965A193B7388713). Signatures [VERIFIED via EIP + live probe]: `register(string)`, `tokenURI(uint256)`, `giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)`, `getSummary(uint256,address[],string,string)` — **GOTCHA (probe-proven): getSummary reverts on empty clientAddresses**.
- **Altana SDK** @altananetwork/sdk@0.9.0 [VERIFIED installs+exports]: createClient/createWallet/grantSession/execute/revokeSession; Keystore BSC 0x6572427E… / testnet 0x6b8361C2…; hireErc8183Agent (bonus path).
- **VenusLens** 0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA getAccountLimits → shortfall; **Aave v3 Pool** 0x6807dc923806fE8Fd134338EABCA509979a7e0cB getUserAccountData; **PCS v3** NPM 0x46A15B0b27311cedF172AB29E4f4766fbE7F4364, Quoter 0xB048Bbc1…, Factory 0x0BFbCF9f… [all VERIFIED code-on-chain].
- **Anthropic API** (agent reasoning text) — claude-haiku; AltLLM optional fallback.

## 6. Demo Script (3:00) — satisfies DEMO OBLIGATION (a)(b)(c)
- 0:00–0:20 [Land] Hero: "310,215 agents. ~4% alive. We're grading every one." Live counters (probed count visible). VO: direct, no buzzwords. <!-- [CRITIQUE E-1] present-progressive; never "we grade all of them" (MUST-NOT-CLAIM) -->
- 0:20–0:50 [Category → list] Health Factor Monitoring tile → graded list; a shell agent sits at F with evidence link.
- 0:50–1:20 [Recompute] Click A-grade agent → "Re-probe now" → live transcript streams → grade timestamp updates. **(obligation a)**
- 1:20–1:50 [Onchain] Click its attestation → BscScan tx in view; third-party 8004 reader shows the same feedback. **(obligation b)**
- 1:50–2:30 [Activate] Set $10/day cap, 24h expiry → session grant tx → agent executes a real DeFi action; spend meter ticks. **(obligation c1)**
- 2:30–3:00 [Revoke + close] One click → revocation tx → Keystore key dead; over-cap attempt shown reverting. Close on counters + repo. **(obligation c2)**

## 7. Risk Register (≥8, 6 categories)
| # | Risk | Sev | Like | Impact | Mitigation | Tree |
|---|------|-----|------|--------|-----------|------|
| R-1 | Scope overrun in <11h (Technical/Time) | CRIT | High | half-built | PLAN phase gates; cut-first tier pre-marked | DT-1 |
| R-2 | Mainnet gas absent tonight (Technical) | HIGH | Certain | no mainnet writes | testnet-first everywhere; scripted morning runbook | DT-2 |
| R-3 | 8004scan throttle/outage (Technical) | HIGH | Med | index stalls | pacing + resume cursor + onchain-event fallback for detail | DT-3 |
| R-4 | Host dies during Sep 9–23 (Demo) | CRIT | Med | dead product mid-judging | Fly paid VM, restart policy, healthcheck, uptime monitor | DT-4 |
| R-5 | Altana testnet relay/faucet issues (Technical) | HIGH | Med | sessions fail | probe-proven fallback: sessions optional-degrade to direct wallet w/ UI honesty; retry relay | DT-5 |
| R-6 | Sybil heuristic challenged (Judging) | MED | Med | credibility | published method note; "insufficient valid feedback" wording, never accusations | — |
| R-7 | Incumbent comparison (Competitive) | MED | Med | "another explorer" | README table vs 8004scan/RNWY; pitch leads with probe+recompute+hire | — |
| R-8 | Demo flow breaks live (Demo) | HIGH | Med | failed obligation | rehearsal phase; every scene has pre-verified fallback agent | DT-6 |
| R-9 | Judge hits empty category (Judging/Scope) | HIGH | Low | diversity fail | 4 reference agents seeded + graded before submission; gate in PLAN | DT-7 |
| R-10 | PCS/Venus testnet quirks (Technical) | MED | Med | agent actions fail | agents' actions = simplest real ops; mainnet reads for data; DT fallback per category | DT-7 |

## 7.5 Judge Experience
First visit: populated grade board (real indexed data), counters, 4 category tiles each showing graded agents incl. our reference agents; no login/wallet wall (read-only browse works cold; activation uses server-held demo wallet — judges never need keys). 10s: hero + counters answer "what is this". 30s: category list + grades. 60s: open agent → re-probe button works cold. Seed = real: indexer + probes run before submission (U7-earned, never fabricated). **Demo-insurance invariant check:** all seed state = real probe/index/agent runs; zero fabrication (product claim IS verifiability). **custodyProduct: true** (server holds operator+agent keys). **Keys-off-host demo path:** judges browse + re-probe with NO keys; activation demo uses a rate-limited server-side demo-operator wallet with tiny caps (session caps bound blast radius; funds-controlling key never in client, never on Vercel; Fly secrets only).

## 7.6 Judge Proof Artifacts
`/proof` page + submission/proof.md: registry addresses, our agents' ERC-8004 ids, attestation tx hashes, session grant/revoke txs (Altana explorer links), agent action txs, index/probe counters, wallet addresses (Altana submission requirement). Generated by `scripts/proof.ts` post-deploy.

## 8. Build Plan (hour-by-hour, ~11h)
H0–1 scaffold+DB+indexer | H1–3 probe engine+grades+attestor(testnet) | H3–5 UI (land/category/detail/activate) | H5–7 sessions+reference agents (testnet) | H7–8 TermiX report script + proof | H8–9 deploy Fly + livetest | H9–10 demo video + README | H10–11 package + submit buffer. (Pipeline phases map onto these.)

## 9. Dependencies
Node 22, pnpm, Fly.io account+CLI, EVM key (set), tBNB (have 0.147), Altana testnet $U faucet, Anthropic key (set), morning: ~0.01 BNB mainnet.

## 10. Concerns Compliance
All [C] mapped: demo e2e w/o intervention (R-8/DT-6, rehearsal); integration live (probe-proven registry writes, verified APIs); uniqueness (whitespace + comparison table); real humans/day-1 users (BSC DeFi users + 310K registrants); no self-dup (marketplace shape ≠ AgentMesh mesh/AlphaAttest commit-resolve; Agent Auditor kernel disclosed combinable); significant problem (registry rot caps the ecosystem — organizer's own framing). [I] scope locked by this PRD; demo=real product (all state earned). Per-hackathon: 4-cat equal depth (reference agents + category-agnostic grades); LIVE agents (real registered agents executing real txs); Sep 9–23 host (Fly paid); TermiX report from day one (H7–8, script speced); README carries all proof (no form fields for video/URL).

---
# EXPANDED SPECIFICATIONS (Section 4/5 detail)

## 4.1 indexer — detailed spec
Purpose: mirror the BSC ERC-8004 corpus locally so browsing never depends on 8004scan availability or rate limits.
Interface: `indexTick(): Promise<number>` (rows upserted); state via kv keys `scan_cursor`, `scan_done`, `scan_budget`.
Data structure: `agents` table (see ARCHITECTURE §4) — chain_id+token_id PK; endpoint columns nullable (96% will be null — that fact is product signal, not missing data).
Pacing contract: ≥2.2s between calls; ≤900 calls/day; budget carries across restarts (kv).
Failure modes: HTTP non-200 → skip tick (no retry storm); malformed item → skip row, log; cursor absent in response → set scan_done honestly.
Performance: 100 rows/call → full 310K corpus ≈ 3,102 calls ≈ 2.5 days at budget. Day-1 target: ≥20K indexed + ALL leaderboard/trending/latest agents (quality-first ordering).
Priority order: leaderboard pages first (they hold the probe-able population), then cursor walk.

## 4.2 probe engine — detailed spec
Purpose: convert "registered" into "verified live" with evidence a judge can replay.
Interface: `runProbe(chainId, tokenId) → { probeLogId, liveness, meta, feedback, track, checks[] }`.
Checks (each timed, 6s timeout):
- mcp_initialize: JSON-RPC initialize to mcp_server; ANY HTTP response (even 4xx) proves a listener; connection refused/timeout = dead.
- a2a_card: GET a2a_endpoint; JSON with name field = valid card.
- endpoints_declared: absence of both = the 96% case; scored 0 liveness with explicit verdict text.
Scoring (D-5): liveness 0/32/40 (dead / one endpoint live / both live), meta 0-15 (name+desc+image+x402), feedback 0-30 (validity heuristic — see method note), track 0-15 (recorded actions + attestations).
Every probe writes probe_logs row BEFORE grade upsert (INVARIANT 1 ordering).
<!-- [CRITIQUE E-2] Budget decoupling + shell fast-grade lane --> Probe throughput is DECOUPLED from the 8004scan 900/day budget: probes of indexed rows use stored endpoint data (no scan refresh); scan refresh only for unindexed rows. A second worker lane fast-grades endpoint-less agents (zero network cost per grade) in batches of 25/30s — honest graded coverage grows by thousands/day instead of every shell showing "not yet probed". This also keeps AC-2's ≤15s probe bound true (checks are ≤2×6s without the paced scan call).

## 4.3 feedback-validity method note (published in UI footer + DOMAIN-GUIDE)
Signal basis: arXiv 2606.26028 findings (59.2% coordinated reviewers on BSC).
Heuristic v1 (honest label: heuristic, not classification): feedback plausible iff 0 < avg < 100 AND count < 500. Uniform-perfect mass feedback = farm signature → low validity score. Zero feedback = neutral floor 12/30 ("nothing to validate" ≠ "bad").
NEVER rendered as accusation; wording fixed: "insufficient validated feedback" / "feedback pattern consistent with coordinated farming (heuristic)".
Upgrade path (post-hackathon): client-address clustering via shared funding provenance.

## 4.4 attestor — detailed spec
Purpose: make Winnow the registry's first honest write-path (whitespace #4).
Guards (INVARIANT 2, code-level): tag ∈ {liveness, metadata}; 0 ≤ value ≤ 100; own-agent writes require ATTESTOR2 key else skip with log.
Write: giveFeedback(agentId, value, 0, tag, "winnow", "", evidenceURI, 0x0); evidenceURI = data URI containing probe transcript hash + timestamp.
Read-back: attestations table row + BscScan link + third-party reader check (demo scene 4).
Cost: ~90K gas ≈ $0.03 mainnet — bounded by attest-on-probe policy (only probed agents, only on grade change).

## 4.5 session layer — detailed spec
Grant: cap 0.001–0.05 BNB/day, expiry 1–48h, optional allowlist (agent's strategy contracts).
Storage: sessions row + kv session_handle_{id} (serialized SDK handle for revoke).
Revoke: SDK revokeSession → onchain tx recorded in revoke_tx; UI flips to "revoked" only after receipt.
Over-cap demo: demonstrateOverCap() attempts 2× cap transfer; expected revert captured as agent_actions.overcap_revert row (demo scene 6 proof).
Degraded mode (DT-5b): relay outage → app-enforced caps + banner "session enforcement degraded (relay outage)"; Altana bounty flagged at risk in PULSE.

## 4.6 reference agents — per-category spec
| Agent | Category | Data source (mainnet reads) | Action (write-chain) | Cadence |
|---|---|---|---|---|
| Winnow Rebalancer | rebalancing | PCS v3 pool slot0 tick vs range | rebalance decision + (mainnet AM) position ops | 2 min |
| Winnow Grid | grid-trading | PCS Quoter both directions | grid order decisions + (AM) micro swaps | 2 min |
| Winnow Yield | yield | Venus markets API / vToken rates | routing decision + (AM) dust supply | 2 min |
| Winnow Guardian | health-factor | Aave getUserAccountData(WATCH_ADDR) | HF assessment + top-up alert (AM: real top-up) | 2 min |
Each: own wallet (kv-persisted), ERC-8004 registration (testnet tonight, mainnet AM), Claude-haiku reasoning per action (skip-and-log if API down — never canned text), actions feed its OWN track score (earned state).

## 5.1 API error catalog
| Endpoint | Error | Status | Body |
|---|---|---|---|
| /api/agents | bad query | 400 | {error:"bad query"} |
| /api/agent/:c/:id | unknown | 404 | {error:"not indexed"} |
| /api/reprobe | cooldown | 429 | {error:"cooldown 20s"} |
| /api/reprobe | probe internal | 200 w/ failed checks | transcript records the failure (a failed probe IS a result) |
| /api/activate | cooldown | 429 | {error:"cooldown 60s"} |
| /api/activate | relay down | 500 | {error: msg} + UI shows DT-5b banner |
| /api/revoke | no session | 500 | {error:"no session"} |

## 6.1 Demo voiceover (full text, banned-pattern-checked: no em dashes, active voice)
S1 (0:00): "BSC has three hundred ten thousand registered AI agents. Four percent are alive. Winnow is grading every one of them, live. Watch the counter climb." <!-- [CRITIQUE E-1] honest progressive claim backed by visible probed counter -->
S2 (0:20): "Pick a job. Health factor monitoring. Every agent here carries a grade computed from live probes, not star ratings. This one failed its probe. Here is the evidence."
S3 (0:50): "Don't trust the grade? Re-run it. That button fires a real probe at the agent's endpoint right now. Watch the score update."
S4 (1:20): "Verified liveness gets written back to the canonical registry. Here is the transaction, and here is the same attestation in a third-party explorer. Winnow leaves the registry better than it found it."
S5 (1:50): "Hiring is a session, not a leap of faith. Ten dollars a day, twenty-four hours, enforced by the chain. Watch the agent work inside its leash."
S6 (2:30): "It tries to overspend. The chain says no. One click fires it. The key is dead. That is what hiring an agent should feel like."

## 7.7 Category tagging honesty
Real indexed agents get categories via keyword match on description (labeled "auto-categorized" in UI); reference agents are hand-labeled. Uncategorized agents remain browsable via search. The 4 category pages therefore mix reference + auto-tagged real agents — the tag heuristic is disclosed in the footer method note.

## 8.1 Hour-by-hour mapped to pipeline phases
| Clock (UTC) | Pipeline | Winnow work |
|---|---|---|
| 02:30-03:15 | build C0-C1 | scaffold, skeleton, db, indexer live |
| 03:15-04:30 | build C2 | probe+grade+attestor, invariant verifier |
| 04:30-06:00 | build C3+C4 | sessions, agents, seed, UI |
| 06:00-07:00 | build C5 + debug | scripts, report, quality gate |
| 07:00-07:45 | wire + verify_milestone | integration proofs |
| 07:45-08:30 | design_forge + stress | polish + hard tests |
| 08:30-09:15 | deploy + livetest | Fly live, smoke on URL |
| 09:15-10:15 | interrogate + rehearsal + demo | video recorded |
| 10:15-11:15 | package + preflight | README, submission form filled |
| 11:15-12:00 | buffer | morning runbook if funded; SUBMIT |

## 9.1 Prerequisite check commands
- `node -v` ≥22 · `cast --version` · `flyctl version` · `sqlite3 --version`
- creds: `grep -c EVM_PRIVATE_KEY ~/.claude/credentials/pipeline-credentials.env` → 1
- balances: `cast balance 0xc211C942946011859ca634F22400d80570ED12A5 --rpc-url https://data-seed-prebsc-1-s1.bnbchain.org:8545` ≥ 0.1e18

---
# ACCEPTANCE CRITERIA (per flow, testable)

## AC-1 Hire flow (hero)
- [ ] Cold browser, no wallet extension, no cookies: landing renders counters within 3s
- [ ] Each of the 4 category tiles navigates to a populated list (≥1 reference agent + auto-tagged agents)
- [ ] Agent detail renders: name, ERC-8004 id, owner prefix, grade badge OR "not yet probed"
- [ ] Activate button (reference agents): completes grant within 60s; session row appears with cap+expiry
- [ ] Post-activation: agent's next action appears in "Recent actions" within 3 min with LLM reasoning
- [ ] Revoke: single click; UI shows revoked ONLY after tx receipt; Keystore isValidKey returns invalid
- [ ] No route in the flow returns an unstyled error page or blank screen

## AC-2 Recompute flow
- [ ] "Re-probe now" disabled during cooldown with visible countdown wording
- [ ] Probe completes ≤15s; transcript renders raw JSON with every check's ms + verdict
- [ ] Grade badge updates in place; graded_at timestamp changes
- [ ] Probing a dead agent yields F with "connection refused/timed out" evidence — rendered as a designed state

## AC-3 Onchain verification flow
- [ ] Attestation links resolve on the correct explorer for their chain (label mismatch forbidden — MUST NOT CLAIM)
- [ ] /proof lists every attestation tx + session + agent action tx with zero unbacked rows
- [ ] scripts/verify-claims.ts exits 0 on the deployed DB

## AC-4 Honesty surfaces
- [ ] Landing shows "index growing" banner until scan_done
- [ ] Method note link present in footer (feedback heuristic + category auto-tagging disclosure)
- [ ] No UI string claims full-corpus probing

# NON-FUNCTIONAL REQUIREMENTS
| Dimension | Requirement | Verified by |
|---|---|---|
| Availability | 100% during Sep 9–23; auto_stop=false; restart on crash | livetest + uptime monitor |
| Latency | list pages <1.5s server render; probe ≤15s; activate ≤60s | stress |
| Cost ceiling | 8004scan ≤900 calls/day; LLM ≤$2/day (haiku, 200 tok); gas bounded by attest-on-probe | worker budget guards |
| Data freshness | grades timestamped; stale >24h shows amber "re-probe suggested" | UI check |
| Security | operator key only in Fly secrets; agent keys capped+expiring; zod on all inputs; no negative onchain writes | SECURITY.md + stress |

# API CONTRACTS (full JSON shapes)

## GET /api/stats → 200
{ "indexed": number, "withEndpoints": number, "probed": number, "verifiedLive": number, "attestations": number, "indexComplete": boolean }

## GET /api/agents?cat&q&page → 200
{ "items": [ { "chain_id": 56, "token_id": number, "name": string, "description": string, "image_url": string|null, "mcp_server": string|null, "a2a_endpoint": string|null, "is_reference": 0|1, "category": string|null, "letter": "A".."F"|null, "score": number|null, "graded_at": string|null } ] }

## GET /api/agent/{chain}/{id} → 200
{ "agent": AgentRow, "grade": { "letter": string, "score": number, "probe_log_id": number, "transcript": string, "liveness": number, "meta": number, "feedback": number, "track": number, "ran_at": string } | null, "attests": [ { "tag": string, "value": number, "tx_hash": string, "chain_id": number } ], "actions": [ { "kind": string, "detail": string, "tx_hash": string|null, "reasoning": string, "at": string } ], "sessions": [ SessionRow ] }

## POST /api/reprobe { "chain": 56, "id": number } → 200 { "score", "letter", "probeLogId", "breakdown" } | 429 | 400

## POST /api/activate { "agentName": string, "tokenId": number, "capBnb": 0.001-0.05, "hours": 1-48 } → 200 { "ok": true, "wallet": address, "sessionKey": address } | 429 | 500

## POST /api/revoke { "sessionId": number } → 200 { "ok": true } (after receipt)

## POST /api/overcap-demo { "sessionId": number } → 200 { "reverted": true, "error": string }

# COMPETITIVE POSITIONING (README table source)
| Capability | 8004scan | RNWY | Winnow |
|---|---|---|---|
| Registry index | ✓ | ✓ | ✓ (mirrored, honest counters) |
| Static quality score | ✓ (v5) | ✓ (dual) | ✓ (graded) |
| LIVE endpoint probe at view time | ✗ | ✗ | ✓ (re-probe button) |
| Recomputable evidence per number | ✗ | ✗ | ✓ (transcript + verify script) |
| Writes verified signal BACK onchain | ✗ | ✗ | ✓ (giveFeedback attestations) |
| In-product capped hiring + 1-click onchain revoke | ✗ | ✗ | ✓ (Altana sessions) |
| 4-category live reference workforce | ✗ | ✗ | ✓ |

# GLOSSARY (→ DOMAIN-GUIDE.md)
- agentId / tokenId — ERC-721 token id in the IdentityRegistry; agent_id string form "56:0x8004a169…:{id}"
- registration file — JSON the tokenURI resolves to (name/description/services/x402Support)
- probe — timed HTTP checks against an agent's declared MCP/A2A endpoints
- grade — D-5 formula output over a probe_logs row; letter A–F
- attestation — our positive/neutral giveFeedback write with evidence URI
- session — Altana Keystore-enforced scoped authority (allowlist/cap/expiry)
- reference agent — Winnow-operated live agent seeding each category
- coordinated-feedback heuristic — the published validity method (never "Sybil accusation")

# SUBMISSION FIELD DRAFTS (package phase copies from here)
- One-Line Pitch: "Winnow grades all 310,000 BSC agents with recomputable live probes and lets you hire any of them inside a spend-capped session you can revoke in one click."
- Project Description core: problem (4% alive, 59.2% coordinated reviewers) → recomputable grades → onchain write-back → capped hiring → 4 live reference agents → proof page. Live URL + video link INLINE here (form has no dedicated fields).
- Sub-prize ticks: PancakeSwap ✓ TermiX ✓ AltLayer ✓ (Altana via wallet addresses in Notes + README).
- Wallet address field: 0xc211C942946011859ca634F22400d80570ED12A5 (+ agent session keys in Notes).

# DEMO FALLBACK MATRIX (feeds demo_rehearsal)
| Scene | Primary | Fallback A | Fallback B |
|---|---|---|---|
| S2 graded list | health-factor category | yield category | search view |
| S3 re-probe live | OpenOdds 56/49637 (verified green in forge) | alternate leaderboard agent pre-verified at rehearsal | our reference agent (endpoint we control) |
| S4 attestation | latest attestor tx | probe-agent txs 0x9c1275…/0xd40ae6… pattern re-run | /proof page listing |
| S5 activate | fresh grant live | pre-granted session from rehearsal (real, earned) | recorded rehearsal take (label as rehearsal) |
| S6 overcap+revoke | live overcap-demo + revoke | rehearsal session revoke | agent_actions.overcap_revert row + tx links |

# JUDGE Q&A PREP (defends every layer, TASTE U5)
- "How is this different from 8004scan?" → the positioning table; live probes + recompute + write-back + hiring are all absent there.
- "Is your Sybil detection real?" → "It is a published heuristic over the same signals the arXiv study validated; we call it a heuristic in-product and never write negative findings onchain."
- "Why should BNB adopt this?" → runs unattended (worker + budgets), leaves the registry better (attestations any reader displays), honest counters — infrastructure, not a demo.
- "What happens when your server dies?" → Fly restart policy + healthcheck; the onchain layer (attestations, sessions, registrations) survives independently of our host.
- "Why testnet writes?" → chain-labeled honestly; mainnet runbook is one funded command; reads are all mainnet.

# OUT-OF-SCOPE RESTATEMENT (from WINNER-BRIEF, binding)
No negative onchain writes; no full-corpus probe claims; no DIY-baseline ranking mechanism; no FOREMAN autonomy chain in core; no x402 sell endpoint unless C5 finishes early ([MOCK-x402-SELL]).

# ROLLBACK / CODE-FREEZE POLICY
Code freeze at 11:30 UTC (T-30m). Any post-freeze change requires: reproducible bug affecting the hero flow + one-file fix + immediate re-run of AC-1. Git tag `submission` at freeze; `git revert` to tag on any regression.

# TERMIX REPORT PLAN (Section 7.8 — planned from day one, 30% of TermiX score)
## Task A (trading, high-stakes): WBNB/USDT grid decision cycle
- Agent leg: Winnow Grid produces two orders + reasoning; wall-clock from request to decision; cost = LLM tokens + any gas.
- Manual leg: builder opens PCS quoter manually (cast calls), computes grid levels by hand with a calculator, writes the same two orders; wall-clock recorded honestly (expected 8-15 min vs agent <30s).
- Quality rubric (1-5): correctness of levels vs spot, slippage awareness, risk statement present, reproducibility, clarity.
## Task B (security-adjacent): health-factor assessment of WATCH_ADDR
- Agent leg: Guardian reads getUserAccountData + reasons on liquidation distance.
- Manual leg: builder runs the cast call, converts 1e18 HF by hand, writes assessment.
## Task C: yield routing across Venus markets
- Agent leg: Yield agent ranks top supply APYs + routes.
- Manual leg: builder reads api.venus.io JSON manually, sorts, decides.
## Report format (submission/AGENT-ADVANTAGE-REPORT.md)
| Task | Leg | Time | Cost | Quality (rubric) | Output (verbatim, attached) |
<!-- [CRITIQUE E-3] TermiX rubric alignment: criteria are Value 30% (price+speed beat alternative) / Proven advantage 30% / High-stakes+track record 20% -->
Per task, add an explicit **"Price + speed vs alternative"** line: agent-leg cost (LLM tokens + gas, USD) and wall-clock vs manual-leg operator time valued honestly — state the multiple plainly (e.g. "agent 28s/$0.004 vs manual 11m40s"). No AgentEra-style unbounded multipliers: every number carries its receipt.
Task A (trading) additionally reports the TermiX trading-agent trio honestly: **evaluation window** ("single-session calibration, N decision cycles on {date}"), **decision-quality assessment against realized spot after the window** (labeled calibration, never extrapolated to a win rate we did not measure), and an explicit **risk statement** in the agent output. Absent long-window data is stated as absent — the honest-window framing IS the differentiator vs competitors' 600x claims.
Honest labeling: "calibration runs executed by the operator on {date}; agent legs via the deployed marketplace; manual legs performed by hand and wall-clocked; receipts inline." TermiX's own re-test is expected — the marketplace they hire from is the live URL.

# DATA RETENTION + JUDGING-WINDOW OPERATIONS
- SQLite on Fly volume; WAL mode; no destructive migrations post-freeze.
- Worker budgets reset daily (kv scan_budget); LLM spend capped by action cadence (4 agents × 30/hour max).
- Monitoring: /api/stats polled by external uptime monitor (betteruptime free) + Fly checks; alert → Telegram (existing bot creds).
- Incident playbook: RPC brownout → fallback transport automatic; scan outage → index pauses, UI banner, probes continue (probes don't need 8004scan); LLM outage → agents log skip (never canned).
