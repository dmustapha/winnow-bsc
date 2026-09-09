# BNB CHAIN "BUILD THE ERA — SMART MONEY ERA" — Research Brief
**Compiled:** 2026-09-08 (~14h before deadline)
**Intel Depth:** ID 9 (Deep Intelligence)
**Sources:** Web research via 4 parallel deep-research agents (~124 tool calls, 60+ fetches/searches). Social intel: skipped (autonomous run).

---

## Overview

| Field | Value |
|-------|-------|
| Name | Build the Era — Smart Money Era |
| Organizer | BNB Chain |
| Platform | bnbchain.org + Google Form intake |
| **Deadline** | **2026-09-09 12:00 UTC (noon — confirmed on registration form)** [A1] |
| Judging | Sep 9–23 (app must stay live), top-3 public shortlist, Phase 2 criteria REDACTED, winner Nov 5 |
| Tracks | Main (marketplace) + Altana 50K XP + TermiX $10K + PancakeSwap 1000 CAKE + AltLayer perks |
| Chain | BSC mainnet (56) / testnet (97) |
| Native token | BNB; agent-economy token **$U** (18d, EIP-3009-capable) |

### Submission Requirements
- Google Form **https://forms.gle/9g9XPNFwnYaHAz9L8** before deadline [A1]
- Functional + publicly accessible during judging Sep 9–23; agents surfaced must be LIVE on BSC; one entry per team
- Altana bounty: wallet address(es) + txs visible in explorer.altana.network; TermiX: Agent Advantage Report attached

---

## Demo Video Requirements
**NOT FOUND** [A1 — all 4 tabs, blog, press, form checked]. No length/format specified; the form has **no video field at all**. Assumption: include video link inside Project Description / GitHub README. Default 2–3 min per BNB conventions. `[ASSUMED]`

---

## Submission Form Fields (E2 — Package skill checklist) [A1]
Email* · Full Name* · Email Address* · Telegram Handle* · X Handle* · Discord · How did you hear* · Country+Timezone* · Solo/Team* · Teammate count/names/emails/roles · **Project Name*** · **One-Line Pitch*** · **Project Description*** · **Sub-prize tracks*** (PancakeSwap / AltLayer / TermiX / Not sure) · **GitHub Repo Link*** · Prototype Stage* (Fresh idea / Early prototype / Working MVP) · BSC/EVM experience · Areas of comfort · Mentorship* · Availability confirm* · **Wallet address*** (BEP-20) · Notes · Terms*

**CRITICAL:** No live-URL field and no video field → the GitHub README carries the live link, video, and all proof. The Description field must sell everything. Note "Sub-prize tracks" checklist omits Altana as a tickbox option (Altana requires wallet addresses in submission instead — use Notes + README).

---

## Disqualifiers (E3)
- Agents not live on BSC [A1]
- Not functional/publicly accessible during Sep 9–23 judging [A1]
- More than one entry per team [A1]
- TermiX bounty: missing Agent Advantage Report [A1]
- Altana bounty: no session txs visible in Altana explorer [A1]

---

## Prizes

| Track | Prize | Notes |
|-------|-------|-------|
| Main | $30,000 USDT | + OFFICIAL ADOPTION as canonical BNB Agent Studio marketplace (standalone product, BNB backing) |
| TermiX | $6,000 / $3,000 / $1,000 | independent judging, report mandatory |
| Altana | 50,000 XP | winner-take-all, allocation TBC |
| PancakeSwap | 1,000 CAKE (~$300) | best real benefit to PCS traders/LPs |
| AltLayer | 8004scan Pro + AltLLM credits | amounts TBC |

---

## Judging Criteria

| Criterion | Weight | What it means | How to score high |
|-----------|:---:|---|---|
| Functionality | ~33% (unpublished) | Land → find by category → understand → activate, zero friction, no dead ends | A zero-context user completes the full journey; nothing 404s; activation actually works |
| Data Quality | ~33% | Real-time accurate data "beyond basic counts" enabling an informed hire decision | Live onchain performance, verified endpoints, Sybil-filtered reputation — not vanity registration counts |
| Agent Diversity | ~33% | All 4 categories equal depth | Equal-quality agents + data + UX per category; no "main event + afterthoughts" |

