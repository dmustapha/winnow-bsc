# PLAN — Winnow implementation
## [EMERGENCY MODE — hour-based phases; deadline 2026-09-09 12:00 UTC]
**How to use:** execute phases in order; copy code from ARCHITECTURE.md sections cited per task; every phase ends at its gate — do not proceed on a red gate. Commit after every task.

## Phase overview
| Phase | Purpose | Budget | Depends |
|---|---|---|---|
| C0 | scaffold + franchise skeleton + foundation | 45m | — |
| C1 | data layer: indexer live | 45m | C0 |
| C2 | probe+grade+attestor (testnet) | 75m | C1 |
| C3 | sessions + reference agents | 90m | C2 |
| C4 | UI complete | 75m | C2 (parallel w/ C3 ok) |
| C5 | scripts: seed, proof, advantage report | 60m | C3, C4 |
| C6 | deploy Fly + smoke | 45m | C5 |
Total ≈ 7h coding — leaves buffer for pipeline QA phases before noon.

## C0 — Scaffold + skeleton (ARCH §16)
- T0.1 `npx create-next-app@14 winnow-app --ts --tailwind --app --src-dir --no-eslint` then overwrite package.json from ARCH §16; `npm i --fetch-retries=5`. Commit: `chore: scaffold winnow app`.
- T0.2 Create CLAIMS.md ("every claim + evidence pointer; append-only"), SECURITY.md (custody model: operator key in Fly secrets only; agent session keys capped/expiring; no negative onchain writes), DOMAIN-GUIDE.md (from ARCH §17 spec), honesty ledger section inside CLAIMS.md. Copy scripts/verify-claims.ts (ARCH §15). Commit: `docs: franchise skeleton (claims/security/domain/verifier)`.
- T0.3 src/lib/config.ts + db.ts (ARCH §3–4). `npx tsx -e "require('./src/lib/db')"` → tables created. Commit: `feat: config + sqlite schema`.
- **GATE C0:** [ ] app builds (`npm run build`) [ ] db file created w/ 7 tables [ ] CLAIMS/SECURITY/DOMAIN exist.

## C1 — Indexer (ARCH §5–6)
- T1.1 chain.ts (§5). Verify: `npx tsx -e` cast-equivalent blockNumber both chains. Commit: `feat: viem clients + verified ABIs`.
- T1.2 scan8004.ts (§6). Run `indexTick()` 3× manually → rows in agents; **DT-3 check first response keys** (cursor field name). Commit: `feat: paced 8004scan indexer`.
- **GATE C1:** [ ] ≥200 agents in DB [ ] pacing observed (no 429) [ ] cursor persists across restart.
#### DT-3 (8004scan pagination/throttle)
Run first page, log keys. ✅ `next_cursor` present → as coded. 🔀 different field (`cursor`,`page_token`) → adjust kvSet key. 🔀 429s → raise pace to 3s. ⛔ API down → fallback: enumerate via 8004scan /agents/leaderboard+/latest (small) + mark index degraded (honest banner); detail via tokenURI reads onchain.

