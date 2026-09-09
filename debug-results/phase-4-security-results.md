# Phase 4 — Structural Security Audit (Winnow)

## Secrets scan
- Grep for private keys / API key prefixes across tracked files: only public tx hashes, event topics, and zero-bytes32 constants. **No secrets in tracked code.**
- `.env` NOT tracked (git ls-files shows only `.env.example`; `.env` matched by `.gitignore:39`). Initial "tracked" alarm was `git check-ignore` echoing the pathname — verified with `git ls-files -s` (empty) and history (`git log --all -- .env` empty).
- `.env.example`: placeholders only (`0xplaceholder`, `sk-ant-placeholder`).

## Config audit
- No debug/admin/test routes under `src/app/api` (routes: a2a, activate, agent, agents, overcap-demo, reprobe, revoke, sessions, stats).
- No CORS headers configured anywhere → Next.js same-origin defaults, no wildcard exposure.
- Rate limits on write/chain routes: activate global 60s ✓, reprobe 20s/agent ✓, overcap-demo 60s/session ✓, **revoke: NONE → SECURITY-MEDIUM, FIXED** (10s/session cooldown; first revoke never blocked — kill-switch semantics preserved). Typecheck clean.
- Env vars referenced in code vs `.env`: all present (EVM_PRIVATE_KEY, ATTESTOR2_PRIVATE_KEY, ANTHROPIC_API_KEY, WINNOW_CHAIN, DB_PATH, WATCH_ADDR, PCS_POOL, BSC_RPC, BSC_TESTNET_RPC; PORT/WORKER/NEXT_RUNTIME are runtime-optional).

## Contract-class checks
- No project-owned Solidity (interacts with deployed ERC-8004 + Altana Keystore only) → gas snapshot, event emission, reentrancy scans N/A (`projectComponents.contracts=false`).

## Mock leak scan
- No `jest.mock` / `vi.mock` / `sinon` anywhere. Tests hit the real SQLite DB and real endpoints.
- One deliberate stub: `debug-p2-risk-paced-retry.test.ts` scripts `globalThis.fetch` — a deterministic 8004scan 5xx cannot be triggered on demand. Real-path coverage delegated to wire (PULSE DH-6).

## Dispositions
| Finding | Severity | Disposition |
|---|---|---|
| /api/revoke no rate limit (gas-burning public write) | MEDIUM | FIXED (10s/session cooldown) |
| fetch stub in retry test | NOTE | documented; DH-6 → wire |

Zero CRITICAL, zero HIGH remaining.
