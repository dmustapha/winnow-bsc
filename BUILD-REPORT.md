# Build Report — Winnow
Generated: 2026-09-09T03:40Z | Builder: hackathon-build (orchestrator + subagents)
## Summary
| Phase | Steps | Status | Notes |
|-------|-------|--------|-------|
## Deviations from Architecture
| ID | Component | ARCHITECTURE Said | ACTUAL | Reason | Class | Downstream Impact |
|----|-----------|-------------------|--------|--------|-------|-------------------|
## Failed Attempts & Resolutions
| Step | Error | Attempts | Resolution |
|------|-------|----------|------------|
## Verification Results
| Phase | Command | Expected | Actual | Pass? |
|-------|---------|----------|--------|-------|
## Known Risks (for debug)
## Contract Addresses
| Contract | Network | Address | Tx Hash |
|----------|---------|---------|---------|
## Environment Variables Added
| Key | Source Step | Value/Description |
|-----|-----------|-------------------|

### C0+C1 (executor: subagent, orchestrator-verified 03:55Z)
Gates: build exit 0; 7 tables; verify-claims {indexed:400, orphan:0, negative:0}; 400|400 unique agents; cursor persisted; pacing 2786ms; total corpus reported by API: 310,431. DT-3: next_cursor confirmed.
DEV-001 COSMETIC tsx assert tests (no framework in deps). DEV-002 COSMETIC grade test self-skips until C2. DEV-003 COSMETIC list items lack endpoint fields — C2 must hydrate endpoints via agentDetail() before probing.

### C2 (executor: subagent, orchestrator-verified 04:15Z)
Gates: OpenOdds 56/49637 C/59 (mcp 200 + a2a card); shell 341620 F/27 w/ transcript; E-2 zero-scan re-probes confirmed (budget static); attestations testnet 0xa35e384c… (2286, operator) + 0x43980a03… (2287, ATTESTOR2 0x5e6cBAb6… — own-agent path real); guards throw pre-chain; verifier green; FK orphANS 0.
| DEV-004 | scan8004 upsert | services.mcp only | + services.a2a.endpoint mapping | detail shape reality | COSMETIC | none |
| DEV-005 | attestor evidence | example liveness=100 placeholder | attested MEASURED metadata w/ probelog evidence | VERIFY-BEFORE-CLAIMING | COSMETIC | stronger honesty |
| DEV-006 | paced() | no retry | transient null hydration → orphan probe_log id=1 (unreferenced) | fetch flake | DEGRADED | known risk: add retry-once (debug) |
Known risk: OpenOdds feedback=6 (farm-pattern branch fires on n=3/avg=100 — heuristic as specified; demo uses liveness tier).
ENV added: ATTESTOR2_PRIVATE_KEY (0x5e6cBAb6…, funded 0.01 tBNB tx 0x6dbb1731…).

### C3 (subagent, orchestrator-verified 05:15Z)
Session lifecycle e2e REAL: spike 0xdbf1c748… | full cycle session4: grant 0xb4433aee… → isValidKey true → in-cap exec 0xe22694b9… → OVER-CAP REVERT ExceededSpendLimit (INVARIANT 5 onchain) → revoke 0x98660860… → isValidKey false. Demo session 5 LIVE (0.005 BNB/24h, 0x56918568…). 4 reference agents registered testnet ids 2288-2291 (txs 0x7394ddf4/0x46a9673b/0xef0aa79d/0x34f5ec2b). 33 mainnet agents auto-categorized; every category ≥1 ref. 11 actions w/ real LLM reasoning (local claude CLI). Worker window: +300 grades/5min (fastgrader). Inputs resolved: PCS_POOL=0x36696169… WATCH_ADDR=0xe5EC0065… (live borrower HF 1.33).
| DEV-301 | altana.ts | static import | dynamic import() (ESM-only SDK) | runtime reality | COSMETIC | none |
| DEV-302 | strategies LLM | ANTHROPIC_API_KEY | all keys credit-dry → local `claude -p` CLI (real reasoning) | credits | DEGRADED | FLY DEPLOY NEEDS FUNDED KEY (D-3) |
| DEV-303 | sessions | allowlist omit = allow-all | relay requires explicit targets → scope to agent wallet | relay enforcement | COSMETIC | narrower = safer |
| DEV-304 | sessions | reuse session key | fresh key per grant (KeyStore rejects re-registration) | contract behavior | COSMETIC | repeat activations work |
| DEV-305 | ARCH §10 | param `signerKey` | real param `sessionSigner` (d.ts) | [UNVERIFIED] resolved | COSMETIC | none |
### C4 (subagent, orchestrator-verified 05:15Z)
All 8 routes + 5 pages; typecheck+build clean; curls 200 ×5; reprobe live probe ~4s + 429 cooldown; honest-copy grep 0 hits; AC-2/AC-4 additions (countdown, stale hint, method note, states). DEV-401 COSMETIC tsconfig ES2020. DEV-402 COSMETIC additive AC items.
Known risks: (1) reference agents grade F (no endpoints) — IMPROVEMENT queued: serve real A2A cards at /api/a2a/{name} so probes verify them honestly (debug phase); (2) DEV-302 Fly reasoning needs funded key or AltLLM adapter; (3) paced() retry-once (DEV-006).
