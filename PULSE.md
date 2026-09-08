# PULSE — Pipeline Rolling Context

## Active Facts
| Fact | Source | Phase |
|------|--------|-------|

## Decisions Log
| Decision | Rationale | Phase |
|----------|-----------|-------|

## Downstream Items
<!-- Owner-routed, non-blocking deferred work. Every skill reads on entry, actions rows it owns. See PULSE-PROTOCOL § Downstream Items. -->
| ID | Raised by | Owner phase | Pri | Item | Acceptance | Status |
|----|-----------|-------------|:---:|------|-----------|:------:|

## Skill Sections

### intel — 2026-09-08T22:15Z

#### Done
- ID 9 deep intel: 4 parallel research agents, ~124 tool calls, 40+ sources. research/research-brief.md written (all required sections + kill list). config.json E1-E7 extractions complete. Roster audit: 20 entrants (research/roster-audit/strategy-density.md). Quality auto-assessed 5.0/5.

#### Additions
- [NEW] 8004scan API live-probed and confirmed open (not in original brief): api.8004scan.io/api/v1, OpenAPI at /openapi.json, 310,215 BSC agents, 30 req/min free.
- [NEW] Submission form located + full field extraction: https://forms.gle/9g9XPNFwnYaHAz9L8 — NO video field, NO live-URL field; GitHub README carries all proof.

#### Deviations
- [SKILL] Phase 2 social review skipped (autonomous mode) — compensated via GitHub roster + 8004scan issue-tracker mining.
- [SKILL] Wave 3 Copilot/Grid skipped (no PAT; Grid corpus Solana-centric) — roster audit substituted.

#### Verified Facts
- DEADLINE 2026-09-09 12:00 UTC (NOON — registration form header).
- ERC-8004 BSC: Identity 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432, Reputation 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 (testnet 97: 0x8004A818BFB912233c491871b3d84c89A494BD9e / 0x8004B663056A597Dffe9eCcC1965A193B7388713). ValidationRegistry NOT deployed anywhere.
- Altana Keystore BSC 0x6572427ED530BadcF7375Cf9A4709D8d2b0E7E0a (testnet 0x6b8361C29d05D498b1a12B54A37310f94171E94A); SDK @altananetwork/{sdk 0.9.0, mcp 0.9.0, x402-server 0.2.0}; MCP requires Bun>=1.1.
- Data-quality whitespace: ~4% of BSC agents declare live endpoints; 59.2% Sybil reviewers; 77.9% of rated agents have zero valid feedback after filtering (arXiv 2606.26028); 0 validations globally.
- 4 HIGH-threat competitors: Marque (mainnet PCS rebalance receipts, marque.trade), KaizenScope (verify-gated payments), AgentEra (TermiX report done), SmartSentinels (mainnet agents in all 4 categories).
- PCS agent contracts: NPM 0x46A15B0b27311cedF172AB29E4f4766fbE7F4364, VenusLens 0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA, Aave v3 Pool 0x6807dc923806fE8Fd134338EABCA509979a7e0cB, Multicall3 0xcA11bde05977b3631167028862bE2a173976CA11.
- b402.ai Vistara SDK archived Apr 2026; Venus API non-authoritative for liquidation safety (use VenusLens RPC); browser x402 blocked by CORS (server-side only).

#### Assumptions
- [ASSUMED] Demo video 2-3 min, linked in README/Description (no published requirement; form has no video field).
- [ASSUMED] "Agents live on BSC" reads as mainnet for eligibility; Altana explorer txs may be testnet (explicitly allowed for the bounty).

#### Blockers for Downstream
- None.

#### Key Decisions
- [AUTO] Social review + Copilot/Grid skipped with substitutes (see Deviations).

#### For Next Skill
- Deliverable is PRESCRIBED (the marketplace). Warroom deliberates DIFFERENTIATION, not what-to-build. Lead whitespace axis = DATA QUALITY (Sybil-filtered reputation, live endpoint verification, onchain performance receipts) — it is both the competitor gap AND a named judging criterion.
- All 4 bounties stack into one coherent build: Altana sessions power the "activate" step; PCS agents cover rebalancing+yield; TermiX Agent Advantage Report is generated FROM the marketplace's own agents.
- Kill list highlights: raw-count directory over 8004scan (20+ teams building it), ValidationRegistry trust, mock agents, single-category depth, b402 SDK.
- ~13.5h remain. "Agents live on BSC" is an eligibility gate — plan how our surfaced agents become REAL (Altana skills playbooks + own reference agents registered in ERC-8004).
