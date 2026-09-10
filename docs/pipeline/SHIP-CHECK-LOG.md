# Ship-Check Log — Winnow

Gate: `ship-check.sh --post-deploy`. Result: all checks pass except one link row, which is a documented tooling false-positive with onchain evidence.

## PASS
- git tree clean, HEAD == origin/main
- hygiene: no state/.env files tracked, no secret patterns
- deploy: https://winnow-bsc.onrender.com returns 200
- mutation probe: POST /api/reprobe {"chain":97,"id":2288} returns 200 (real live regrade)

## The one FAIL is a false-positive (explorer + RPC links)
ship-check does a GET on every URL in the docs. Two link classes cannot be fetched by a bot but are fully valid:

1. **bscscan.com / testnet.bscscan.com return 403.** BscScan is behind Cloudflare and blocks automated GETs. Every transaction and address link resolves in a real browser. Each referenced tx was independently verified onchain via RPC `eth_getTransactionReceipt`:
   - Mainnet register 0x1ca72a78... -> status 0x1
   - Mainnet attestation 0xf645d888... -> status 0x1
   - Testnet 0x172b0cd4... -> status 0x1
   - All 18 testnet + 5 mainnet receipts verified 0x1 during livetest and the mainnet migration (see submission/proof.md and submission/mainnet-migration.json).

2. **bsc-dataseed.bnbchain.org / bsc-testnet.bnbchain.org return 404 to GET.** These are JSON-RPC endpoints (POST-only). They appear inside reproducible `cast --rpc-url ...` command examples in AGENT-ADVANTAGE-REPORT.md and a "verified via RPC" note in links.md. They are proven working: the receipt verifications above used them.

Removing real explorer proof links or breaking reproducible cast commands to satisfy a bot-based check would make the submission worse, not better. The links are kept; this log is the evidence they resolve.
