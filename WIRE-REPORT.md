# Wire Report

**Status:** WIRED-WITH-DEGRADATION
**Date:** 2026-09-09T05:18Z
**Project:** Winnow (winnow-app/) — BNB Smart Money Era
**Pipeline position:** After debug (confidence 90), before verify_milestone
**Mode:** autonomous, real credentials + live endpoints, WINNOW_CHAIN=testnet (mainnet reads only — no mainnet funds touched)

## Project Topology

| Component | Type | Entry Point |
|-----------|------|-------------|
| winnow-app | Next.js 14 app (frontend + 9 API routes) | `next dev` / `next start` |
| worker | background loops (indexer/prober/fastgrader/agents) | src/instrumentation.ts → src/worker.ts (pidfile single-instance) |
| indexer | 8004scan paginated ingest | src/lib/scan8004.ts |
| probe/grade | endpoint prober + letter grader | src/lib/probe.ts, grade.ts |
| attestor | ERC-8004 giveFeedback writer | src/lib/attestor.ts |
| altana | session grant/exec/revoke + Keystore reads | src/lib/altana.ts |
| strategies | 4 category ticks + LLM reason() | src/lib/agents/strategies.ts |
| SQLite | data store | data/winnow.db (better-sqlite3) |

## Integration Test Results (evidence: command + output + UTC timestamp, all captured live)

| # | Connection | Pri | Result | Evidence |
|---|-----------|-----|:------:|----------|
| 1 | indexer → api.8004scan.io (list + detail + feedbacks) | P0 | PASS | 05:11:46Z list `chain_id=56&limit=1` → real item 341860; 05:12:08Z detail `/agents/56/341620` → full record; feedbacks → base64 JSON w/ clientAddress |
| 2 | probe → live agent endpoint (OpenOdds 56/49637) | P0 | PASS | 05:12:17Z direct card HTTP 200 (1.62s); 05:14:21Z in-app POST /api/reprobe {chain:56,id:49637} → probeLogId 1423, mcp_initialize HTTP 200 (1961ms) + a2a_card ok, grade C/59, 3.0s total |
| 3 | chain → BSC testnet RPC | P0 | PASS | 05:11:52Z eth_blockNumber → 0x7bf1b4c |
| 4 | chain → BSC mainnet RPC reads | P0 | PASS | 05:11:52Z block 0x733916f; 05:12:42Z Aave getUserAccountData(WATCH_ADDR) → HF 0x128206f6ed39d2a1 (≈1.3349), debt >0; PCS pool slot0 → live tick 0xfffefd3b; VenusLens has code |
| 5 | attestor → Reputation 0x8004B663 (testnet 97) WRITE | P0 | PASS | 05:15:17Z NEW tx `0xd09508a9d8efb27b22000e645d7977ad54831f4614647f5ad3df6518f6e22280` giveFeedback(2288, "liveness", 32) — measured from probe_log 462; receipt status success (RPC-confirmed 0x1), block 129965336; attestations row id 3 inserted (F-003 ✓); ATTESTOR2 own-agent signer path exercised |
| 6 | altana → Keystore + testnet relay | P0 | PASS | 05:14:50Z isValidKey(session 5) = **true**; 05:14:55Z POST /api/overcap-demo {sessionId:5} → `{"reverted":true,...ExceededSpendLimit}` 3.4s; session 5 status still `live` — NOT revoked (F-004 ✓) |
| 7 | strategies → api.venus.io/markets | P1 | PASS | 05:12:44Z core-pool?limit=1 → real market record (total 55) |
| 8 | strategies → Anthropic (LLM) | P1 | PARTIAL | 05:15:35Z healthFactorTick: API 400 credit-balance-too-low → CLI fallback (`claude -p`, haiku) returned real non-canned reasoning over real Aave data in 12.9s. DEV-302: degraded-on-Fly (no CLI on deploy host) |
| 9 | app → Fly.io | P0 | SKIPPED | Deploy-phase owned. Local stand-in health check /api/stats 200 PASS |
| 10 | app → SQLite | P0 | PASS | 29,007 agents / 1,372 probes / 1,358 grades at start; live growth to 33,207 / 1,533 during wire (F-001 witnessed) |
| 11 | dev-server e2e | P0 | PASS | /api/stats 200 (0.22s, real counters); /api/agents?cat=yield → 11 items, correctly filtered; /api/agent/56/49637 → full detail + grade; /api/agent/97/2288 → 16 real actions, 4 sessions; /api/sessions 200; /api/a2a/winnow-sentinel real card; landing 200 15KB real copy, zero "Loading...", no empty state |

**Score: 9 PASS / 1 PARTIAL / 1 SKIPPED (deploy-owned) of 11.** verify-claims exit 0: orphanGrades 0, negativeAttestations 0 (F-002 ✓).

## Credential Audit