## C2 — Probe + grade + attestor (ARCH §7–9)
- T2.1 probe.ts + grade.ts. Test: grade a known-live agent (OpenOdds 56/49637 — mcp verified in forge) → expect liveness>0; grade a shell → 0. **[CRITIQUE E-2] probe.ts uses the budget-decoupled refresh (scan call ONLY for unindexed rows — per updated ARCH §7); verify a re-probe of an indexed agent makes zero 8004scan calls (kv scan_budget unchanged).** Commit: `feat: probe engine + grades (FK invariant)`.
- T2.2 attestor.ts on TESTNET. Attest a testnet agent (e.g. our probe agent 2287's neighbor) → tx status 1 (pattern proven: 0xd40ae6…). Commit: `feat: guarded positive attestor`.
- T2.3 npm run verify (verify-claims) → orphanGrades=0, negativeAttestations=0. Commit: `test: invariant verifier green`.
- **GATE C2:** [ ] live agent grades >55 [ ] shell grades F w/ transcript [ ] attestation tx on testnet BscScan [ ] verifier green.
#### DT-1 (scope clock) at end of C2: if elapsed >3.5h total → CUT [MOCK-x402-SELL]+4th-agent-variants now (already default), and pre-decide C3 fallback DT-5b.
#### DT-6 (probe flakiness for demo)
✅ OpenOdds probes green → demo uses it. 🔀 flaky → pre-verify 3 alternates from leaderboard, pick greenest at rehearsal. ⛔ all flaky → demo re-probe on OUR reference agent (always green — we run its endpoint) + show F-probe on shell.

## C3 — Sessions + reference agents (ARCH §10–12)
- T3.1 altana.ts. **Spike hire path FIRST (30m budget)**: grantSession on testnet with real relay; **DT-5 check `signerKey` param naming vs SDK d.ts**. Commit: `feat: altana session layer`.
- T3.2 strategies.ts + worker.ts + instrumentation.ts. **DT-7: resolve WATCH_ADDR (live Aave BSC borrower via bscscan), PCS_POOL (factory getPool(WBNB,USDT,500)), venus API field names**. **[CRITIQUE E-2] worker includes the fastgrader lane (ARCH §12): endpoint-less agents batch-graded 25/30s at zero network cost — verify probed counter grows by 100+ during the 5-min worker run.** Run worker 5 min → agent_actions rows w/ real reasoning. Commit: `feat: 4 reference agents + worker loops`.
- T3.3 scripts/seed-agents.ts: register 4 agents on TESTNET registry (register(dataURI) pattern proven tx 0x9c1275…), write kv reference_agents, set agents.category+is_reference for them AND categorize ~30 real indexed agents by description keyword match (honest heuristic, labeled). Commit: `feat: seed reference agents`.
- **GATE C3:** [ ] session visible via Keystore isValidKey / testnet.altana.network [ ] **[CRITIQUE E-4] kv `session_handle_{id}` row exists immediately after activateAgent (revoke + overcap depend on it — persisted inside activateAgent per updated ARCH §10, not as a separate step)** [ ] 4 agents registered w/ ERC-8004 ids [ ] actions w/ Claude reasoning in DB [ ] each category has ≥1 reference agent.
#### DT-5 (Altana SDK/session issues)
✅ grantSession works → proceed. 🔀 param shape differs → read node_modules/@altananetwork/sdk/dist/*.d.ts, adjust. 🔀 relay down/faucet dry → retry 3×; then DT-5b: sessions DEGRADE to direct agent-wallet ops w/ app-enforced caps + UI banner "session enforcement degraded (relay outage)" — Altana bounty then at risk, note in PULSE, keep main track intact. ⛔ SDK broken entirely → same DT-5b + attempt raw Keystore contract calls for grant (docs concepts/keystore) in stress phase if time.
#### DT-7 (DeFi data quirks)
✅ VenusLens/venus API/pool reads work → proceed. 🔀 VenusLens ABI mismatch → use Aave getUserAccountData only (verified) for health agent. 🔀 venus API shape differs → onchain vToken supplyRatePerBlock. ⛔ → agent still runs w/ mainnet price reads via PCS quoter (verified) — never fabricate data.

## C4 — UI (ARCH §13–14) [may run parallel with C3]
- T4.1 API routes (§13) — all 7. Commit: `feat: api routes`.
- T4.2 Pages+components (§14). **[CRITIQUE E-1] copy law: landing h1/metadata/demo say "we're grading every one" + live probed counter — NEVER "we grade all of them" (MUST-NOT-CLAIM); grep the built UI for "grade all" → 0 hits.** Commit: `feat: ui hero flow`.
- **GATE C4:** [ ] land→category→detail→re-probe works locally cold [ ] counters real [ ] no dead ends (F-grade page renders explanation).

## C5 — Scripts + report (ARCH §15)
- T5.1 proof.ts + verify-claims green. Commit: `feat: proof generation`.
- T5.2 agent-advantage.ts + RUN IT: 3 tasks both ways (manual legs executed by hand, wall-clocked, outputs pasted). Writes submission/AGENT-ADVANTAGE-REPORT.md. Commit: `feat: TermiX agent advantage report (real runs)`.
- **GATE C5:** [ ] report has 3 tasks × both legs × time/cost/quality + outputs [ ] ≥1 trading/security task [ ] zero simulated timings [ ] **[CRITIQUE E-3] each task has a "Price + speed vs alternative" line w/ receipts; Task A states evaluation window + decision-quality-vs-spot (labeled calibration) + risk statement (TermiX trading trio, per PRD 7.8)**.

## C6 — Deploy (ARCH §16, §22)
- T6.1 Dockerfile+fly.toml; `fly launch --no-deploy && fly volumes create winnow_data --size 1 && fly secrets set … && fly deploy`. 
- T6.2 Smoke: /api/stats 200; hero flow on live URL cold; worker indexing (stats climbing). scripts/proof.ts on the VM. Commit: `chore: fly deploy config`.
- **GATE C6:** [ ] live URL public [ ] auto_stop=false verified [ ] healthcheck green [ ] index growing on VM.
#### DT-4 (Fly issues)
✅ deploy green → done. 🔀 better-sqlite3 native build fails → add `apt-get install python3 make g++` to deps stage. 🔀 volume mount issues → DB_PATH=/tmp + hourly kv backup to repo gist (degraded, banner). ⛔ Fly down → Railway fallback (railway.json equivalent, same Docker).
#### DT-2 (mainnet runbook — MORNING, after Dami funds)
Assert `cast balance 0xc211C942… --rpc-url bsc-dataseed` > 0.005e18 → run scripts/mainnet-runbook.ts steps 2–5 → regenerate proof → update README chain labels. If unfunded by 10:30 UTC → SUBMIT AS-IS (testnet writes + mainnet reads; Altana accepts testnet; README states it plainly).

## Forge→Build mapping: domain file (C0-T0.2), seed (C3-T3.3), tests-inline (gates), proof (C5/C6), /proof page (C4), test dirs (C0).
## Franchise skeleton: CLAIMS.md + verify-claims.ts + SECURITY.md + honesty ledger — all at C0-T0.2. ✓

---
# EXPANDED TASK DETAIL (commands, expected outputs, commits)

## C0 expanded
### T0.1 Scaffold
```bash
cd /Users/MAC/bnb-smart-money
npx create-next-app@14.2.15 winnow-app --ts --tailwind --app --src-dir --no-eslint --import-alias "@/*" --use-npm
cd winnow-app
# overwrite package.json deps per ARCHITECTURE §16, then:
npm i --fetch-retries=5 --fetch-timeout=120000
```
Expected: `added ~400 packages` with @altananetwork/sdk@0.9.0 in lockfile. If ETIMEDOUT: retry (known flake, R-9 register).
Commit: `chore: scaffold winnow app`
### T0.2 Franchise skeleton
Files: CLAIMS.md, SECURITY.md, DOMAIN-GUIDE.md (ARCH §17 contents), scripts/verify-claims.ts (ARCH §15 verbatim).
CLAIMS.md seed rows: "310,215 indexed target — evidence: /api/stats + scan cursor"; "probe txs 0x9c1275…/0xd40ae6… — evidence: testnet.bscscan.com".
Expected: `npx tsx scripts/verify-claims.ts` exits 0 printing zeros.
Commit: `docs: franchise skeleton (claims/security/domain/verifier)`
### T0.3 Foundation
Copy ARCH §3 config.ts + §4 db.ts exactly.
```bash
npx tsx -e "require('./src/lib/db'); console.log('tables ok')"
sqlite3 data/winnow.db ".tables"   # expect: agents attestations agent_actions grades kv probe_logs sessions
```
Commit: `feat: config + sqlite schema`
### GATE C0 checklist
- [ ] `npm run build` exits 0
- [ ] 7 tables listed
- [ ] verify-claims green
- [ ] git log shows 3 commits

## C1 expanded
### T1.1 chain.ts
```bash
npx tsx -e "import('./src/lib/chain').then(async m=>{console.log('testnet block', await m.pub.getBlockNumber()); console.log('mainnet block', await m.pubMain.getBlockNumber())})"
```
Expected: two increasing block numbers. Commit: `feat: viem clients + verified ABIs`
### T1.2 indexer
```bash
npx tsx -e "import('./src/lib/scan8004').then(async m=>{for(let i=0;i<3;i++) console.log('tick', await m.indexTick())})"
sqlite3 data/winnow.db "SELECT COUNT(*) FROM agents"
```
Expected: ticks return 100 each; count ≥300. **DT-3 first-response key check**: add one-off `console.log(Object.keys(j))`.
Commit: `feat: paced 8004scan indexer`
### GATE C1 checklist
- [ ] ≥200 agents rows
- [ ] second run resumes from cursor (count grows, no duplicates: COUNT(DISTINCT token_id)==COUNT(*))
- [ ] kv scan_budget increments

## C2 expanded
### T2.1 probe + grade
```bash
npx tsx -e "import('./src/lib/grade').then(async m=>console.log(await m.gradeAgent(56,49637)))"   # OpenOdds — expect liveness>=32
npx tsx -e "import('./src/lib/grade').then(async m=>console.log(await m.gradeAgent(56,341620)))"  # fresh shell — expect liveness 0, letter D/F
sqlite3 data/winnow.db "SELECT COUNT(*) FROM grades g JOIN probe_logs p ON p.id=g.probe_log_id"
```
Commit: `feat: probe engine + grades (FK invariant)`
### T2.2 attestor (WINNOW_CHAIN=testnet)
```bash
npx tsx -e "import('./src/lib/attestor').then(async m=>console.log(await m.attestPositive(2286,'liveness',100,'data:,probe-2287-evidence')))"
```
Expected: 0x… tx hash; testnet.bscscan.com shows giveFeedback input. Commit: `feat: guarded positive attestor`
### T2.3 invariants
`npx tsx scripts/verify-claims.ts` → orphanGrades=0 negativeAttestations=0. Commit: `test: invariant verifier green`
### GATE C2 checklist
- [ ] live agent >55 score, shell F, transcripts present
- [ ] attestation tx receipt status 1
- [ ] ALLOWED_TAGS guard: attestPositive(…,'spam',…) throws
- [ ] verifier green

## C3 expanded
### T3.1 Altana spike (30m hard box — DT-5)
```bash
cat node_modules/@altananetwork/sdk/dist/index.d.ts | grep -A8 "grantSession"   # param truth
npx tsx -e "…grantSession minimal on testnet…"   # exact call per d.ts findings
```
Expected: session object + keystore entry (check testnet.altana.network for operator wallet). On success persist handle: kv session_handle_{rowId}. Timeout 30m → DT-5b branch, log [SKILL] deviation in PULSE.
Commit: `feat: altana session layer (grant/revoke/overcap)`
### T3.2 strategies + worker
Resolve build-discovered inputs first:
```bash
# PCS_POOL: factory getPool(WBNB,USDT,500)
cast call 0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865 "getPool(address,address,uint24)(address)" 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c 0x55d398326f99059fF775485246999027B3197955 500 --rpc-url https://bsc-dataseed.bnbchain.org
# WATCH_ADDR: any address with active Aave debt — verify getUserAccountData returns totalDebtBase>0
cast call 0x6807dc923806fE8Fd134338EABCA509979a7e0cB "getUserAccountData(address)(uint256,uint256,uint256,uint256,uint256,uint256)" <candidate> --rpc-url https://bsc-dataseed.bnbchain.org
```
Then run worker 5 min: `WORKER=on npx tsx -e "import('./src/worker').then(m=>m.startWorker())"` → expect agent_actions rows with real Claude reasoning.
Commit: `feat: 4 reference agents + worker loops`
### T3.3 seed script (scripts/seed-agents.ts — implement from attestor/register patterns)
For each of 4 agents: register(dataURI w/ name/desc/category) on testnet identity → parse tokenId from Transfer log (probe pattern) → INSERT agents row (is_reference=1, category) → kv reference_agents append → gradeAgent() each.
Also: auto-categorize real agents — UPDATE agents SET category='health-factor' WHERE description LIKE '%liquidat%' OR '%health factor%' (etc per category keyword sets, ~30+ rows target), label as auto in UI (PRD 7.7).
Commit: `feat: seed reference agents + honest auto-categorization`
### GATE C3 checklist
- [ ] 4 ERC-8004 registrations w/ token ids recorded
- [ ] kv reference_agents has 4 entries w/ categories
- [ ] session grant visible (keystore/altana explorer) OR DT-5b documented in PULSE
- [ ] each category page query returns ≥1 reference agent
- [ ] agent_actions has ≥4 rows with non-canned reasoning

## C4 expanded
### T4.1 API routes — copy ARCH §13 all 7 + overcap-demo route. Test each:
```bash
curl -s localhost:3000/api/stats | jq .
curl -s "localhost:3000/api/agents?cat=yield" | jq '.items | length'
curl -s -X POST localhost:3000/api/reprobe -H 'content-type: application/json' -d '{"chain":56,"id":49637}' | jq .letter
```
Commit: `feat: api routes`
### T4.2 UI — copy ARCH §14. Cold-walk AC-1 locally (fresh incognito). Commit: `feat: ui hero flow`
### GATE C4: AC-1 items 1-4 + AC-2 + AC-4 all pass locally.

## C5 expanded
### T5.1 proof: `npm run proof` → submission/proof.md non-empty sections. Commit: `feat: proof generation`
### T5.2 advantage report: implement scripts/agent-advantage.ts per PRD 7.8. RUN both legs for 3 tasks NOW (manual legs by hand, honest wall-clocks). Commit: `feat: TermiX agent advantage report (real runs)`
### GATE C5: report has 3×2 legs, ≥1 trading, verbatim outputs, no simulated numbers; grep -c "Task" ≥3.

## C6 expanded
```bash
fly launch --name winnow-bsc --region iad --no-deploy --copy-config
fly volumes create winnow_data --size 1 --region iad -y
fly secrets set EVM_PRIVATE_KEY=… ANTHROPIC_API_KEY=… WINNOW_CHAIN=testnet ATTESTOR2_PRIVATE_KEY=… WATCH_ADDR=… PCS_POOL=…
fly deploy
curl -s https://winnow-bsc.fly.dev/api/stats | jq .
fly ssh console -C "node --experimental-strip-types scripts/seed-agents.ts"   # or npx tsx if bundled
```
Expected: stats 200 w/ counters; index grows between two curls 5 min apart (F-001).
Commit: `chore: fly deploy config`
### GATE C6: live URL public; auto_stop=false in `fly config show`; healthcheck passing; AC-1 cold-walk ON THE LIVE URL.

# TEST MATRIX (debug/stress input)
| Test | Command | Expect |
|---|---|---|
| unit: grade formula | tsx -e gradeAgent shell vs live | F vs >55 |
| invariant: orphan grades | verify-claims.ts | exit 0 |
| invariant: negative attest | attestPositive(value:-1) | throws |
| invariant: bad tag | attestPositive(tag:'x') | throws |
| api validation | POST /api/activate {capBnb: 9} | 400 |
| rate limit | 2× POST /api/reprobe same agent <20s | 429 second |
| probe timeout | probe agent w/ dead endpoint | ok:false, detail timeout, F |
| session overcap | POST /api/overcap-demo | reverted:true |
| worker resilience | kill -9 worker mid-tick, restart | cursor resumes, no dup rows |
| cold judge walk | Playwright AC-1 on live URL | zero uncaught errors |

# COMMIT LOG SPEC (progressive git, conductor pushes)
c0: chore/docs/feat foundation (4) → c1: indexer (2) → c2: probe/attest/verify (3) → c3: sessions/agents/seed (3) → c4: api/ui (2) → c5: proof/report (2) → c6: deploy (1) + tag pipeline/build.

# BUILD-AGENT REMINDERS (law pointers)
- INVARIANTS.md is law — re-read before C2 (attestor guards) and C4 (honesty surfaces).
- npm ALWAYS --fetch-retries=5 (R-9).
- getSummary needs clientAddresses (probe-proven gotcha) — any summary read enumerates clients from 8004scan /feedbacks first.
- Never `vercel` anything (env-clobber history); Fly secrets only.
- Every claim added to README goes through CLAIMS.md with evidence pointer first.

---
# PHASE GATES AS CHECKLISTS (conductor-checkable duplicates)

## Aggregate P0 gate (must all hold before deploy)
- [ ] INVARIANT 1: sqlite FK holds — `sqlite3 data/winnow.db "SELECT COUNT(*) FROM grades g LEFT JOIN probe_logs p ON p.id=g.probe_log_id WHERE p.id IS NULL"` → 0
- [ ] INVARIANT 2: `grep -n "value < 0" src/lib/attestor.ts` guard present; negative test throws
- [ ] INVARIANT 3: `curl /api/agents` returns rows with letter=null (ungraded listed)
- [ ] INVARIANT 4: Playwright cold walk zero uncaught errors
- [ ] INVARIANT 5: overcap-demo returns reverted:true
- [ ] INVARIANT 6: /proof + verify-claims agree with UI counters

## Decision-tree index (risk → tree)
| PRD risk | Tree | Location |
|---|---|---|
| R-1 scope | DT-1 | end of C2 |
| R-2 mainnet gas | DT-2 | C6/morning |
| R-3 8004scan | DT-3 | C1 |
| R-4 host | DT-4 | C6 |
| R-5 altana | DT-5/DT-5b | C3 |
| R-8 demo flake | DT-6 | C2/rehearsal |
| R-9/R-10 DeFi quirks | DT-7 | C3 |

# TIME FEASIBILITY ARITHMETIC (Metric 7)
C0 45m + C1 45m + C2 75m + C3 90m + C4 75m (parallel credit −45m) + C5 60m + C6 45m = 390m ≈ 6.5h vs ~8h available before QA phases → PASS with 1.5h buffer feeding pipeline QA.

# WHAT BUILD MUST NOT DO (negative space)
- Do not touch warroom/, research/, PULSE.md structure (append-only via protocol)
- Do not install packages beyond ARCH §16 without logging a [SKILL] deviation
- Do not switch WINNOW_CHAIN to mainnet before DT-2 preconditions
- Do not create a wallet-connect flow (D-10: server demo-operator custody)
- Do not "fix" a failing gate by weakening its assertion (ESCALATE, DON'T FABRICATE)

# HANDOFF TO DEBUG PHASE
Debug reads: GATE checklists above + TEST MATRIX + FEATURE-OBSERVABLES.md (F-001..F-006 with sentinel_fail patterns). Confidence target ≥90: all P0 gate boxes + AC-1/AC-2 + test matrix rows green on LOCAL; deploy-phase re-runs on live URL.

# APPENDIX: EXPECTED-OUTPUT REFERENCE (copy targets for gate evidence)
## /api/stats healthy shape (C6 smoke)
{"indexed":20000,"withEndpoints":800,"probed":150,"verifiedLive":40,"attestations":12,"indexComplete":false}
(numbers illustrative — REAL values recorded in BUILD-REPORT.md at each gate; illustrative ≠ claimable)

## verify-claims healthy output
{"indexed":<n>,"probed":<n>,"orphanGrades":0,"negativeAttestations":0}

## grade breakdown healthy shape (POST /api/reprobe)
{"score":78,"letter":"B","probeLogId":151,"breakdown":{"liveness":40,"meta":13,"feedback":24,"track":1}}

## session row healthy shape
{"id":1,"agent_token":<ref id>,"agent_wallet":"0x…","session_key":"0x…","cap_wei":"5000000000000000","expiry":<unix>,"grant_tx":"0x…","status":"live"}

## BUILD-REPORT.md skeleton (build phase emits; debug/verify read)
# BUILD REPORT — Winnow
## Gate evidence
| Gate | Item | Command | Actual output | Pass |
## Deviations from PLAN
| Task | Deviation | Why | PULSE tag |
## Build-discovered inputs resolved
| Input | Value | Discovery command |
## Known gaps handed to debug
- …

# APPENDIX: MORNING RUNBOOK CHECKLIST (DT-2 detail, ~20 min when funded)
1. [ ] `cast balance 0xc211C942946011859ca634F22400d80570ED12A5 --rpc-url https://bsc-dataseed.bnbchain.org` ≥ 5e15
2. [ ] `WINNOW_CHAIN=mainnet npx tsx scripts/seed-agents.ts --mainnet` (4 registrations; record ids)
3. [ ] fund each agent wallet 0.002 BNB (script step)
4. [ ] each agent: one real mainnet action (script executes; record tx hashes)
5. [ ] attestations: ATTESTOR2 attest each reference agent liveness=100 w/ evidence URI
6. [ ] `fly secrets set WINNOW_CHAIN=mainnet && fly deploy` (write-side flips; testnet history retained + labeled)
7. [ ] `fly ssh console -C "npm run proof"` → refresh submission/proof.md
8. [ ] README chain labels updated; CLAIMS.md rows appended w/ new txs
9. [ ] re-run AC-1 cold walk on live URL

# APPENDIX: PIPELINE-PHASE CROSSWALK (who consumes which PLAN artifact)
| Pipeline phase | Consumes from this PLAN |
|---|---|
| build | C0-C6 tasks + gates + BUILD-REPORT skeleton |
| debug | TEST MATRIX + Aggregate P0 gate + FEATURE-OBSERVABLES sentinels |
| wire | ARCH §24 Integration Map + gate evidence tx hashes |
| verify_milestone | THESIS obligations vs AC-1/2/3 results |
| stress_test | NFR table + safety layers L1-L4 + test matrix edge rows |
| deploy | C6 + DT-4 + fly.toml invariants (auto_stop=false) |
| livetest | AC-1 cold walk on live URL + F-001 growth check |
| demo_rehearsal | PRD DEMO FALLBACK MATRIX + DT-6 |
| demo | PRD §6 script + §6.1 VO text |
| package | PRD SUBMISSION FIELD DRAFTS + proof.md + AGENT-ADVANTAGE-REPORT.md |
| verify_preflight | INVARIANTS.md full sweep + MUST-NOT-CLAIM grep |
