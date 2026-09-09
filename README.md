<p align="center"><img src="winnow-app/public/logo.svg" width="72" alt="Winnow logo"/></p>

# Winnow: the trust-graded agent marketplace for BSC

Every agent marketplace shows you ratings. Winnow shows you the evidence: every grade is recomputable in front of you, and verified liveness is written back onchain for any other app to read.

**Live app: https://winnow-bsc.onrender.com** · [Proof page](https://winnow-bsc.onrender.com/proof) · [Demo video](demo/winnow-demo.mp4)

Built solo for BNB Chain's Build the Era hackathon (Smart Money Era). Bounties targeted: Altana, TermiX, PancakeSwap.

## What it does

BSC hosts 310,000+ ERC-8004 agents, but only about 4% declare a live endpoint and 59.2% of reviewers show coordinated feedback patterns (arXiv 2606.26028). Finding a real agent is the whole problem. Winnow mirrors the full registry with honest counters, live-probes each agent's declared MCP/A2A endpoints, and grades from raw evidence with a "Re-probe now" button that re-derives any grade live (a grade cannot exist without its probe transcript in our schema). Verified liveness is written back to the canonical ERC-8004 Reputation Registry as attestations. Hiring runs through an Altana session: spend cap, call allowlist, and expiry enforced by the onchain Keystore, with one-click revoke and a demoed over-cap revert.

## Where things are

| Path | What |
|---|---|
| [`winnow-app/`](winnow-app/) | The Next.js app (full source), and its detailed [README](winnow-app/README.md) |
| [`winnow-app/README.md`](winnow-app/README.md) | Full technical writeup: stack, grade formula, integration showcase, how to run |
| [`winnow-app/submission/proof.md`](winnow-app/submission/proof.md) | Every onchain receipt: testnet lifecycle plus the BSC mainnet migration |
| [`winnow-app/submission/AGENT-ADVANTAGE-REPORT.md`](winnow-app/submission/AGENT-ADVANTAGE-REPORT.md) | TermiX report: 3 real tasks run agent vs manual |
| [`demo/winnow-demo.mp4`](demo/winnow-demo.mp4) | 162s walkthrough of the full judge journey |
| `PRD.md`, `ARCHITECTURE.md`, `PLAN.md`, `INVARIANTS.md` | Design and build documents |

## Run it locally

```bash
cd winnow-app
npm install
DB_PATH=./seed/winnow-seed.db npm run dev
```

Then open http://localhost:3000. Recompute the headline numbers yourself: `DB_PATH=./seed/winnow-seed.db npx tsx scripts/verify-claims.ts`.

## Proof at a glance

- Live write path on BSC testnet (chain 97) and additionally proven on BSC mainnet (chain 56): 4 reference agents registered on the canonical ERC-8004 Identity registry plus a liveness attestation, receipts status 0x1 on bscscan.com (see [proof.md](winnow-app/submission/proof.md)).
- Altana full session lifecycle onchain: grant, in-cap execute, over-cap revert with `ExceededSpendLimit`, revoke.
- Four categories, each seeded by a live reference agent (Aave, Venus, PancakeSwap v3) serving real A2A cards.

License: [MIT](LICENSE).