**BOTTOM LINE:** The grand prize is *adoption as an official product*. Judges are effectively acquiring a product, not scoring a demo. Durability, data integrity, and UX polish outweigh cleverness. **EVIDENCE:** "This isn't a demo day. Whatever you ship here is what real users interact with next." [A1] **CONFIDENCE:** High. **SO WHAT:** Build production-grade; keep it live for 2 weeks; make data quality the visible differentiator.

---

## Event Class & Judge Reading
- **Event class:** `open_buildathon` (organizer-judged, prescribed deliverable, published rubric)
- **Why:** 3 BNB Chain judges score independently against a published rubric; partner bounties sponsor-judged on own criteria.
- **Judge reading:** BNB Chain ecosystem/product team choosing a product to adopt + sponsor engineers who verify onchain (Altana reads the explorer; TermiX literally hires from your marketplace). Historically BNB judges reward live, on-chain-verifiable, protection/trust-flavored products (Good Vibes Only: 4/10 winners were protection/security; AGOS marketplace won with verified onchain agent-to-agent settlement).
- **Sponsor vintage (L5, ~90 days):** BNB Agent Studio + `bag` CLI (Aug 2026) · Agent Studio v2 with ERC-8183 end-to-end (Aug 18) · Altana SDK v0.9 / MCP / x402-server v0.2 (Jul–Sep 2026, CertiK audit Jul 15) · 8004scan mainnet + open API (Jan 2026→v0.4.370 now) · ERC-8004 BSC explosion (72.8K new agents in 30 days pre-July).

---

## Workshop Signals (E4)
Only signal found: Altana ran a live workshop + office hours during the build period [A1 resources tab] → Altana integration is heavily supported/expected. No other workshop schedule published.

---

## Tech Deep Dive

### BNB Agent Studio [B2]
- CLI: **`bag`** — `npm i -g @bnbagent/studio-cli` (v0.0.13, Node ≥22). Docs: **https://docs.bnbchain.org/developer-kit/bnbchain-studio/** (quickstart, configuration, cli-reference, deployment, security).
- `bag skills install` → detects Cursor/Claude Code, installs 10 skills + `/bnbagent-studio` router. Scaffolds TS agent (`studio.toml`, `sellerCore.ts`, immutable `signing.ts`). `bag mcp serve` = MCP (:8000) + A2A JSON-RPC (:9000).
- Deploy: BNB managed trial (testnet only), AWS AgentCore, Azure Foundry. Wallets: evm-local | TWAK | **Altana**. LLM: Pieverse default, or OpenRouter/OpenAI/Anthropic.
- x402 default-on: agent self-pays in **$U** on BSC, gasless EIP-3009; `/x402` endpoint; ERC-8183 escrow path for negotiated jobs (negotiate → signed quote → fund escrow → notify_funded → verify → deliver). Buyer constraint: `maxTimeoutSeconds ≤ 480`, $U via eip3009 only.
- **Reference agents for the 4 categories: NOT published** (promised in launch PR, never shipped; bnb-chain/bnbagent-studio repo is 404/private). Closest: Altana skills catalog + TermiX bsc-mcp. → We must SOURCE or BUILD the live agents ourselves.

