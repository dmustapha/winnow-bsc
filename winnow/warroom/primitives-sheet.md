---
event_class: open_buildathon
event_class_source: declared
pack_version: 1
pack_date: 2026-09-08
gap_map: present
sponsor_vintage: present
---

# Working Primitives Sheet — Build the Era (Smart Money Era)

### F23 — Guest-verifiable recompute proof surface as product [lane: whitespace]
**Mechanism:** Ship a proof surface a cold stranger can re-run without wallet/seed/builder-present: the marketplace's trust grades (live-endpoint probe, Sybil-cluster filter, burned-agent detection) are recomputable — every grade links the raw onchain evidence + a re-runnable probe.
**Receipts:** Proof-surface presence win-correlated (~24/47 corpus); routedock/Mirror losses had no guest-runnable proof. Aimed at NAMED whitespace #1 (trust-graded data at scale).
**Adaptation axes:** WHAT is proven (agent liveness/reputation validity, not token claims); WHO verifies (hiring user + judges).
**Saturation:** fresh
**Loss-twin:** a static "trust score" column with no recompute path — reads as vibes, dies as vanity metric.

### F21 — Closed-loop detect→diagnose→REMEDIATE with a validated artifact [lane: whitespace]
**Mechanism:** Don't stop at detecting dead/Sybil agents — close the loop: the marketplace's probe engine writes its findings BACK onchain as ERC-8004 feedback (tagged liveness/quality attestations), producing a machine-validated artifact any other app can read. Aimed at NAMED whitespace #4 (the marketplace as proof-of-work venue that feeds the reputation graph).
**Receipts:** Detect-only shapes (dashboards, scanners) lose; remediation loops with validated artifacts win (L10 actor-beats-observer, PROVEN 3 events). The BSC ReputationRegistry is live but empty of honest signal — "66 agents probed, none carried on-chain reputation."
**Adaptation axes:** WHAT remediated (registry data quality itself); WHERE written (canonical ReputationRegistry 0x8004BAa1…, readable by everyone).
**Saturation:** fresh
**Loss-twin:** probe results kept in the marketplace's private DB — invisible onchain, judges see another dashboard.

### F12 — Attenuated delegation / session-auth capability layer [lane: sponsor-newest]
**Mechanism:** Object-capability session layer between user and agent: scoped call-allowlist + spend cap + expiry, granted/revoked by the owner, registered publicly. The marketplace's "activate agent" IS a session grant; "fire agent" IS a 1-tx revocation.
**Anchored on:** Altana sessions/Keystore + SDK v0.9 + x402-server v0.2 (shipped Jul-Sep 2026, docs.altana.network + npm)
**Receipts:** Session-auth shapes won across agent-economy events; Altana explorer shows only 175 keys total — near-zero real integrations. Aimed at whitespace #2.
**Adaptation axes:** WHO grants (end user in-product, not dev in CLI); WHERE surfaced (marketplace UI, not explorer).
**Saturation:** fresh
**Loss-twin:** sessions mentioned in pitch but granted via CLI off-screen — Altana judges read onchain and see nothing.

### F07 — Meta-layer over existing volume [lane: cross-pollination]
**Mechanism:** Don't build new agents or a new registry — build the LAYER over the 310K already-registered agents and live DeFi volume (PCS/Venus). Forced axis-shift (WHAT): from "list agents" to "grade + underwrite agents" — the marketplace as rating agency over an existing market.
**Receipts:** Meta-layer wins where venues already have volume; BSC uniquely has the volume (largest ERC-8004 corpus).
**Adaptation axes:** WHAT layered (trust/underwriting vs price); WHO consumes (hirers + other agents via API).
**Saturation:** fresh
**Loss-twin:** meta-layer over an EMPTY market (no live agents) — layer over shells is shells.

### F06 — Trader-to-operator delegation [lane: cross-pollination]
**Mechanism:** Change the user's ROLE: not a DeFi trader clicking swaps but an OPERATOR of a hired workforce — delegated agent-wallets execute inside user-set charters. Forced axis-shift (WHO): trader→employer; the marketplace is an HR department for money-agents (hire, brief, monitor, fire).
**Receipts:** Pacifica winners question-shifted roles; trader→operator template confirmed.
**Adaptation axes:** HOW controlled (charter/session vs manual approval); WHAT hired (4 category workforces).
**Saturation:** fresh
**Loss-twin:** "employer" framing as pure copywriting over an unchanged swap UI.

### F14 — Self-funding agent economy loop [lane: core]
**Mechanism:** The agent is INSIDE the economic loop: hired agents earn $U/USDT per job via ERC-8183 escrow or x402 per-call, pay their own inference, and their earnings feed their public track record.
**Receipts:** L10 PROVEN (3 events) — actor beats observer; OKX winners all stood inside the economy.
**Adaptation axes:** WHICH rail (8183 escrow vs x402 metering); WHOSE loop (marketplace takes no custody).
**Saturation:** warm
**Loss-twin:** dashboard that OBSERVES agent earnings without any value flowing through the product.

### F16 — Missing-institution-of-the-agent-economy [lane: core]
**Mechanism:** Treat the agent economy as the ecosystem and build its missing institution — here, the labor market/hiring hall with employment records (who hired whom, outcome, wage) written onchain.
**Receipts:** Missing-institution meta-family finals repeatedly; the organizer literally says the venue doesn't exist.
**Adaptation axes:** WHICH institution (hiring hall + credit bureau hybrid); WHAT record (ERC-8183 jobs as employment history).
**Saturation:** warm
**Loss-twin:** "institution" as static directory — an institution must process transactions, not list members.

### F17 — Guardian / dry-run co-signer between actor and costly action [lane: core]
**Mechanism:** A deterministic gate between hired agent and user funds: pre-hire dry-run (simulate the agent's play on a fork/quote) + spend-cap enforcement; the REFUSAL/revert is demoable.
**Receipts:** L2 PROVEN — refusal-as-climax won (Consilium, Backstop lineage); protection narratives win BNB events (4/10 Good Vibes winners).
**Adaptation axes:** WHAT gated (hire activation vs every tx); WHO sees refusal (user + judge).
**Saturation:** warm
**Loss-twin:** guardian that only warns in UI text — no onchain enforcement, no revert to show.

### F13 — Per-unit metering / citation-toll nanopayments [lane: core]
**Mechanism:** Smallest unit of consumption = payment event: agents (and TermiX judges) pay per data call via x402/B402; the marketplace's own trust-data API is itself a sellable x402 endpoint.
**Receipts:** Metering shapes won across payment-rail events; B402 is production on BSC.
**Adaptation axes:** WHAT metered (trust-grade lookups, probe runs); WHO pays (other agents — A2A).
**Saturation:** warm
**Loss-twin:** paywall on data nobody demonstrably wants — metering without a proven consumer.

### F09 — Named-buyer productized trading agent [lane: core]
**Mechanism:** The modal "AI trading agent" only wins when productized for ONE named buyer with receipts; here inverted: every listed agent must carry a named-buyer-grade spec sheet (strategy, window, win rate, risk taken) or be down-ranked.
**Receipts:** Virtuals finance winners differentiated on provable track records; TermiX weights trading track records 20%.
**Adaptation axes:** WHO enforces the spec (marketplace listing standards); WHAT proven (real windowed P&L).
**Saturation:** warm
**Loss-twin:** multiplier claims (40.6x!) without window/risk disclosure — AgentEra's exact exposure.
