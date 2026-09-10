# Winnow Demo Shotlist

Final video: `demo/winnow-demo.mp4` (1920x1080, 30fps, H.264, faststart, 162.4s)
Built by stitching the best existing raw take per scene. No captions burned in (this ffmpeg build lacks the drawtext filter; clean cuts used instead, per task allowance).

| Scene | Title | Source clip | Duration | Shows | Fallback / notes |
|-------|-------|-------------|----------|-------|------------------|
| 1 | Landing | scene1-landing.webm | 16.8s | Winnow landing, BSC testnet, live health | Clean, existing |
| 2 | Category browse | scene2-category.webm | 17.6s | Category filtering across agents | Clean, existing |
| 3 | Agent page, re-probe live | scene3-reprobe.webm | 18.2s | Agent detail page, live re-probe | Clean, existing |
| 4 | Activate, the session grant | scene4-session-row.webm | 17.6s | Fresh session row (session #9, granted via rehearsed curl) | Used script's session-row beat; activate takes with relay retries discarded |
| 5 | See it transact, real capped spend | scene5-spend.webm | 27.7s | Real capped-spend tx 0xfabc2048...d336f52 | Live; BscScan 403s bots so /proof fallback used in-scene |
| 6 | Prove the leash | scene6-leash.webm | 44.5s | Overcap attempt against the leash | Live; historical revert narrated per script |
| 7 | Revoke, then proof | scene7-revoke.webm (trimmed to 20s) | 20.0s | Revoke of session #9, revoked-sessions list populates | Trailing locator timeout (waiting for the already-revoked #9 card) trimmed off; revoke content fully intact |

## Scene sourcing summary
- All 7 scenes came from EXISTING raw captures. Zero re-recording needed.
- Scene 7's tail was trimmed (20.48s -> 20.0s) to drop the post-success locator timeout; the on-chain revoke had already fired and the page settled into a clean post-revoke state.

## Safety
- Standing live session #6 was never touched. Scene 4/7 operate only on session #9 (granted this run for the demo).
- No app code modified, nothing pushed.
