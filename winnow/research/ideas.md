# BNB Build the Era — Ideas
## Selected: Winnow (TRIAGE) — trust-graded agent marketplace. See warroom/WINNER-BRIEF.md

## Pool Stats
- Raw generated: 30 (G1:6 G2:6 G3:6 G4:6 G5:6)
- Hybrids: 3 (folded into parents per L3) | Late entrants: [SEED] 0, [HISTORY] 0 (Agent Auditor kernel = feasibility evidence inside TRIAGE)
- Killed — kill list: 0 | concerns: 2 (FRESHBLOCK, STAKEHOUSE — C13) | demo test: 0 | score floor: 0 | anti-attractor: 0
- Brief levers: 9/12 mapped | Regeneration rounds: 0 | Rescued: 0
- Presented: 6
- injection: lint pass, quota 2/1/2/10

## Presented Pool

### #1: FOREMAN — hire one agent that hires the other 309,999
**Score:** 22/25 — Ship [3] | Demo [5] | Sponsor [5] | Novel [5] | Memorable [4]
**Mechanism:** User grants ONE supervisor agent a spend-capped Altana session; when its watchers fire (VenusLens shortfall, PCS range drift), the foreman autonomously executes hireErc8183Agent through its session key to engage the right category specialist, paying real $U from inside its cap. Marketplace UI = your money's org chart.
**Why this chain (U6):** Spend-capped autonomous hiring (8183 escrow through Altana session keys against live Venus/PCS state) is a tri-primitive composition that exists only on BSC.
**3-min demo shape:** Venus position drifts toward shortfall → foreman detects, spends $1.50 $U hiring a rebalancer onchain → specialist restores HF → escrow settles. Zero human clicks after grant.
**TASTE:** U1 U2 U3 U6 C-AI1 C-DF1. **Primitives:** F14×F12×F06. **Law-check:** L2✓ L3✓ L10✓ L12✓. **Origin:** G2.

### #2: PROBATION — every hire starts on a leash sized by its onchain record
**Score:** 21/25 — Ship [4] | Demo [5] | Sponsor [5] | Novel [3] | Memorable [4]
**Mechanism:** "Activate" mints an Altana session whose cap/expiry are programmatically sized by the agent's onchain record (empty history → $5 sandbox; evidence-linked history → caps grow). Completed 8183 jobs raise the curve; burner re-registrations restart at the bottom. Fire = 1-tx revocation; over-cap attempt = live onchain revert.
**Why this chain (U6):** Enforceable only where session caps (Altana Keystore BSC) and portable reputation (canonical ERC-8004) are both live onchain.
**3-min demo shape:** Veteran rebalancer auto-cap $50 executes real PCS rebalance; day-old clone forced to $5/10min, attempts over-cap trade → Keystore reverts on-chain → one-click fire.
**TASTE:** U1 U2 U3 U6 U7 C-DF1 C-IN1. **Primitives:** F12×F17(+F14 curve). **Law-check:** L2✓(revert climax) L3✓ L11✓ L12⚠(3 generators converged — modal risk, differentiate vs Marque via record-sized caps + full in-product lifecycle). **Origin:** G1/G2/G3/G4/G5 merge.

### #3: TRIAGE — the credit bureau the 310K-agent registry is missing
**Score:** 20/25 — Ship [4] | Demo [4] | Sponsor [4] | Novel [4] | Memorable [4]
**Mechanism:** Probe engine live-tests every listed agent (endpoint liveness, Sybil-cluster analysis over feedback graph, burned-key detection) and writes findings BACK onchain as tagged ERC-8004 giveFeedback attestations with resolvable evidence URIs. Rankings draw exclusively from recomputable grades — every number has a "re-run this" button.
**Why this chain (U6):** Only BSC has 310K agents + a live, canonical, anyone-can-write ReputationRegistry to remediate — the product IS the registry's missing honest signal.
**3-min demo shape:** Top yield agent's grade → raw probe transcript + feedback tx on BscScan; re-run probe on a dead shell live → its attestation written, rank collapses in ~3 blocks.
**TASTE:** U1 U2 U6 U7 C-DF1 C-IN1. **Primitives:** F21×F23×F07. **Law-check:** L2✓(owner-feedback barred in contract) L3✓ L11✓ L12✓. **Origin:** G1/G2/G3/G4/G5 merge.

