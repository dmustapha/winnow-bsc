# Winnow Proof
Generated 2026-09-09T20:06:49.282Z
Write-side chain: BSC testnet (97). Every explorer link below is on https://testnet.bscscan.com. Market-data reads are BSC mainnet.

## Wallets (Altana submission requirement)
- Operator: 0xc211C942946011859ca634F22400d80570ED12A5
- Agent session key: 0x1719D75b9b384689E39ef3f14418B81c57054bEC (wallet 0xc211C942946011859ca634F22400d80570ED12A5)
- Agent session key: 0x29882D3Aee438E428A215de8dB76de6399e4c782 (wallet 0xc211C942946011859ca634F22400d80570ED12A5)
- Agent session key: 0x27C1D93eb02948ecDCf067d1c5001b5424bE4DD5 (wallet 0xc211C942946011859ca634F22400d80570ED12A5)
- Agent session key: 0x0f52831f53d63bDadBaC527eEFE6c888c2F17a7d (wallet 0xc211C942946011859ca634F22400d80570ED12A5)
- Agent session key: 0xE94565436Be44f1830044B0eDC606179a8C9de32 (wallet 0xc211C942946011859ca634F22400d80570ED12A5)

## Counters
- Committed snapshot (this file, generated from `seed/winnow-seed.db`): indexed=60907 probed=3358 verifiedLive=17
- Live on https://winnow-bsc.onrender.com (grows continuously): read the current values at https://winnow-bsc.onrender.com/api/stats and https://winnow-bsc.onrender.com/proof. As of 2026-09-09 the live host reported indexed=60907 probed=3733 verifiedLive=17, gradedByCat health-factor=8 yield=11 rebalancing=7 grid-trading=11 (all four categories graded).

## Reference agent registrations (ERC-8004 Identity 0x8004A818BFB912233c491871b3d84c89A494BD9e, chain 97)
- Winnow Sentinel (health-factor): agent #2288, register tx https://testnet.bscscan.com/tx/0x7394ddf4deefd3e445ddbc579d3943c91d7b81ab749d2261625f64f4e8738333
- Winnow Harvester (yield): agent #2289, register tx https://testnet.bscscan.com/tx/0x46a9673bf3ddf92d57a096ec3d6ff76ad32cac85f2d2410b76e5acb6d6f980b6
- Winnow Ranger (rebalancing): agent #2290, register tx https://testnet.bscscan.com/tx/0xef0aa79db88b2928b250787dd480cc8b4b6733b6c32e22cf8e52845d1ae222a0
- Winnow Gridsmith (grid-trading): agent #2291, register tx https://testnet.bscscan.com/tx/0x34f5ec2b3c1aac42eb89ac9450c0273c8e4fc07fd71584ca2ad9aa603780fd19
- A2A cards served at https://winnow-bsc.onrender.com/api/a2a/{slug} (a2a_endpoint rows point at the live deployment; graded via public probes)

## Attestations
- [metadata=12] agent#2286 tx https://testnet.bscscan.com/tx/0xa35e384cc957f27ff3cb16f24ab765e0f1a0f1b72ada1ca589e30ec73cb0796b
- [metadata=7] agent#2287 tx https://testnet.bscscan.com/tx/0x43980a03874ea116c9e6cfd01e3515547ecc3a6c84577ec3eb041ad8faa0d063
- [liveness=32] agent#2288 tx https://testnet.bscscan.com/tx/0xd09508a9d8efb27b22000e645d7977ad54831f4614647f5ad3df6518f6e22280

## Sessions (Altana Keystore 0x6b8361C29d05D498b1a12B54A37310f94171E94A | full lifecycle)
- #1 agent#0 cap=2000000000000000wei expiry=1788933378 status=revoked
  - grant https://testnet.bscscan.com/tx/0xdbf1c7489b9cccdcbe68c81bb2a34ff3faf2010b03399eeb551ccf4f99017d64
  - revoke https://testnet.bscscan.com/tx/0x890694c2867215529d4a7ee1034117d3b16d22b738bde02487bedb5f24b6337d