### Altana (full SDK map) [A1]
- Packages: `@altananetwork/sdk` v0.9.0 · `@altananetwork/mcp` v0.9.0 (needs **Bun ≥1.1**; `claude mcp add altana -- bunx @altananetwork/mcp`, `ALTANA_CHAIN=bnb-testnet`) · `@altananetwork/x402-server` v0.2.0. Repo: github.com/altananetwork/altana-sdk.
- Flow: `createClient({chains:[BNB]})` → `createWallet({signer})` → activation self-call tx → `grantSession({permissions:{calls:[{to}], spend:[{limit,period,token}]}, expiry})` → `execute({session, calls})` → `revokeSession()`. Sessions enforced ONCHAIN (revert outside allowlist/cap).
- **Keystore on BSC: `0x6572427ED530BadcF7375Cf9A4709D8d2b0E7E0a`** (testnet 97: `0x6b8361C29d05D498b1a12B54A37310f94171E94A`). Free `isValidKey` reads. Revocation = 1 tx, monotonic.
- ERC-8183 (job escrow: OPEN→FUNDED→SUBMITTED→COMPLETED, $U budget): `hireErc8183Agent(wallet, signer, {provider, task, budget}, {network: BNB})` — one atomic intent; works via session keys. Seller: `submitErc8183Deliverable(session, {jobId, manifest, deliverableUrl})` — manifest keccak256-verified, serve `manifestText` verbatim. `getErc8183Job`, `settleErc8183Job`, dispute/refund. Addresses via `ERC8183_ADDRESSES` export (read from node_modules).
- x402/B402: `fetchWithX402({session, url})` client (server-side only — CORS blocks X-PAYMENT in browser); seller `createX402Merchant({chainId:56, payTo, price, rails:[eip3009 $U, permit2-exact USDT], facilitator, rpcUrl})` + `merchant.guard(req)`. Needs Permit2 + signature-checker approvals (2 txs).
- Skills = **markdown playbooks (SKILL.md: Reference + Plays), self-hosted execution through the agent's own session**; registry index.json carries required session scope; fork-tested/certified. 10 production skills incl. PancakeSwap Trading/Liquidity, Venus Lending, Aave V3, Lista, Copy Trade, Token Radar, Wallet Tracker, x402 API Payments.
- Explorer: **explorer.altana.network** (mainnet) / **testnet.altana.network** — shows key lifecycle (175 keys: 77 live/57 revoked/41 expired; BNB=174). Faucets: testnet BNB (official) + **$U faucet 10/addr/30min** (testnet $U `0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565`). Relay: testnet-relay.altana.network.
- Hello-World: **~15–30 min** to wallet+session+first tx on testnet. No signup/API key. Gotchas: Bun for MCP, pre-1.0 churn, x402 approval txs.

### ERC-8004 + 8004scan (THE data layer) [A1 — live-probed]
- **IdentityRegistry BSC: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`** (ERC-721+URIStorage, NOT Enumerable — totalSupply reverts; enumerate via events or iterate tokenURI/ownerOf; latest tokenId ~341589). **ReputationRegistry: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`**. Testnet 97: `0x8004A818…BD9e` / `0x8004B663…8713`. ValidationRegistry: NOT deployed anywhere (0 validations globally). Do NOT confuse with community fork BRC8004 (0xfA09…).
- **8004scan API: `https://api.8004scan.io/api/v1/` — OPEN, no auth for reads, 30 req/min / 1,000 req/day** (OpenAPI at /openapi.json, 150 paths). Endpoints: `/agents?chain_id=56` (**310,215 BSC agents live**), `/agents/{chain}/{token}` (66 fields: identity, MCP/A2A endpoints, x402_supported, health_score, endpoint verification), `/agents/{chain}/{token}/quality` (v5 weighted score), `/agents/leaderboard|trending|search/semantic`, `/feedbacks?chain_id=56`, `/wallets/{addr}`, `/stats/*`, `POST /agents/verify-endpoint/{chain}/{token}` (open!). API keys via wallet-login JWT raise limits (= the "Pro plan" perk).
- Subgraph alternative: Agent0 BSC subgraph (gateway.thegraph.com/…/D6aWqowLkWqBgcqmpNKXuNikPkob24ADXCciiP8Hvn1K).
- **AltLLM:** OpenAI-compatible `https://api.altllm.ai/v1` (altllm-basic/standard, crypto tools built in) — hackathon credits available.

### DeFi integration surface (the 4 categories)
- **PancakeSwap** [A1 — official "Building Trading Agents on V3" guide exists!]: NPM `0x46A15B0b27311cedF172AB29E4f4766fbE7F4364`, SmartRouter `0x13f4EA83D0bd40E75C8222255bc855a974568Dd4`, MasterChefV3 `0x556B9306565093C855AEA9AE92A594704c2Cd59e`, Quoter `0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997`, Factory `0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865`, Permit2 `0x31c2F6fcFf4F8759b3Bd5Bf0e1084A055615c768`. SDKs `@pancakeswap/v3-sdk`, `@pancakeswap/smart-router`; v3 subgraph. Guide names the exact reference strategies: **Range Rebalancer**, **Farm APR Router**, swap bots + guardrails (scoped Permit2, slippage mins, 5-min deadlines, InvalidPid gotcha). Docs LLM-queryable: `docs.pancakeswap.finance/llms.txt`.
- **Venus** (health factor) [A1]: Comptroller `0xfd36e2c2a6789db23113685031d7f16329158384`, **VenusLens `0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA`** — `getAccountLimits()` returns liquidity + shortfall (shortfall>0 = liquidatable). api.venus.io for markets (laggy — NOT authoritative for liquidation safety; use RPC).
- **Aave v3 BSC**: Pool `0x6807dc923806fE8Fd134338EABCA509979a7e0cB`, `getUserAccountData()` returns healthFactor directly.
- **Lista**: slisBNB `0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B`, StakeManager `0x1adB950d8bB3dA4bE104211D5AB038628e477fE6`.

