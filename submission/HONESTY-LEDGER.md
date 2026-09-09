# Honesty Ledger

This is a strength signal, not a weakness section: it states exactly what is real so a judge never has to guess.

## Real
- **Live marketplace** at https://winnow-bsc.onrender.com, public through the Sep 9 to 23 judging window. Zero-knowledge walletless journey (land, browse by category, open an agent, re-derive its grade) works end to end.
- **Honest recomputable grades.** Every grade joins a raw probe transcript by a NOT NULL foreign key; the "Re-probe now" button re-derives a grade live (verified at C/69 in about 1 second this session). Counters are DB-derived and match `/api/stats`.
- **Full onchain Altana session lifecycle** on BSC testnet: grant, in-cap capped spend, over-cap revert (`ExceededSpendLimit`), and revoke, all receipts status 0x1. Standing judging-window session #6 is live and verifiable at `/api/sessions`. In-product view and revoke are shipped.
- **Onchain writeback.** Verified liveness becomes an ERC-8004 `giveFeedback` attestation on the canonical Reputation Registry (three attestation receipts, status 0x1). A second signer is used because the spec bars self-feedback.
- **Four categories, equal depth.** Each seeded by a live reference agent (health factor via Aave, yield via Venus, rebalancing and grid via PancakeSwap v3) serving a real A2A card at `/api/a2a/{slug}`, graded by the same engine as everyone else. All four cards return 200.
- **Real LLM reasoning is present and recomputable.** The reference agents produced 93 real agent actions with model-generated reasoning (visible on each agent page and in the DB). The LLM backend is pluggable: an OpenAI-compatible gateway (AgentRouter / DeepSeek) configured through host env, with Anthropic and local Claude CLI as fallbacks.
- **TermiX Agent Advantage Report:** three real tasks run both ways with wall-clocks, costs, a rubric, and outputs attached, including a trading task with a window label and risk statement.
- **Tested.** 65/65 stress checks including a 43-case adversarial API battery with zero 500s, worker kill -9 recovery, and a falsification suite that feeds the grader lies and asserts red.

## Simplified
- **The deployed demo writes on BSC testnet (chainId 97); market-data reads are BSC mainnet (chainId 56).** Every explorer link is labeled with its chain. The Altana track explicitly accepts testnet, so the demo stays on testnet for zero-cost judging. The write path is ALSO proven on BSC mainnet: all four reference agents are registered on the canonical mainnet ERC-8004 Identity registry (ids 342419 to 342422) with a liveness attestation on the mainnet Reputation registry, receipts status 0x1 on bscscan.com (see proof.md, "Mainnet migration").
- **Altana custody model:** sessions are granted from one operator EIP-7702 smart wallet with per-agent wallets as allowlisted call targets, a custody-minimizing demo design. Per-agent Altana wallets are the roadmap; the Keystore enforcement is identical either way.
- **Live LLM ticking depends on host env.** The agent reasoning feed is real and recomputable, but fresh unattended ticks on the live host only occur when the gateway env is set on that pod; when there is no fresh action for over 10 minutes the landing page shows an honest amber "reasoning paused" banner rather than canned reasoning. Grades and probes stay live regardless.
- **Grading coverage grows continuously.** The registry is 310,000+ agents; the app has probed a few thousand and the counters say exactly how far it has gotten. Ungraded never means hidden.
- **Feedback-validity score is a heuristic** (a published coordinated-farming pattern), surfaced as caution in the UI and never rendered onchain as an accusation. Method note in the footer.
- **Host is a free tier that can sleep on idle.** First load after idle can take about 40 seconds to wake; an external keep-warm is used through the judging window. An always-on upgrade is one billing toggle.

## Not built (stated plainly)
- **x402 / B402 sell-side** for agent-to-agent commerce was scoped and cut for this window (labeled a spec stub in the plan). The Altana session hire flow is the shipped payment-context primitive.
- **Full mainnet demo deployment** (indexing, grading, and the interactive app pointed at chain 56) is not the live deployment: the demo stays on testnet because the Altana track accepts it and it keeps judging zero-cost. The mainnet write path itself IS proven (four registrations plus a liveness attestation on the canonical mainnet registries, receipts status 0x1).
- **Per-agent independent Altana wallets** (each agent signing from its own smart wallet) are roadmap, not shipped.

## Security note for judges
The committed seed database (`winnow-app/seed/winnow-seed.db`) contains testnet session private keys for the demo sessions and reference-agent wallets, all capped (0.005 BNB/24h), expiry-bounded, and testnet-only. This is a known, accepted-for-window condition (rewriting git history mid-judging is riskier than the bounded testnet exposure). Public write endpoints (`/api/activate`, `/api/revoke`, `/api/reprobe`) are rate-limited and have an SSRF guard on the prober; do not revoke the standing session #6 during judging.