- #2 agent#2288 cap=2000000000000000wei expiry=1788934061 status=revoked
  - grant https://testnet.bscscan.com/tx/0x172b0cd48322dfd0b23ba644c71486a9c4c2716285155d851fe1eec5e6a2275b
  - revoke https://testnet.bscscan.com/tx/0x261f91f51b625aa2c3ff40e5cadaf629b2399e48643f5b78537722f193a8cf75
- #3 agent#2288 cap=2000000000000000wei expiry=1788934206 status=revoked
  - grant https://testnet.bscscan.com/tx/0x1f54e43cfbcca5bf3975316fd0814d20cd6cb14f0017f6a41fd6a93d55987f19
  - revoke https://testnet.bscscan.com/tx/0xef79fa86f092bc38f61d08829c7aaf2a7c613c59445d97062715b42a69e46515
- #4 agent#2288 cap=2000000000000000wei expiry=1788934292 status=revoked
  - grant https://testnet.bscscan.com/tx/0xb4433aeec60cbe2f57f570e4217a3aeec6c0cade5bc24da6b978ce3c265f5953
  - revoke https://testnet.bscscan.com/tx/0x98660860c5c6bc6b77b8f6349438d774d8e137d91119c936079040d5bed3226c
- #5 agent#2288 cap=5000000000000000wei expiry=1789013634 status=live
  - grant https://testnet.bscscan.com/tx/0x569185684eea4ac90ea3ece3ec716a1f29d142e09d003a4969b9a25bc76b6697
- #6 agent#2288 cap=5000000000000000wei (0.005 BNB) status=live (standing judging-window session; re-granted every ~2 days to keep the Altana leash live through Sep 23)
  - Current grant tx (2026-09-09, expiry 1789157899, session_key 0x6bc302C9275e41219de9E37506315F0CFFf6F761): https://testnet.bscscan.com/tx/0x49e8cf5195039672367728b062f27968f6b2af6bf84575babe96d35d885f7251
  - Prior grant (still valid onchain): https://testnet.bscscan.com/tx/0x08e0a0215801840eaf1a61bd77522014588891f41351f669584165ce8948d875
  - The live standing session is always the current #6 at https://winnow-bsc.onrender.com/api/sessions (a redeploy reseeds and the standing session is re-granted). Do NOT revoke it during judging.

## Session lifecycle receipts (INVARIANT 5)
- In-cap execute (session #4 path, 0.0001 BNB signed by the session key, inside the cap): https://testnet.bscscan.com/tx/0xe22694b915ac1ef35f4028cc52f4fe7c7f634dd30b69581839fed97386d28b10 (receipt status 0x1)
- Full lifecycle on a fresh session (grant, in-cap capped spend, revoke), all receipts status 0x1:
  - grant https://testnet.bscscan.com/tx/0x49ad9032a7205e4a1b74b1a0848e0d42924ab46cf44c8eea13fad42ade7cc8b8
  - in-cap capped spend (the in-UI "capped spend" button path): https://testnet.bscscan.com/tx/0xd4eb4e03a1a2f1a425cb76e1bc3a220711acf4d3da4df20345d25442a44484e3
  - revoke https://testnet.bscscan.com/tx/0xb54c5db4adff7291f382dcac8dda425ea05d24350c59a003d47adf2bc43f56ac
- Over-cap attempt: rejected with `ExceededSpendLimit` before any transaction lands; the absence of a tx IS the enforcement evidence. Recompute live: `RUN_LIVE=1 npx tsx tests/falsify/overcap-live.test.ts` (60s cooldown).

## Agent action txs
- hf_check https://testnet.bscscan.com/tx/0x3936ca8b0417fc9a4f3d8a254a6c8637710294ebfd9db2f5188600a5cdb64fe1
