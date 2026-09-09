# SUBMISSION CHECKLIST — Build the Era (Smart Money Era)

**Platform:** Google Form intake (https://forms.gle/9g9XPNFwnYaHAz9L8)
**Deadline:** 2026-09-09 12:00 UTC (noon). **STATUS: SUBMITTED ~11:05 UTC 2026-09-09.**
**Judging window:** Sep 9 to 23 — deployment must stay LIVE the entire window.

## Submission-readiness (each PASS/GAP)
- [PASS] Form submitted before deadline (FORM-ANSWERS.md is the record)
- [PASS] Project name, repo URL, live URL, description, partner tickboxes, wallet address all provided
- [PASS] GitHub repo PUBLIC (HTTP 200)
- [PASS] Live app reachable (HTTP 200), /proof reachable (HTTP 200)
- [PASS] Agents surfaced are LIVE on BSC (mainnet-indexed corpus + 4 testnet reference agents, chain labels honest)
- [PASS] Four categories, equal depth: all 4 A2A cards return 200, gradedByCat covers all 4
- [PASS] Demo video exists in-repo (submission/demo-video.mp4, 162s) — form has no video field
- [PASS] One entry (solo)

## Partner-track requirements
- [PASS] **Altana:** wallet addresses in submission; full session lifecycle onchain (grant/in-cap spend/over-cap revert/revoke) all status 0x1; standing session #6 live; in-product view + revoke
- [PASS] **TermiX:** Agent Advantage Report attached (3 tasks both ways, 1 trading task with window + risk, outputs attached)
- [PASS] **PancakeSwap:** rebalancer + grid agents on PCS v3 primitives, capped and read-heavy, benefit called out
- [PASS] All three partner tracks ticked (PancakeSwap, AltLayer, TermiX; Altana carried in Notes)

## Honesty gates
- [PASS] Zero em-dashes in judge-facing prose (README, description, proof.md, CLAIMS.md, AGENT-ADVANTAGE prose); em-dashes preserved only inside verbatim LLM-output and transcript blocks
- [PASS] proof.md current: session #6 (live) + session #7 capped-spend lifecycle + live counters noted; all 18 tx hashes status 0x1
- [PASS] Testnet-vs-mainnet stated honestly; LLM state stated honestly (pluggable gateway, real reasoning present, live ticking host-env-dependent)
- [PASS] HONESTY-LEDGER covers Real / Simplified / Not-built
- [PASS] LICENSE present (MIT)

## Judging-window maintenance (Sep 9 to 23)
- [ ] Keep host awake (external keep-warm every ~10 min) — OWNER: user
- [ ] Keep an Altana session live; never revoke #6; re-grant via POST /api/activate if it lapses — OWNER: user
- [ ] Do not push app-source changes that could break the live app; doc-only is fine (redeploy re-seeds; re-grant session if wiped)