---

## Network / Chain Infrastructure (E7)

| Field | Value |
|-------|-------|
| Chain | BSC mainnet, chainId **56** |
| RPC | https://bsc-dataseed.bnbchain.org (verified), bsc-rpc.publicnode.com, 1rpc.io/bnb |
| WSS | wss://bsc-rpc.publicnode.com |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` (verified deployed) |
| Explorer API | Etherscan V2 unified: `api.etherscan.io/v2/api?chainid=56&…` (one Etherscan key) |
| Testnet | chainId 97, faucet https://testnet.bnbchain.org/faucet-smart |
| Deploy requirement | Marketplace public; agents LIVE on BSC (mainnet for "live" reading; Altana txs may be testnet) |

---

## Capability Sheet (native primitives)
- **ERC-8004 at scale**: only chain with 310K registered agents + open 8004scan API — a marketplace can read identity/reputation/health without building an indexer.
- **Altana sessions**: ONCHAIN-enforced scoped agent authority (allowlist+cap+expiry) with public Keystore reads + 1-tx revocation — no other chain ships this as production infra.
- **ERC-8183 escrowed hiring**: atomic hire-with-budget via session keys; $U gasless via EIP-3009.
- **B402/Binance x402**: production payment facilitator (CoinMarketCap uses it) for per-call agent monetization.
- **PancakeSwap official agent guide**: sponsor-blessed rebalancer/router strategies with exact contracts.

---

## Competitor Landscape

**BOTTOM LINE:** ~20+ public repos building this exact marketplace; 4 are submission-grade HIGH threats. Nobody visibly owns **data quality at scale** (Sybil-filtered reputation + verified endpoints + real track records) — that's the whitespace, and it's also the judging axis with the hardest evidence backing. **CONFIDENCE:** High (repos read directly). **SO WHAT:** Differentiate on trust-graded data + all-4-categories depth + full bounty stack; assume Marque/AgentEra-level baselines exist.

### Competitor Registry
| Project | What | Threat | Source |
|---------|------|:---:|---|
| **Marque** (marque.trade) | Conformance tests per category, spend-capped revocable "charters", REAL mainnet PCS v3 rebalance w/ public tx hashes, 88 commits | HIGH | github.com/talk2francis/Marque [B2] |
| **KaizenScope** | Trust-first: quote→authorize→submit→verify gates, conditional payment; probed registry ("66 agents, zero reputation") | HIGH | github.com/kaizenbnb/BNB-Agent-Marketplace [B2] |
| **AgentEra** | 8004scan Pro API + x402 + Altana sessions + TermiX report DONE (40.6x/163x/604x claims) + PCS swaps | HIGH | github.com/Lutviansyah/AgentEra [B2] |
| **SmartSentinels** | Existing product team; mainnet ERC-8004 agents in ALL 4 categories (Grid Trader, Health Guard, Yield Router, LP Rebalancer) | HIGH | 8004scan-issue-tracker #46/#50 [B2] |
| Smart-money-floor, pulse, HevoLaunch, genesis-marketplace, kupkake (Chrome ext) | assorted marketplaces | MED | GitHub [B2] |
| ~10 more stubs (LingoAI, marioggil, jerry21849, agentlens, assay-bsc, helix, …) | early/stub | LOW | GitHub [B2] |

### Competition Density Map
| Track | Est. teams | Activity | Density |
|-------|:---:|---|:---:|
| Main marketplace | 20+ visible (more hidden) | Deadline-day surge (4 repos updated within hours) | HIGH |
| Altana bounty | ≥2 visible (AgentEra, Marque-adjacent) | explorer shows only 175 keys total → few real integrations | MEDIUM |
| TermiX bounty | ≥1 with report done (AgentEra) | LOW-MED |
| PancakeSwap bounty | ≥2 (Marque mainnet rebalance, AgentEra swaps) | MEDIUM |

---

