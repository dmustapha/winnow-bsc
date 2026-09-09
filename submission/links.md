# Submission Links

## Required
- [x] Live app: https://winnow-bsc.onrender.com HTTP 200
- [x] Proof page: https://winnow-bsc.onrender.com/proof HTTP 200
- [x] GitHub repo (public): https://github.com/dmustapha/winnow-bsc HTTP 200
- [x] Agent Advantage Report (TermiX): https://github.com/dmustapha/winnow-bsc/blob/main/winnow-app/submission/AGENT-ADVANTAGE-REPORT.md HTTP 200
- [x] Onchain receipts: https://github.com/dmustapha/winnow-bsc/blob/main/winnow-app/submission/proof.md HTTP 200
- [x] Demo video (in-repo, rot-proof): submission/demo-video.mp4 (also demo/winnow-demo.mp4, 162s, 1920x1080). The BNB intake form has no video field; the video ships in-repo.

## Live reference-agent A2A cards (four categories, equal depth)
- [x] Winnow Sentinel (health factor): https://winnow-bsc.onrender.com/api/a2a/winnow-sentinel HTTP 200
- [x] Winnow Harvester (yield): https://winnow-bsc.onrender.com/api/a2a/winnow-harvester HTTP 200
- [x] Winnow Ranger (rebalancing): https://winnow-bsc.onrender.com/api/a2a/winnow-ranger HTTP 200
- [x] Winnow Gridsmith (grid trading): https://winnow-bsc.onrender.com/api/a2a/winnow-gridsmith HTTP 200

## Composed contracts (BSC testnet, chainId 97)
- [x] ERC-8004 Identity: `0x8004A818BFB912233c491871b3d84c89A494BD9e`, https://testnet.bscscan.com/address/0x8004A818BFB912233c491871b3d84c89A494BD9e
- [x] ERC-8004 Reputation: `0x8004B663056A597Dffe9eCcC1965A193B7388713`, https://testnet.bscscan.com/address/0x8004B663056A597Dffe9eCcC1965A193B7388713
- [x] Altana Keystore: `0x6b8361C29d05D498b1a12B54A37310f94171E94A`, https://testnet.bscscan.com/address/0x6b8361C29d05D498b1a12B54A37310f94171E94A

## Wallets (Altana requirement)
- Operator: `0xc211C942946011859ca634F22400d80570ED12A5`
- Second attestor: `0x5e6cBAb6C130C21f329209697e050773f72F92c1`

## Verification Status
All required links verified: 6/6 passing. All 4 A2A cards 200. Contract explorer pages render in-browser (testnet.bscscan.com returns 403 to non-browser clients such as curl by design; verified via the live app and the browser).
Onchain receipts: 18/18 tx hashes in proof.md return status 0x1 (spot-checked via https://bsc-testnet.bnbchain.org eth_getTransactionReceipt).
Last verified: 2026-09-09 (package phase).
