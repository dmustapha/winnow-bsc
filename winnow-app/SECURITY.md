# SECURITY — Winnow custody & write-safety model

## Key custody
- **Operator key** (`EVM_PRIVATE_KEY`, 0xc211C942946011859ca634F22400d80570ED12A5): lives ONLY in Render environment variables (prod) or a local untracked `.env` (dev). Never committed, never sent to the browser, never printed in logs.
- **Agent session keys**: generated at seed time, capped (`cap_wei`) and expiring (`expiry`) via the Altana Keystore — enforcement is onchain (`isValidKey`), not a UI label. Revoke is one transaction.
- **Optional second attestor key** (`ATTESTOR2_PRIVATE_KEY`): same handling as operator key.
- No wallet-connect wall for judges: activation uses a server-held demo-operator wallet, rate-limited, tiny caps (D-10).

## Altana wallet model
Sessions are granted from a single operator EIP-7702 smart wallet; each reference agent has its own wallet that serves as the session's allowlisted call target. This is a deliberate custody-minimizing demo design: one funded key to protect, every grant still individually capped, expiring, and revocable onchain. Per-agent Altana wallets, where each agent holds and signs from its own smart wallet, are the roadmap item that follows this demo. The enforcement story (Keystore caps, allowlists, expiry, one-click revoke) is identical in both models.

## Onchain write policy
- The attestor writes ONLY non-negative values with allowlisted tags (`liveness`, `metadata`). A single guard sits before every `giveFeedback` send; negative findings never go onchain (INVARIANT 2). Caution signals are UI-side wording only.
- Write-side chain is testnet until the morning mainnet runbook (D-6/D-12); every explorer link is chain-labeled.

## App-layer safety (ARCH §20)
- L1: zod validation on every API input.
- L2: rate limits — re-probe 20s/agent, activate 60s global, 8004scan pacer 30/min + 900/day budget.
- L3: circuit breakers — RPC fallback transport, scan budget guard, LLM-absent → skip-and-log (never fabricate).
- L4: graceful degradation — stale-cache banners, category empty-states, probe timeout = honest verdict.