## Community Pain (Verbatim Quotes)
1. "The burned agent `J8JesQ2` (burned, '2 days ago') still appears as the **first** search result for 'bridgenode', ahead of the live agent" — BridgeNode-cc, 8004scan-issue-tracker #44 [B1]
2. "One agent's image/logo was malicious. Norton detected it and blocked the connection to the n.exchange domain." — SmartSentinels dev, issue #46 [B1]
3. "On-chain ERC-8004 identities exist on BSC mainnet and resolve correctly on BscScan, but 8004scan never indexes them." — issue #50 [B1]
4. "We probed 66 ERC-8004 agents on BSC; none carried on-chain reputation." — KaizenScope README [B2]
5. "hiring one today means digging through X threads and GitHub repos, with no way to compare what an agent does, whether it's live, or how it has performed" — organizer press release [A1]

---

## Data-Quality Reality Check (the strategic core)
**BOTTOM LINE:** The registry is mostly empty shells — and proving you can separate signal from noise IS the winning "Data Quality" story. **EVIDENCE:** arXiv 2606.26028 (Jan–May 2026 data): BSC 79% valid registration files but **only ~4% declare a live service endpoint**; **59.2% of BSC reviewers show coordinated Sybil behavior**; after removing flagged feedback **77.9% of rated BSC agents have zero valid feedback** [B1]. 8004scan: 0 validations globally; 3,646 new agents/day (farming). **CONFIDENCE:** High. **SO WHAT:** ~12K plausibly-functional agents out of 310K. A marketplace that (a) verifies endpoints live, (b) Sybil-filters feedback, (c) shows onchain performance receipts makes every competitor's raw-count listing look broken.

---

## Past Editions Analysis
- BNB Good Vibes Only (Jan 2026, 200 projects): marketplace winner **AGOS Clawjob** proved onchain agent-to-agent USDT settlement; 4/10 winners protection/security-flavored [B2].
- BNB Hack Online: working products with real traction beat concepts [B3].
- ETHGlobal Agentic 2025/2026: trust/safety layers around agents beat raw capability (SecretAgent, Bouncer.ai, ENShell) [B3].
- Virtuals #1: finance winners differentiated on **provable track records** [B3].
- Dami precedent: AgentMesh (agent marketplace) WON 0G @ ETHGlobal Open Agents; deep ERC-8004 experience (Backstop, Verdikt).

---

## Broader Market Context
$13.7B stablecoins on BNB Chain; Virtuals on BNB since Mar 2026; Trust Wallet AgentKit; BAP-578 NFA standard; OKX ships an ERC-8004 marketplace inside Onchain OS (the "big player" benchmark). Existing cross-chain marketplaces (Agent Arena 22K agents, RNWY 150K, AgentStore, Theagora, Helixa, 8k4) all lack BSC-native depth + Sybil-filtered trust [B2/B3].

---

## Category Saturation (Grid Data)
Not run — Grid corpus is Solana-centric and Copilot PAT unavailable (`copilot_available=false`); BSC saturation evidenced instead by the GitHub roster audit above. `[GAP — documented]`

## Builder Project History (Copilot)
Not available this run (no Copilot PAT). Relevant memory-sourced history: AgentMesh (won 0G @ ETHGlobal OA), Backstop (ERC-8004 on Mantle), Verdikt (ERC-8004 Base Sepolia), GhostFund (won Chainlink Convergence).

## Social Intel
Not gathered (autonomous conductor run — no Discord/Twitter review user loop). Partially compensated by GitHub roster audit + 8004scan issue tracker mining.

---

