# Phase 5 — Backend Critique (Winnow)

Scope: src/lib/{db,config,chain,scan8004,probe,grade,attestor,altana}.ts, src/lib/agents/strategies.ts, src/worker.ts, src/instrumentation.ts, all src/app/api/**/route.ts.
Severity per demo rubric (recorded demo: land → category → detail → re-probe → activate → watch actions → revoke).

## MUST-FIX

### M1. Detail route misattributes actions/sessions across chains
`src/app/api/agent/[chain]/[id]/route.ts:12-13`
```ts
const actions = db.prepare("SELECT * FROM agent_actions WHERE agent_token=? ...").all(id);
const sessions = db.prepare("SELECT * FROM sessions WHERE agent_token=? ...").all(id);
```
Both queries filter by token_id only. Indexed marketplace agents are chain 56; reference agents are chain 97. Any mainnet agent whose token_id collides with a reference agent's token_id shows the reference agent's live actions, reasoning, and sessions on ITS detail page — wrong data on camera if the judge (or the browse step) opens such an agent. `sessions` HAS an `agent_chain` column that the query ignores; fix is `AND agent_chain=?`. `agent_actions` has no chain column — quickest safe fix: only attach actions when `agent.is_reference=1` (only reference agents ever generate actions), or add the chain filter via the token's chain. One-line-per-query fix.

### M2. Reference agents' a2a_endpoint = localhost — re-probe on the deployed app tanks their grade live
`src/app/api/a2a/[name]/route.ts:5-6` (acknowledged in-code as pending C6) + `src/lib/probe.ts:24-28`
`agents.a2a_endpoint` for the 4 reference agents points at `http://localhost:3000/...`. The demo's re-probe step fetches that stored URL. If the recording is done against the Fly deploy (or any host where localhost:3000 isn't the app), the a2a_card check fails → liveness 0 → the reference agent visibly drops to F during the re-probe moment of the demo. This is fine ONLY if you record against localhost. Before recording: either run the C6 rewrite (`UPDATE agents SET a2a_endpoint=... WHERE is_reference=1` + regrade-refs) or lock the recording to localhost. Verify with one manual re-probe on the exact host you will record on.

### M3. Worker never grades a2a-only agents — the 4 reference agents are in this class
`src/worker.ts:50-61`
- prober lane: `WHERE a.mcp_server IS NOT NULL`
- fastgrader lane: `WHERE a.mcp_server IS NULL AND a.a2a_endpoint IS NULL`

Agents with only an a2a_endpoint (which is exactly the reference agents, and any indexed a2a-only agent) fall between the two lanes and are never auto-graded. If a reference agent's grade row is missing (fresh DB, or a seed step skipped), it renders ungraded at the top of the landing page for the whole demo and nothing will ever fix it. Fix: change prober's filter to `(a.mcp_server IS NOT NULL OR a.a2a_endpoint IS NOT NULL)`. Also verify all 4 reference agents have grades in the DB you record with (`SELECT token_id FROM grades WHERE chain_id=97`).

## SHOULD-FIX

### S1. Failed activation still burns the 60s global cooldown
`src/app/api/activate/route.ts:9,12` — `lastActivate = Date.now()` is set before `activateAgent()` runs; if the grant throws (RPC hiccup, relay error), the retry is blocked for 60s of dead air. Keep the pre-set (it correctly prevents concurrent double-grants) but reset `lastActivate = 0` in the catch so an immediate retry works.

### S2. revoke() not idempotent — second click after 10s cooldown = visible 500
`src/lib/altana.ts:81-91` + `src/app/api/revoke/route.ts` — `revoke()` never checks `row.status`. Re-revoking an already-revoked session calls the SDK against a dead key and surfaces a raw SDK error. Guard: `if (row.status === "revoked") return row.revoke_tx;`.

### S3. demonstrateOverCap logs ANY failure as cap-enforcement proof
`src/lib/altana.ts:112-122` — the catch treats every non-VIOLATION error (RPC down, expired session, revoked key, network timeout) as "Over-cap attempt reverted onchain as designed" and writes an `overcap_revert` row into agent_actions. That's a false proof record (data corruption in the trust ledger). At minimum check the session `status='live'` first and match the error message against the SDK's spend-cap rejection before recording.

### S4. activate response mislabels the returned key
`src/app/api/activate/route.ts:15` — `sessionKey: r.agentWallet.address` is the agent wallet, not the session key (the fresh `sessionPk` account stored in `sessions.session_key`). Should be `privateKeyToAccount(sessionPk).address` equivalent — return `r.sessionId` + read from the sessions row, or expose it from `activateAgent`. Anything the UI shows as "session key" is currently wrong.

