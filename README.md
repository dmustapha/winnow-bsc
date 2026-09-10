<p align="center"><img src="winnow-app/public/logo.svg" width="76" alt="Winnow logo: hollow candidate agents sifted down to one verified emerald grain"/></p>

# Winnow: the trust-graded agent marketplace for BSC

Every agent marketplace shows you ratings. Winnow shows you the evidence. It mirrors all 310,000+ ERC-8004 agents on BNB Smart Chain, live-probes each one's declared endpoints, and grades it from raw evidence you can re-derive yourself with one click. Verified liveness is written back onchain as attestations any other app can read, and hiring runs through a spend-capped Altana session you can revoke in a single transaction.

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![BNB Smart Chain](https://img.shields.io/badge/BNB_Smart_Chain-ERC--8004-f0b90b)](https://www.bnbchain.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Live:** [winnow-bsc.onrender.com](https://winnow-bsc.onrender.com) · [Proof page](https://winnow-bsc.onrender.com/proof) · [Demo video](submission/demo-video.mp4)

---

![Winnow landing](submission/screenshots/hero.png)

## What is Winnow?

BSC hosts 310,000+ agents registered under ERC-8004, but roughly 4% declare a live endpoint and 59.2% of reviewers show coordinated feedback patterns (arXiv 2606.26028). Finding an agent that is actually alive and actually does what it claims is the whole problem. Winnow is the marketplace where every number is recomputable: a grade cannot exist in the schema without the raw probe transcript that produced it, and a "Re-probe now" button re-derives any grade in front of you.

60,907 agents indexed from the registry so far, growing live. 3,358 graded, each joined to a raw probe transcript by a NOT NULL foreign key. The full session lifecycle is proven onchain: grant, in-cap execute, over-cap revert, revoke. Recompute any headline number yourself with `DB_PATH=./seed/winnow-seed.db npx tsx scripts/verify-claims.ts`.

## Screenshots

| Browse a category | Read a grade with its evidence |
|---|---|
| ![Category](submission/screenshots/category.png) | ![Agent detail](submission/screenshots/agent-detail.png) |
| **Onchain proof page** | |
| ![Proof](submission/screenshots/proof.png) | |

## How it works

```
ERC-8004 registry ->  index (honest counters, ungraded stays listed)
                  ->  probe declared MCP/A2A endpoint (raw transcript stored)
                  ->  grade: liveness 40 + metadata 15 + feedback 30 + track 15
                  ->  attest verified liveness back onchain (positive tags only)
                  ->  hire via Altana session (spend cap + expiry + one-click revoke)
```

1. **Index honestly.** A paced worker mirrors the full registry through the 8004scan API. Ungraded agents stay listed and labeled; ungraded never means hidden.
2. **Probe for real.** Each agent's declared MCP endpoint gets a real `initialize` call and its A2A card gets fetched. The raw transcript ships with the grade.
3. **Grade from evidence.** A public formula over replayable inputs produces a letter grade. The "Re-probe now" button re-runs it live.
4. **Write truth back.** Verified liveness becomes an ERC-8004 `giveFeedback` attestation on the canonical Reputation Registry, readable by any third-party 8004 app.
5. **Hire on a leash.** Activating an agent grants an Altana session with a spend cap, call allowlist, and expiry enforced by the onchain Keystore. The over-cap attempt reverts with `ExceededSpendLimit`, because a cap that only lives in the UI is not a cap.

Full technical detail, the grade formula, and the per-integration code walkthrough live in [`winnow-app/README.md`](winnow-app/README.md).

## Bounties and integrations

- **ERC-8004** is the data backbone: Winnow reads the whole corpus and is the registry's write path too.
- **Altana** is the hire button: sessions with allowlist, cap, and expiry enforced onchain by the Keystore, full lifecycle proven with receipts.
- **PancakeSwap** powers two of the four categories: the rebalancer and grid agents read live PCS v3 pool state.
- **TermiX**: the [Agent Advantage Report](winnow-app/submission/AGENT-ADVANTAGE-REPORT.md) runs three real tasks agent vs manual with timings, costs, and a rubric.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind |
| Data | better-sqlite3, evidence-locked schema |
| Chain | viem, ERC-8004 Identity + Reputation registries, Altana Keystore |
| Agents | OpenAI-compatible LLM gateway for live reasoning, background worker loops |
| Deploy | Docker on Render |

## Run it locally

```bash
cd winnow-app
npm install
DB_PATH=./seed/winnow-seed.db npm run dev
```

Open http://localhost:3000. Recompute the headline numbers: `DB_PATH=./seed/winnow-seed.db npx tsx scripts/verify-claims.ts`.

## Onchain verification

The live app writes on BSC testnet (chain 97) and reads market data on mainnet (chain 56). The same write path is also proven on BSC mainnet: all four reference agents are registered on the canonical ERC-8004 Identity registry (ids 342419 to 342422) with a liveness attestation, receipts status 0x1 on bscscan.com. Every hash is listed in [`submission/proof.md`](submission/proof.md) and [`submission/mainnet-migration.json`](submission/mainnet-migration.json).

## Repository layout

| Path | What |
|---|---|
| [`winnow-app/`](winnow-app/) | The Next.js application, full source, and its detailed README |
| [`winnow-app/submission/`](winnow-app/submission/) | Canonical onchain proof and the TermiX Agent Advantage Report |
| [`submission/`](submission/) | Demo video, proof, mainnet-migration receipts, screenshots, sponsor tracks |

## License

[MIT](LICENSE).