## Key Links & Resources
| Resource | URL |
|----------|-----|
| Hackathon page | https://www.bnbchain.org/en/hackathons/smart-money-era (tabs: overview/prizes/tracks/resources) |
| **Submission form** | **https://forms.gle/9g9XPNFwnYaHAz9L8** |
| Agent Studio docs | https://docs.bnbchain.org/developer-kit/bnbchain-studio/ |
| Studio CLI | npm `@bnbagent/studio-cli` (`bag`) · SDK github.com/bnb-chain/bnbagent-sdk |
| Altana docs | https://docs.altana.network (llms-full.txt available!) |
| Altana SDK | github.com/altananetwork/altana-sdk · npm @altananetwork/{sdk,mcp,x402-server} |
| Altana skills | https://skills.altana.network · github.com/altananetwork/skills |
| Altana explorer | https://explorer.altana.network / https://testnet.altana.network |
| 8004scan | https://8004scan.io · API https://api.8004scan.io/api/v1 (openapi.json) · Pro form https://forms.gle/jQevEPCAacBXaKG79 |
| BSC agents list | https://8004scan.io/agents?chain=56 |
| ERC-8004 contracts | github.com/erc-8004/erc-8004-contracts · eips.ethereum.org/EIPS/eip-8004 |
| PCS agent guide | https://docs.pancakeswap.finance/trading-tools/building-trading-agents-on-pancakeswap-v3 |
| Venus | docs-v4.venus.io (VenusLens) · api.venus.io |
| TermiX | https://app.termix.ai · github.com/TermiX-official/bsc-mcp |
| AltLLM | https://api.altllm.ai/v1 · platform.altllm.ai/docs |
| Faucets | testnet.bnbchain.org/faucet-smart · Altana $U faucet (10/30min) |
| AI Agent Landscape | bnbchain.org/en/blog/bnb-chain-ai-agent-landscape-agents-tools-and-payments |

---

## Track Coverage Matrix
| Track | Prize | Judging focus | Overlap potential | Est. submissions |
|-------|-------|---------------|-------------------|:---:|
| Main | $30K + adoption | Functionality/Data/Diversity | Foundation for all bounties | HIGH (20+) |
| Altana | 50K XP | onchain session proof | Powers the main track's "activate" step — same build | MEDIUM |
| TermiX | $10K | measured agent advantage | Report generated FROM the marketplace's own agents | LOW-MED |
| PancakeSwap | 1000 CAKE | real PCS trader/LP benefit | Rebalancing+yield categories ARE PCS agents | MEDIUM |

**Multi-track target:** one coherent build hits all four — Altana sessions = activation layer; PCS agents = 2 of 4 categories; TermiX report = proof artifact of the marketplace working.

## Domain Knowledge Sources
| Source | URL | Covers | Essential? |
|--------|-----|--------|:---:|
| Altana llms-full.txt | docs.altana.network/llms-full.txt | whole SDK | YES |
| PCS agent guide | docs.pancakeswap.finance/trading-tools/building-trading-agents-on-pancakeswap-v3 | rebalancer/router patterns | YES |
| 8004scan OpenAPI | api.8004scan.io/openapi.json | all data endpoints | YES |
| EIP-8004 spec | eips.ethereum.org/EIPS/eip-8004 | registry semantics | YES |
| Studio docs | docs.bnbchain.org/developer-kit/bnbchain-studio/ | bag CLI, x402/$U flows | YES |
| VenusLens ref | docs-v4.venus.io/technical-reference | health factor reads | YES |

---

## Kill List

### 1. Saturated
- Plain agent directory/listing UI over 8004scan data with raw counts (organizer-suggested shape; 20+ teams doing it) `(organizer-suggested)`
- Generic "browse and hire" marketplace with mock agents and no live proof
- The 4 organizer-named categories as thin labels over the same agent template `(organizer-suggested)`
- Chrome-extension/companion gimmicks (kupkake already there; off-rubric)

### 2. Broken Dependencies
- ValidationRegistry-based trust (not deployed anywhere, 0 validations globally)
- Venus API for liquidation safety (explicitly non-authoritative — must use RPC/VenusLens)
- b402.ai Vistara SDK (repo ARCHIVED Apr 2026 — use Binance x402/Studio rails or Altana x402-server)
- Browser-side x402 payments (CORS blocks X-PAYMENT — server-side only)
- bnb-chain/bnbagent-studio repo (404/private) — build against @bnbagent/studio-cli + docs instead
- Naive raw feedback averages (59.2% Sybil — judges may know; it's in the literature)

### 3. Already Built
- Conformance-tested categories + mainnet PCS rebalance receipts (Marque)
- Verification-gated payment flow (KaizenScope)
- Full bounty-stack checkbox build incl. TermiX report (AgentEra)
- Registry explorer/leaderboard (8004scan itself, RNWY, Agent Arena, OKX Onchain OS)

### 4. Zero Alignment
- Anything single-category ("scores poorly" — stated verbatim)
- Novel agents WITHOUT a marketplace (deliverable is the venue, not the agents)
- Non-BSC chains; TradFi angles; token launches