### #4: TENURE — the résumé is a chain of settled escrows
**Score:** 20/25 — Ship [3] | Demo [4] | Sponsor [5] | Novel [4] | Memorable [4]
**Mechanism:** Every hire = atomic hireErc8183Agent escrow; completion = keccak-verified deliverable; failure = dispute with the agent eating the refund. Rankings = employment ledger (jobs, wages, dispute rate, tenure). Reviews from wallets with no settled job render greyed "unemployed reviewer" — Sybil filter is structural, not statistical.
**Why this chain (U6):** ERC-8183's atomic escrow with $U gasless settlement is production only on BSC; reputation becomes Sybil-COSTLY (speaking requires paying a job).
**3-min demo shape:** Hire health-factor monitor for $2 $U → real Aave HF report manifest → escrow settles → service-record line lands on BscScan; rival's card shows a lost dispute + refund; fake 5-star review greys out as jobless.
**TASTE:** U1 U2 U6 U7 C-DF1. **Primitives:** F16×F14×F09. **Law-check:** L2✓(agent stakes escrow) L3✓ L11✓ L12✓. **Origin:** G2/G3/G1 merge.

### #5: REMATCH — hire it, or beat it: the listing IS the Agent Advantage Report
**Score:** 20/25 — Ship [3] | Demo [4] | Sponsor [4] | Novel [4] | Memorable [5]
**Mechanism:** Every agent page is a split-screen benchmark: agent's real onchain results vs a deterministic DIY baseline (same capital/window/pair, priced from PCS v3 history + scripted manual path). Each hire appends a fresh head-to-head row — time, gas, outcome delta — win or lose. Undisclosed/unverifiable claims (the "40.6x" class) rank below disclosed ones.
**Why this chain (U6):** Both benchmark legs live on the same cheap-read chain (PCS tick history + agent tx trails beside ERC-8004 identity) — X threads have no BscScan.
**3-min demo shape:** Open rebalancer → 7 prior rematches → click hire → live rematch executes onchain → new row appends (honestly, either way). Sort category by "hired vs DIY delta."
**TASTE:** U1 U2 U3 U7 C-DF1. **Primitives:** F09(inverted)×F14×F23. **Law-check:** L2✓(no delete path) L3✓ L11✓(TermiX 60% + Data Quality) L12✓ L14✓. **Origin:** G3/G4/G5 merge.

### #6: SECOND OPINION — two agents must agree before your money moves
**Score:** 20/25 — Ship [3] | Demo [4] | Sponsor [4] | Novel [5] | Memorable [4]
**Mechanism:** Hire a PRIMARY agent; the marketplace auto-assigns a cross-category AUDITOR (health-factor agent audits your rebalancer's plan). Primary's session activates only after the auditor's signed approval; disagreement blocks with both opinions shown; both paid via 8183 escrow. Categories become roles, not tabs.
**Why this chain (U6):** Needs dense cross-category agent corpus (ERC-8004), dual 8183 escrow, and Altana conditional session activation — native plumbing end to end.
**3-min demo shape:** Rebalancer's plan reviewed by auditor → approved → session activates, real PCS tx; rerun with bad range → auditor REFUSES, session never mints, escrow refunds.
**TASTE:** U1 U2 U3 U6 C-AI1 C-DF1. **Primitives:** F17(guardian-as-hired-agent)×F14×F06. **Law-check:** L2✓(refusal climax) L3✓ L11✓(maxes Agent Diversity uniquely) L12✓ L10✓. **Origin:** G4.

## Brief-Utilization Map
| Lever | Idea(s) |
|---|---|
| 8004scan API + registry | TRIAGE, PROBATION |
| Altana sessions/Keystore | PROBATION, FOREMAN, SECOND OPINION |
| ERC-8183 + $U | TENURE, FOREMAN, SECOND OPINION |
| x402/B402 | (PIECEWORK/UNDERWRITER — not presented; x402 sell = Altana bonus lever available to winner) |
| PCS agent guide | REMATCH, FOREMAN |
| VenusLens/Aave HF | FOREMAN, SECOND OPINION, TENURE |
| TermiX report | REMATCH (the product IS the report) |
| Pain #44/#50 burned/unindexed | TRIAGE |
| Pain #4 zero reputation | TENURE, TRIAGE |
| AltLLM credits | agent brains (any winner) |
| Four.meme / Lista / Copy Trade skills | no idea found — peripheral to the 4 prescribed categories |

## Killed Ideas
| Idea | Origin | Gate | Cause |
|---|---|---|---|
| FRESHBLOCK | G1 | Gate 1 | critical_concern_C13 (no day-1 paying agents; self-pay = U7 tension) |
| STAKEHOUSE | G5 | Gate 1 | critical_concern_C13 (no day-1 curators; self-curation fabricates market) |
| UNDERWRITER, PROVING GROUND, GHOSTHIRE, PIECEWORK, BONDHOUSE, CORDON, LADDER | various | Gate 6 | not spike-selected (survive as feature-kernels for the winner) |
