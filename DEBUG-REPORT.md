# DEBUG REPORT — Winnow

## Executive Summary
- **Generated:** 2026-09-09T04:48Z · **Last Updated:** 2026-09-09T06:35Z
- **Confidence Score:** 90
- **Unresolved Issues:** 0 (UNRESOLVED-BUG/ENTANGLED/TEST-ABANDONED/INFRA all zero)
- **Security Findings:** CRITICAL 0, HIGH 0, MEDIUM 1 (revoke rate-limit — FIXED)
- **Test snapshot:** typecheck + prod build + 6 test files (28 checks) + verify-claims all green
- **Recommendation:** **PROCEED** (demoFormat=recorded, threshold 65)

## Baseline Snapshot (Phase 1)
- Test:source ratio 0.13 (5 aggregate test files / 39 sources) — below 0.3 target; noted, delegated to stress (DH-4). Files are aggregate assert-suites (28 total checks), not 1:1.
- typecheck PASS · test:unit 3 files PASS · strategies-data PASS · verify-claims `{orphanGrades:0, negativeAttestations:0}` · `next build` PASS · dev server `/api/stats` 200
- **BASELINE-FAILURE found & fixed (TEST-BUG):** `api-routes.test.ts` asserted an ungraded agent appears on page 0 of `/api/agents`; fastgrader had since graded 758+ agents so page 0 went all-graded. Route was correct (18,549 ungraded agents still listed — INVARIANT 3 holds). Test made data-robust (DB-driven unique-named ungraded pick). 9/9 checks pass.
- No Solidity in-repo → gas snapshot N/A.

## Known Risks Disposition (Phase 2)
| Risk | Class | Disposition | Evidence |
|---|---|---|---|
| DEV-006 paced() no retry | TESTABLE | **RISK-CLEARED** | retry-once on transient (network/5xx/429), never 4xx; budget+pacing apply to retry. `debug-p2-risk-paced-retry.test.ts` 4/4 |
| DEV-503 gridTick no risk line | TESTABLE | **RISK-CLEARED** | prompt demands "Risk:" sentence; live tick via `claude -p` CLI produced real levels + Risk sentence |
| C3 worker pidfile collision | STRUCTURAL | **RISK-HARDENED** | single-instance pidfile lock in startWorker() (covers both start sites), stale-pid takeover; `debug-p2-risk-worker-lock.test.ts` 2/2 (live-holder refusal + kill -9 takeover) |
| Farm-pattern wording accusatory | STRUCTURAL | **RISK-HARDENED** | fbDetail → "outside plausible range … insufficient independently-validated feedback"; 2 affected agents honestly RE-PROBED (56/49637 C/59, 97/2286 F/20); 0 grades reference old wording |
| DEV-302/502 LLM key on Fly | EXTERNAL | **RISK-ACCEPTED** | CLI path proven live locally; Fly needs funded key (D-3) → wire DH-1 |
| DEV-501 timing framing | STRUCTURAL | **RISK-DISMISSED** | deliberate candor in Agent Advantage Report, not a defect |
| Worker cursor/dup rows | STRUCTURAL | **RISK-DISMISSED** | kv cursor + ON CONFLICT upsert idempotent by construction |

### TEST MATRIX rows (PLAN.md) executed
| Row | Result |
|---|---|
| unit: grade formula | PASS (10 asserts) |
| invariant: orphan grades | 0 ✓ |
| invariant: negative attest / bad tag | throws ✓ (attestor-guards) |
| api validation capBnb:9 | 400 ✓ |
| rate limit reprobe ×2 | 429 ✓ |
| probe timeout (dead endpoint) | REAL probe vs blackhole: `ok:false`, "aborted due to timeout" 6001ms → F/37; endpoint restored, re-probed C/69 ✓ |
| session overcap /api/overcap-demo (session 5) | `{"reverted":true,…ExceededSpendLimit}` — INVARIANT 5 live ✓ (session NOT revoked) |
| worker resilience | lock test kills -9 + restart; cursor kv-persisted, upsert idempotent ✓ |
| AC-1 cold walk (curl, no wallet) | 8/8 pages 200, 0 error markers (/, 4 categories, 2 agent details, /proof) |
| AC-2 reprobe latency | 2.3s ≤ 15s ✓ |

