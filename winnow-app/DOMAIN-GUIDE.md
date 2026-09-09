# DOMAIN-GUIDE — Winnow (generated from ARCHITECTURE §17 spec)

Source basis: research-brief.md + live probe evidence gathered in forge. Rules of the road: INVARIANTS 1–6 (see INVARIANTS.md in the plan set; enforced by scripts/verify-claims.ts and schema).

## ERC-8004 (Trustless Agents)
- **agentId**: each agent is an NFT token in the Identity Registry (`register(string agentURI) returns (uint256)`); the URI points at the agent's registration file (name, description, endpoints).
- **Registration file**: JSON metadata — name, description, image, service endpoints (MCP server, A2A endpoint), x402 support.
- **Feedback**: Reputation Registry `giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)` — signature proven live (tx 0xd40ae6…, testnet).
- **getSummary gotcha**: `getSummary(agentId, clientAddresses, tag1, tag2)` REVERTS with "clientAddresses required" when `clientAddresses` is empty — always pass a non-empty array.
- Registries: BSC mainnet Identity 0x8004A169…a432 / Reputation 0x8004BAa1…9b63; testnet pair 0x8004A818…BD9e / 0x8004B663…8713.

## Sybil / coordinated feedback
- Coordinated-feedback rings inflate reputation scores (cf. arXiv 2606.26028). Winnow uses a **coordinated-feedback heuristic** (repeat-client concentration) as a caution signal — never claimed as proven sybil classification, never written onchain (INVARIANT 2).

## Altana sessions
- A **session** = a scoped key grant: allowlisted targets, spend **cap**, **expiry** — enforced by the onchain **Keystore** (BSC 0x6572427E…, testnet 0x6b8361C2…) via `isValidKey`. Over-cap `execute` reverts onchain (INVARIANT 5).
- **Revocation** is a single transaction; `isValidKey` flips immediately.

## ERC-8183
- Job escrow standard ($U): jobs funded into escrow, released on acceptance — context for the agent-economy narrative (not a Winnow write path tonight).

## Probing protocol
- **MCP initialize**: POST the MCP `initialize` handshake to the agent's `mcp_server`; a valid response = liveness evidence.
- **A2A agent card**: fetch the agent card from `a2a_endpoint`; a well-formed card = liveness/metadata evidence.
- Every probe writes a raw transcript to `probe_logs`; a grade cannot exist without one (INVARIANT 1).

## Categories
`rebalancing`, `grid-trading`, `yield`, `health-factor`. Reference agents are flagged `is_reference=1`; third-party agents get keyword-heuristic categories, labeled honestly.

## Grade formula (D-5)
score = liveness(0–40) + metadata(0–15) + feedback(0–30) + track(0–15)
Letters: A ≥85, B ≥70, C ≥55, D ≥40, else F. Unprobed = null (ungraded ≠ unlisted — INVARIANT 3).
