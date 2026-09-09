# INVARIANTS — Build-Agent Law (Winnow)
> The build agent reads this as non-negotiable law. Violating any NON-NEGOTIABLE fails the hackathon gate.

## NON-NEGOTIABLES
1. **Grades exist only from probes that actually ran.** — Test: every `grades` row has NOT NULL `probe_log_id` FK to a `probe_logs` row containing the raw transcript; UI queries JOIN — an orphan grade cannot render. — Judge-attack: "insert a fake A grade in the DB" → Defense: schema forbids grade without probe log; re-probe button re-derives live in front of the judge. (headlineEnforcement: **structural**)
2. **Negative findings never go onchain.** — Test: attestor code path has a single `value >= 0` + allowlisted-tags (`liveness`,`metadata`) guard before any `giveFeedback` send; grep shows no negative-value writes. — Judge-attack: "so you defame agents onchain?" → Defense: onchain = positive/neutral proof-of-liveness only; caution signals are UI-side wording ("insufficient valid feedback"), method note published.
3. **Ungraded ≠ unlisted.** — Test: /agents list endpoint returns rows where `grade IS NULL` with `probe_status='pending'`; landing counters show indexed vs probed honestly. — Judge-attack: "you only show your curated 50" → Defense: full paginated index with visible totals; probing is an overlay badge.
4. **The hero flow never dead-ends.** — Test: Playwright walk land→category→detail→activate→revoke completes with zero uncaught errors on the deployed URL, cold session, no wallet extension. — Judge-attack: judge clicks a dead shell agent → Defense: F-grade page renders evidence + disabled-hire explanation (a designed state, not an error).
5. **Session caps are enforced onchain, not in UI.** — Test: over-cap `execute` attempt reverts (captured tx/error in proof.md); revoke = 1 tx; Keystore `isValidKey` flips. — Judge-attack: "your cap is a UI label" → Defense: Altana Keystore enforcement demoed with the revert on screen.
6. **Every headline number recomputable.** — Test: counters (indexed/probed/verified-live), each grade, and each TermiX report row link to raw evidence (probe transcript, tx hash, script output committed). — Judge-attack: "recompute this 'verified-live: N'" → Defense: /proof page lists the derivation query + evidence files.

### MUST NOT CLAIM
- "All 310K agents probed/verified" (only: indexed all; probed N, growing)
- "Sybil detection" as proven classification — say "coordinated-feedback heuristic (method note)"
- Mainnet coverage while writes are testnet — label each explorer link with its chain
- Any APY/P&L multiplier without window + risk + tx receipts (the AgentEra failure mode)

## VERIFY-BEFORE-CLAIMING
Every number/address/hash in README/demo/submission must be recomputable from a committed source (scripts/proof.ts output, probe_logs, tx receipts). No unbacked figure ships.

## RESOLVED DECISIONS
| # | Question | Options | Chosen | Why not others | Status |
|---|---|---|---|---|---|
| D-1 | Host | Fly.io VM / Vercel / Railway | Fly.io paid VM + volume | Vercel: cron-only workers can't hold agent loops + env-clobber history; need 14-day always-on | RESOLVED |
| D-2 | DB | SQLite(better-sqlite3) / Postgres | SQLite on Fly volume | zero-ops, 310K rows trivial, single container | RESOLVED |
| D-3 | Chain client | viem / ethers | viem 2.x | Altana SDK peer-deps on viem | RESOLVED |
| D-4 | Index source | 8004scan API / raw event crawl | 8004scan paginated (+ onchain fallback for detail) | event crawl of 340K mints too slow tonight; API verified | RESOLVED |
| D-5 | Grade formula | see ARCHITECTURE §grading | liveness40+meta15+feedback30+track15 → A≥85 B≥70 C≥55 D≥40 else F; unprobed=null | RESOLVED |
| D-6 | Attestation target | testnet now → mainnet at morning funding | both same code, RPC+registry by env | mainnet-only blocks tonight; testnet-only fails "agents live" optics | RESOLVED |
| D-7 | Reference agents | 4 worker strategies w/ own wallets + Altana testnet sessions; real actions; mainnet reads for market data | building on PCS/Venus mainnet tonight impossible (gas) | RESOLVED |
| D-8 | Agent brains | Anthropic haiku (key present); AltLLM fallback | AltLLM credits not yet issued | RESOLVED |
| D-9 | x402 sell endpoint | CUT-FIRST tier [MOCK-x402-SELL] | bonus, not core rubric | RESOLVED |
| D-10 | Activation UX | server-held demo-operator wallet (rate-limited, tiny caps) | wallet-connect wall violates judge experience; keys-off-host per 7.5 | RESOLVED |
| D-11 | Deploy addresses of agent wallets | OPEN (build-discovered fact — generated at H5, recorded in proof.md) | — | OPEN(fact) |
| D-12 | Morning mainnet runbook | scripts/mainnet-runbook.ts: fund→register 4 agents→attest→1 real action each→update proof | — | RESOLVED |

## SOURCE LOCK
| External identifier | Pin | Verify command | Expected | Status |
|---|---|---|---|---|
| @altananetwork/sdk | 0.9.0 exact | `npm ls @altananetwork/sdk` | 0.9.0 | [VERIFIED-in-forge] |
| ERC-8004 Reputation BSC | 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 | `cast code $ADDR --rpc-url bsc-dataseed` | non-0x | [VERIFIED-in-forge] |
| ERC-8004 testnet pair | 0x8004A818…BD9e / 0x8004B663…8713 | probe txs 0x9c1275… / 0xd40ae6… | status 0x1 | [VERIFIED-in-forge] |
| giveFeedback signature | (uint256,int128,uint8,string,string,string,string,bytes32) | live tx above | ✓ | [VERIFIED-in-forge] |
| getSummary gotcha | clientAddresses must be non-empty | cast call w/ [] → revert "clientAddresses required" | revert | [VERIFIED-in-forge] |
| 8004scan API | api.8004scan.io/api/v1 (30/min,1000/day) | `curl …/agents?chain_id=56&limit=1` | items[] | [VERIFIED-in-forge] |
| Multicall3 | 0xcA11bde05977b3631167028862bE2a173976CA11 | eth_getCode | non-0x | [VERIFIED-in-forge] |
| VenusLens | 0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA | eth_getCode | non-0x | [VERIFIED-in-forge] |
| PCS v3 NPM/Quoter | 0x46A15B0b… / 0xB048Bbc1… | eth_getCode | non-0x | [VERIFIED-in-forge] |
| Altana Keystore | BSC 0x6572427E… / testnet 0x6b8361C2… | docs.altana.network/concepts/keystore | match | [VERIFIED-in-forge] |
| PCS v3 testnet addrs | — | fetch docs at build | — | [UNVERIFIED-build-gate] |
| Venus testnet vTokens | — | fetch docs at build | — | [UNVERIFIED-build-gate] |

## ESCALATE, DON'T FABRICATE
On any gate/task failure: stop, record BLOCKED with the failing gate name, and NEVER substitute a mock, cached-success, or fabricated count. Triage over budget: cut [MOCK-x402-SELL] → FOREMAN showcase → burned-key depth → 4th reference agent duplicate strategies; NEVER cut a P0 or invariants 1–6. Escalate after 2 failures on the same gate.