## Delegation Manifest (Phase 3)
| Coverage class | Owner |
|---|---|
| Connections/credentials/integration seams | **wire** |
| Demo-path execution | **verify_milestone** |
| Exhaustive journeys/edges/attacks/AI-agent failure modes | **stress_test** |

8 handoff rows appended to PULSE `## Downstream Items` (DH-1..DH-8): wire ×3 (LLM on Fly, localhost a2a endpoints, real-path retry), verify_milestone ×2 (chain-label drift, counter honesty), stress_test ×3 (test-ratio edges, AI-agent edge classes per AgentAuditor, name-spam floods). Mirrored in `.debug-state.json` `delegationHandoff`. Smoke: `/api/stats` 200.

## Security Audit (Phase 4)
Zero CRITICAL, zero HIGH. `.env` NOT tracked (verified `git ls-files -s` empty; initial alarm was check-ignore echo). No secrets in tracked files. No debug routes, no CORS config (same-origin defaults). **MEDIUM fixed:** `/api/revoke` had no rate limit (only gas-burning route without one) → 10s/session cooldown, first revoke never blocked. No mocks in test suite except documented fetch stub in retry test (→ DH-6). Full detail: `debug-results/phase-4-security-results.md`.

## Senior Dev Critique (Phase 5)
- backend: 3 MUST-FIX, 8 SHOULD-FIX, 9 NOTE (`debug-results/phase-5-backend-critique.md`)
- frontend: 2 MUST-FIX, 4 SHOULD-FIX, 6 NOTE (`debug-results/phase-5-frontend-critique.md`)
- Subagent verified paced() retry + pidfile lock correct; frontend verified keys/states/dead-ends/honesty copy clean.

## Fix Round (Phase 6)
| Finding | Change | Verified |
|---|---|---|
| M1 detail route chain collision (actions/sessions by token only) | actions gated on `is_reference`; sessions filtered by `agent_chain` | api tests 9/9 |
| M1-class in trackScore | action counts only for reference agents (prevents cross-chain track inflation; no contaminated rows existed) | grade tests + live probes |
| M3 a2a-only agents never auto-graded | prober lane `mcp IS NOT NULL OR a2a IS NOT NULL` | typecheck + suite |
| F1 detail page overflow on arbitrary names | `break-words` on h1 + description | build + page 200 |
| F2 raw wei in session card | formatted as BNB | build + page 200 |
| SHOULD: overcap false-proof | only SpendLimit-class errors recorded as `overcap_revert`; others surface as 500 (INVARIANT 6) | live overcap msg matches regex |
| SHOULD: activate cooldown burn on failure | `lastActivate=0` in catch | typecheck |
| SHOULD: activate response mislabeled `sessionKey` | honest labels (sessionId/wallet/agentWallet/grantTx); no UI consumer | grep + page 200 |
| SHOULD: "Most are shells." blanket claim | → "Most never answer a probe." (probe-backed) | build |
| SHOULD: hardcoded "96% case" in transcripts | → "no declared MCP or A2A endpoint" | build |
| **M2 localhost a2a endpoints (refs 2288-2291)** | **NOT code-fixable pre-deploy** — deploy must run `scripts/regrade-refs.mts` after URL rewrite; works on localhost recording host | delegated DH-2 (wire/deploy), P1 |

Skipped as sanctioned (time-pressure discipline, ~6h band): remaining SHOULD-FIX (next/link swap, Safari date parse — record in Chrome) and all NOTEs — logged in critique files.

## Final Snapshot
- typecheck ✓ · `next build` ✓ (pre-existing `ox` transitive warning only) · dev server 200 ✓
- 6 test files / 28 checks all PASS (incl. 2 new debug tests) · verify-claims: indexed 28,007, probed 1,333, orphanGrades 0, negativeAttestations 0 (index grew honestly DURING debug — F-001 witnessed)
- Session 5 still live (grant intact, overcap proven, never revoked)

## Unresolved Items
None.

## Confidence Score Justification
Formula from 100: no unresolved bugs, no remaining HIGH/MEDIUM, no unsanctioned skips. Judgment −10 total: M2 is a real demo-path risk if recording were done against Fly before endpoint rewrite (−5, delegated with existing script + P1 PULSE row); retry-once proven via stubbed fetch only (−3); LLM degraded on Fly until D-3 lands (−2). **90.** Higher would require: refs re-graded on the deploy URL, funded LLM key proven on host, stress-level edge coverage (all owned downstream).
