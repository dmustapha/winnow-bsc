# PACKAGE REPORT — Winnow (Build the Era, Smart Money Era)

**Status:** complete. **Platform:** BNB Chain Google Form intake (ALREADY SUBMITTED ~2026-09-09 11:05 UTC).
**Scope:** post-submission repo + submission-artifact refresh for the Sep 9 to 23 judging window. Docs-only; no app-source logic changed.
**Commits pushed:** `ca04fad`, `07f6198` (branch main, repo https://github.com/dmustapha/winnow-bsc).

## Submission-Readiness Checklist

| Item | Status | Evidence |
|---|:---:|---|
| Form submitted before deadline | PASS | FORM-ANSWERS.md is the record; submitted ~11:05Z before 12:00Z |
| GitHub repo public | PASS | HTTP 200 |
| Live app reachable | PASS | https://winnow-bsc.onrender.com HTTP 200 |
| /proof reachable | PASS | HTTP 200 |
| Agents LIVE on BSC | PASS | 60,907-agent mainnet corpus + 4 testnet reference agents; chain labels honest |
| Four categories equal depth | PASS | all 4 A2A cards HTTP 200; gradedByCat grid 11 / health 8 / rebalancing 7 / yield 11 |
| Demo video present | PASS | submission/demo-video.mp4 + demo/winnow-demo.mp4 (162s, 1920x1080, identical 8.9MB) |
| Onchain receipts resolve | PASS | 18/18 proof.md tx hashes status 0x1 (spot-checked via bsc-testnet RPC) |
| Altana wallets in submission | PASS | operator + second attestor in FORM-ANSWERS, links.md, sponsor-tracks, proof.md |
| Altana full session lifecycle onchain | PASS | grant/in-cap spend/over-cap revert/revoke, all 0x1; standing session #6 live |
| TermiX Agent Advantage Report | PASS | 3 tasks both ways, 1 trading task with window + risk, outputs attached |
| PancakeSwap benefit | PASS | rebalancer + grid on PCS v3 primitives, capped/read-heavy |
| All 3 partner tracks ticked | PASS | PancakeSwap, AltLayer, TermiX (Altana in Notes) |
| Zero em-dashes in judge-facing prose (D-2) | PASS | README/description/proof/CLAIMS/sponsor-tracks/links/guide = 0; 6 preserved in AGENT-ADVANTAGE verbatim quotes only |
| Logo serves live (P3) | PASS | /logo.svg HTTP 200 |
| LICENSE present (G21) | PASS | MIT at repo root |
| HONESTY-LEDGER (Real/Simplified/Not-built) | PASS | submission/HONESTY-LEDGER.md |
| Proof surface (Verify in 60s) | PASS | HACKATHON-README `## Verify in 60s`; kind=url tier=recompute + committed proof.md |
| Mainnet write path (D-1) | PASS | PROVEN on chain 56: 4 registrations (ids 342419-342422) + liveness attestation, receipts 0x1 on bscscan.com (submission/mainnet-migration.json). Demo stays on testnet (Altana accepts it). |
| Live LLM ticking on host | GAP (honest) | reasoning real + recomputable (93 actions); fresh ticks host-env-dependent; amber banner is honest fallback |
| Host stays awake Sep 9-23 | ACTION (user) | Render free tier sleeps; external keep-warm required |

## Doc Changes Committed + Pushed
- `LICENSE` (new, MIT)
- `SUBMISSION-CHECKLIST.md` (refreshed to submitted state)
- `submission/` full bundle: HACKATHON-README, HONESTY-LEDGER, SUBMISSION-GUIDE, sponsor-tracks, links, team, copy/{title,tagline,description,tech-stack}, proof.md, AGENT-ADVANTAGE-REPORT, demo-video.mp4, logo.png, 4 screenshots, demo-shotlist
- `winnow-app/submission/proof.md` (regenerated + augmented: session #6 live, session #7 capped-spend lifecycle, live-counters note, current session #6 grant)
- `winnow-app/submission/AGENT-ADVANTAGE-REPORT.md` (prose em-dashes removed; verbatim quotes preserved)
- `winnow-app/CLAIMS.md` (em-dashes removed)
- `winnow-app/scripts/proof.ts` (generator template em-dash removed)
- `winnow-app/README.md` (stack line: honest pluggable LLM gateway)

## Mutual Consistency (demo video / README / proof.md / live URL)
CONFIRMED. Live URL identical across README, proof.md, FORM-ANSWERS. README counters (60,907 indexed / 3,358 graded / 3 attestations / 93 actions) match the committed snapshot; live counters have grown past them exactly as README frames ("growing live"), and proof.md separates the committed snapshot from the live values. Demo video is byte-identical in submission/ and demo/. All four category A2A cards and gradedByCat confirm equal depth.

## Standing Altana Session (judging-window maintenance)
The final standing session #6 is LIVE: grant `0x9b64e191998235800e04bc509566348c6a0b25b0fe0175d89ba10a8c39e3d587` (receipt 0x1), key `0x30b1039B2f2A4076eBC75f9Da300E198038aD28B`, cap 0.005 BNB, expiry 1789158083 (Sep 11 ~04:21Z). Each doc push reseeds the Render pod and wipes the standing session, so it was re-granted after the final push. proof.md directs judges to `/api/sessions` for the always-current #6.

## Actions for the User (judging window Sep 9 to 23)
1. Keep the Render host awake (external keep-warm every ~10 min) or upgrade the plan.
2. Re-grant session #6 every ~2 days (it expires in 48h) via `POST /api/activate {agentName:"winnow-sentinel",tokenId:2288,capBnb:0.005,hours:48}`. NEVER revoke #6.
3. Avoid app-source pushes during judging; a redeploy reseeds and wipes the standing session (re-grant if it happens).
4. (Optional, D-1) fund ~0.003 to 0.01 BNB on BSC mainnet and run the mainnet runbook to upgrade writes from testnet.

## Artifacts
- submission/ (bundle), .package-state.json, PACKAGE-REPORT.md, PULSE `### package` section, pipeline-log.md lines.