### S5. upsertAgent trusts 8004scan fields — NaN token_id can wedge the indexer
`src/lib/scan8004.ts:31` — `Number(it.token_id)` with a missing/garbage token_id yields NaN; better-sqlite3 rejects it, the whole 100-item `db.transaction` in `indexTick` rolls back, and the indexer loop retries the same cursor forever (silent stall, only console errors). Guard: `if (!Number.isFinite(Number(it.token_id))) return;` at the top of `upsertAgent`. Same for `it.chain_id`.

### S6. a2a route hardcodes chain_id=97
`src/app/api/a2a/[name]/route.ts:23` — query uses literal `chain_id=97` while everything else derives from `A.id` / `CHAIN`. Works for the testnet demo, silently returns fallback data under `WINNOW_CHAIN=mainnet`. Use `A.id`.

### S7. Cooldown-map pattern duplicated 4×, with one inconsistency
`activate` (module `let`), `reprobe`, `revoke`, `overcap-demo` (Maps) all hand-roll the same cooldown; `activate/route.ts:16` also formats errors as `String(e?.message)` (→ literal "undefined" when message is absent) while the other three use `String(e?.message ?? e)`. Extract a tiny `cooldown(key, ms)` helper or at least align the error formatting.

### S8. Dead code: recentFeedbacks
`src/lib/scan8004.ts:52-55` — no callers in src/, scripts/, or tests. Each accidental future call burns scan budget. Delete.

## NOTE

### N1. paced()/pacedOnce review (requested): correct, two soft races
`src/lib/scan8004.ts:4-24` — Retry logic is right: retries exactly once, only on transient (network/5xx/429), not on budget-exhausted or parse failure; budget+pacing re-applied on retry. Soft spots: (a) `lastCall`/budget kv are read-modify-write with an `await` in between, so a concurrent indexTick + reprobe-of-unindexed-agent can both fire inside the 2.3s window and undercount the budget — worst case a handful of extra calls/day, acceptable; (b) failed fetches still count against the 900/day budget (conservative, fine).

### N2. Worker pidfile lock review (requested): correct for the demo, two known edges
`src/worker.ts:14-29` — signal-0 stale detection and takeover are right. Edges: (a) PID reuse — a recycled pid belonging to an unrelated process makes the worker silently refuse to start (no loops, no live actions); the console.error is the only signal, so glance at logs before recording; (b) `process.on("exit")` doesn't fire on SIGKILL, covered by (a)'s stale check; (c) read-then-write TOCTOU between two simultaneous starts — vanishingly unlikely with instrumentation-driven startup.

### N3. activateAgent's "atomic" persist is two statements, not a transaction
`src/lib/altana.ts:73-77` — sessions insert and kv handle insert are separate; a crash between them leaves a session row whose revoke/overcap will throw "no stored session handle". Wrap in `db.transaction` when convenient.

### N4. Cooldown Maps grow unboundedly
`reprobe`/`revoke`/`overcap-demo` route Maps are never pruned. Irrelevant at demo scale.

### N5. reprobe accepts arbitrary chain/id
`src/app/api/reprobe/route.ts` — grading a nonexistent agent burns one 8004scan detail call and inserts orphan probe_log/grade rows (invisible in UI due to join-from-agents). Could validate against the agents table first.

### N6. probe.ts uses require("./scan8004") for upsertAgent while importing agentDetail at top
`src/lib/probe.ts:15` — works, but the split import/require is confusing; import upsertAgent normally. Same pattern in `attestor.ts:8` (`require("./chain").REGISTRY_ABI` despite top-level imports from the same module).

### N7. SESSION_DEGRADED_BANNER exported but unreferenced
`src/lib/altana.ts:30` — declared honesty surface; no UI consumer found. Fine to keep as a documented seam.

### N8. probe_logs/transcripts grow without pruning; grades keep only latest probe_log_id
By design (INVARIANT 1 keeps the referenced log), but old logs accumulate forever. Post-hackathon concern.

### N9. Structure checks
No function exceeds 50 lines (largest: `activateAgent` ~25, `runProbe` ~30); nesting stays ≤3 everywhere; parameterized SQL throughout (no injection via `q`/`cat` — zod-bounded and bound as params). Shared single better-sqlite3 connection makes the worker/route write interleaving safe (sync serialized writes, WAL).
