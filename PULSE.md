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
**Status:** COMPLETE (ID 9, auto-quality 5.0/5)
**Key outputs:** research/research-brief.md · config.json (E1-E7) · research/roster-audit/strategy-density.md

**Active Facts (add to table):**
- DEADLINE 2026-09-09 12:00 UTC (NOON — registration form) | intel | intel
- Submission = Google Form https://forms.gle/9g9XPNFwnYaHAz9L8; NO video field, NO live-URL field — GitHub README carries all proof | intel | intel
- 8004scan API open no-auth: api.8004scan.io/api/v1, 310,215 BSC agents, 30 req/min | intel | intel
- ERC-8004 BSC: Identity 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432, Reputation 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 (testnet: 0x8004A818...BD9e / 0x8004B663...8713) | intel | intel
- Altana Keystore BSC 0x6572427ED530BadcF7375Cf9A4709D8d2b0E7E0a (testnet 0x6b8361C2...E94A); SDK @altananetwork/{sdk,mcp,x402-server}; MCP needs Bun>=1.1 | intel | intel
- Data-quality whitespace: only ~4% BSC agents have live endpoints; 59.2% Sybil reviewers; 0 validations globally (arXiv 2606.26028) | intel | intel
- 4 HIGH-threat competitors: Marque (mainnet PCS rebalance receipts), KaizenScope, AgentEra (TermiX report done), SmartSentinels (mainnet agents all 4 categories) | intel | intel
- ValidationRegistry NOT deployed; b402.ai SDK archived; Venus API non-authoritative for liquidation — use VenusLens RPC | intel | intel

**Decisions:**
- [AUTO] Phase 2 social review skipped (autonomous); compensated via GitHub roster + 8004scan issue tracker | intel
- [AUTO] Wave 3 Copilot/Grid skipped (no PAT; Solana-centric corpus) — roster audit substituted | intel

**For Next Skill (warroom):**
- Deliverable is PRESCRIBED (marketplace). Deliberate differentiation strategy, not what-to-build. Whitespace map: research/roster-audit/strategy-density.md — lead axis = DATA QUALITY (Sybil-filter, endpoint verification, onchain receipts); it is both the gap AND a judging criterion.
- All 4 bounties stack into one build: Altana sessions = activation layer; PCS agents = rebalancing+yield categories; TermiX report = proof artifact.
- Kill list: raw-count directory over 8004scan (20+ teams), ValidationRegistry trust, mock agents, single-category depth.
- ~13.5h remain. Live agents on BSC are an eligibility gate — plan how agents become real (Altana skills playbooks + own reference agents).