| Env Var | Status | Notes |
|---------|--------|-------|
| EVM_PRIVATE_KEY | VALID | 0x+64 hex; operator 0xc211C942… |
| ATTESTOR2_PRIVATE_KEY | VALID | proven live (attestation #3 signed by second key) |
| ANTHROPIC_API_KEY | FORMAT_OK / CREDIT-DRY | 400 credit balance too low — CLI fallback works locally (DEV-302, D-3) |
| WINNOW_CHAIN / DB_PATH / PCS_POOL / WATCH_ADDR | VALID config | testnet write-side; WATCH_ADDR is a live Aave borrower (HF 1.33, debt $28.8k) |

No mock flags found (.env + src scan clean). No placeholders.

## Sentinel Check (4.2d)

No sentinel hits. Reasoning non-canned (distinct per tick, real HF numbers embedded); txIds non-null after writes; counters non-zero and growing; grades join real probe transcripts (FK verified by verify-claims).

## Authorization Surface (4.2e)

Mutating endpoints (reprobe/activate/revoke/overcap-demo) are **unauthenticated by design** — walletless judge path is INVARIANT AC-1 and server-held demo custody is a resolved forge decision (D-12); each has per-resource cooldowns (20–60s), bad-body → 400, failed activation doesn't burn cooldown. No multi-user model → ownership tests N/A. Per-instance config check: 5 sessions have distinct fresh session keys and differing caps (2e15 vs 5e15 wei) — CONFIG-SHARED PASS. Residual risk (unauth /api/activate spends operator testnet gas) logged for stress; debug security pass was 0 CRIT/HIGH.

## Explorer Links (4.2c)

testnet.bscscan.com returns 403 to curl (Cloudflare anti-bot) — link format standard, tx confirmed authoritative via RPC receipt. WARN-only: verify in a real browser before demo. No own contract addresses (contractAddresses = {}).

## Phase 4.5 Fix & Retest

Zero integration failures — no fixes required. (Two initial 400s were wire's own wrong test params: `category=` vs `cat=`, `chainId/tokenId` vs `chain/id`. Route contracts correct; noted for downstream consumers.)

## Phase 5.5 / 5.6 / 5.7

- **Privacy audit: SKIPPED** — no FHE/ZK/confidential keywords anywhere.
- **Isolation test: SKIPPED** — no multi-user data model (single demo-operator custody by design); per-instance session isolation verified via distinct keys/caps.
- **Async latency (measured):** reprobe 3.0s (MEDIUM), overcap-demo 3.4s (MEDIUM), attestation ~6s submit→row (MEDIUM), LLM CLI tick 12.9s (SLOW — spinner/wait marker needed), activate NOT-TESTED by wire (debug measured grant flow; avoid burning demo sessions).

## Downstream Items actioned

- **DH-1 (P1):** Local LLM provider PROVEN (CLI real haiku reasoning); skip-and-log path code-verified (worker catch, ESCALATE-DON'T-FABRICATE — no canned output possible). NOTE: no dedicated "LLM degraded" UI banner — staleness only visible via action timestamps. Deploy must land funded key (D-3) or accept timestamp-only honesty. → done-with-note
- **DH-2 (P1, deploy-owned):** Mechanism VERIFIED: /api/a2a/{name} serves real cards locally; scripts/regrade-refs.mts present and correct. Endpoint rewrite remains deploy's job. → mechanism-verified
- **DH-6 (P2):** Real 8004scan calls observed under live budget: index 29,007→33,207 during wire, scan_budget {day 2026-09-09, n:369} sane vs 900/day, single worker (pidfile), no double-burn. → done

## Blockers

None hard. Degradations:

| # | Degradation | Recovery |
|---|-------------|----------|
| 1 | Anthropic API credit-dry; CLI fallback is local-only — Fly deploy runs LLM-degraded (skip-and-log) | D-3: funded ANTHROPIC_API_KEY (or AltLLM) before/at deploy |
| 2 | Reference agents' a2a_endpoints localhost-bound until deploy rewrite (DH-2) | deploy: rewrite + scripts/regrade-refs.mts |
| 3 | Mainnet attestation/session runbook unfunded (D-1, ~0 BNB on operator) | Dami funds 0xc211C942… ~0.01 BNB |

## Summary

- Components: 8 | Connections tested: 11 (9 PASS, 1 PARTIAL, 1 deploy-skipped)
- Credentials: 4/4 resolved (1 credit-dry with working fallback) | Mock warnings: 0 | Sentinel hits: 0
- F-001 ✓ F-002 ✓ F-003 ✓ (new tx 0xd09508a9…) F-004 ✓ (isValidKey true + ExceededSpendLimit revert, session 5 intact)
- Evidence scripts kept for reproducibility: scripts/wire-keycheck.mts, scripts/wire-attest.mts, scripts/wire-tick.mts
