# Submission Guide: Build the Era (Smart Money Era)

Platform: BNB Chain Google Form intake (https://forms.gle/9g9XPNFwnYaHAz9L8)

## Status: SUBMITTED
The intake form was submitted on 2026-09-09 (about 11:05 UTC), before the noon UTC deadline. This guide now serves two purposes: (1) a record of what was submitted, and (2) the judging-window maintenance runbook for Sep 9 to 23.

## What Was Submitted
Paste-ready field values are in `submission/FORM-ANSWERS.md`. Summary:
- **Project:** Winnow
- **Live:** https://winnow-bsc.onrender.com
- **Proof:** https://winnow-bsc.onrender.com/proof
- **Repo:** https://github.com/dmustapha/winnow-bsc
- **TermiX report:** repo `winnow-app/submission/AGENT-ADVANTAGE-REPORT.md`
- **Onchain receipts:** repo `winnow-app/submission/proof.md`
- **Partner tracks ticked:** PancakeSwap, AltLayer, TermiX (Altana entry carried in the Notes field)
- **Wallet (BEP-20):** 0xc211C942946011859ca634F22400d80570ED12A5

## Before Judging (verify once)
- [x] GitHub repo is PUBLIC (HTTP 200)
- [x] Live app reachable (HTTP 200) and /proof reachable (HTTP 200)
- [x] All four A2A cards reachable (HTTP 200)
- [x] 18/18 onchain receipts return status 0x1
- [x] Demo video in-repo at submission/demo-video.mp4 and demo/winnow-demo.mp4

## Judging-Window Maintenance (Sep 9 to 23): CRITICAL
1. **Keep the host awake.** Render free tier sleeps on idle; the brief requires public accessibility for the full window. Keep an external keep-warm pinging https://winnow-bsc.onrender.com every ~10 minutes, or upgrade the Render plan (one billing toggle).
2. **Keep an Altana session live.** A standing session must stay live for the Altana leash story to hold. Session #6 is live now. If it expires or is revoked, re-grant with:
   ```bash
   curl -X POST https://winnow-bsc.onrender.com/api/activate \
     -H 'content-type: application/json' \
     -d '{"agentName":"winnow-sentinel","tokenId":2288,"capBnb":0.005,"hours":48}'
   ```
   Then confirm at https://winnow-bsc.onrender.com/api/sessions . **Never revoke session #6.**
3. **Do not push app-source changes** that could break the live app during judging. Doc-only updates are fine, but note that a push triggers a Render redeploy and the fresh pod re-seeds; if the standing session is wiped, re-grant per step 2.
4. **Warm the URL ~5 minutes before** any live judge visit you can anticipate; the first load after sleep can 502 then recover.

## Partner-Track Recap
- **Altana:** wallets in submission; full session lifecycle onchain (grant / in-cap spend / over-cap revert / revoke), all status 0x1; in-product view and revoke. See `submission/sponsor-tracks.md`.
- **TermiX:** Agent Advantage Report attached (3 real tasks both ways, one trading task with window + risk).
- **PancakeSwap:** rebalancer and grid agents on PCS v3 primitives, capped and read-heavy, no user funds at risk.

## Media
- Cover / hero: `submission/screenshots/hero.png`
- Additional: `submission/screenshots/{category,agent-detail,proof}.png`
- Logo: `submission/logo.png`
- Demo video: `submission/demo-video.mp4` (162s, 1920x1080)

## Missing Items
None. All artifacts present. The BNB intake form has no video or live-URL field; the repo README and /proof carry all proof, and the video ships in-repo.
