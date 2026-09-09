# CLAIMS: Winnow (append-only)

Every public claim (README, demo, submission) gets a row here with an evidence pointer.
A claim without recomputable evidence does not ship. Verifier: `npm run verify` (scripts/verify-claims.ts).

| # | Claim | Evidence pointer | Status |
|---|---|---|---|
| 1 | 310,215 indexed target (BSC ERC-8004 agents) | /api/stats + kv scan_cursor progression | INDEXING (target, not achieved count, see ledger) |
| 2 | Reputation write pattern proven on BSC testnet | probe txs 0x9c1275… / 0xd40ae6…, testnet.bscscan.com. VERIFIED-in-forge |
| 3 | Every grade backed by a real probe transcript | grades.probe_log_id NOT NULL FK → probe_logs.transcript; verify-claims orphanGrades=0 | STRUCTURAL |
| 4 | No negative findings written onchain | verify-claims negativeAttestations=0 + attestor guard (value>=0, allowlisted tags) | STRUCTURAL |

## Honesty Ledger
Things we do NOT claim, and the exact honest wording we use instead:

- We do NOT claim "all 310K agents probed/verified". Honest wording: "indexed all; probed N, growing". Counters are live and recomputable from the DB.
- We do NOT claim proven "sybil detection". Honest wording: "coordinated-feedback heuristic (method note)".
- We do NOT claim mainnet coverage while writes are testnet. Every explorer link is labeled with its chain.
- We do NOT publish any APY/P&L multiplier without window + risk statement + tx receipts.
- Category assignment of indexed third-party agents is a keyword heuristic, labeled as such in the UI.
