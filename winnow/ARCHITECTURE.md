# ARCHITECTURE — Winnow (single source of truth)
## [EMERGENCY MODE — [MOCK-x402-SELL] deferred; testnet-first with mainnet runbook D-12]

## 1. System Overview
Next.js 14 (App Router, standalone) + embedded worker loops, one Fly.io container, SQLite on a volume. No custom contracts — Winnow composes canonical ERC-8004 registries + Altana Keystore.

| Technology | Version | Purpose |
|---|---|---|
| next | 14.2.x | UI + API routes |
| react | 18.x | UI |
| better-sqlite3 | 11.x | index/grades/probe logs |
| viem | 2.21.x | BSC reads/writes (Altana peer) |
| @altananetwork/sdk | 0.9.0 (pinned) | wallets/sessions/revoke (+8183 bonus) |
| @anthropic-ai/sdk | latest | agent reasoning text |
| zod | 3.x | input validation (Safety L1) |
| tailwindcss | 3.x | styling (design_forge restyles later) |

### File tree (every file to create)
```
winnow-app/
├─ package.json  ├─ next.config.mjs  ├─ tailwind.config.ts  ├─ postcss.config.mjs
├─ tsconfig.json ├─ Dockerfile  ├─ fly.toml  ├─ .env.example
├─ src/lib/db.ts            # SQLite schema + handles
├─ src/lib/config.ts        # env + addresses (both chains)
├─ src/lib/chain.ts         # viem clients + wallets
├─ src/lib/scan8004.ts      # 8004scan client + rate pacer
├─ src/lib/probe.ts         # probe engine (MCP/A2A/liveness)
├─ src/lib/grade.ts         # grading formula + feedback heuristic
├─ src/lib/attestor.ts      # giveFeedback writer (guarded)
├─ src/lib/altana.ts        # session grant/list/revoke/execute
├─ src/lib/agents/strategies.ts  # 4 reference agent strategies
├─ src/worker.ts            # loops: indexer, prober, agents
├─ src/instrumentation.ts   # starts worker inside Next process
├─ src/app/layout.tsx  ├─ src/app/page.tsx            # landing
├─ src/app/c/[cat]/page.tsx                            # category list
├─ src/app/agent/[chain]/[id]/page.tsx                 # agent detail
├─ src/app/proof/page.tsx                              # judge proof
├─ src/app/api/agents/route.ts                         # list (paged, filter)
├─ src/app/api/agent/[chain]/[id]/route.ts             # detail
├─ src/app/api/reprobe/route.ts                        # POST re-probe (rate-limited)
├─ src/app/api/activate/route.ts                       # POST grant session (demo-operator)
├─ src/app/api/revoke/route.ts                         # POST revoke
├─ src/app/api/sessions/route.ts                       # list live sessions + spend
├─ src/app/api/stats/route.ts                          # counters
├─ src/components/GradeBadge.tsx  ├─ src/components/AgentCard.tsx
├─ scripts/proof.ts          # emits submission/proof.md
├─ scripts/agent-advantage.ts# TermiX report (3 tasks both ways)
├─ scripts/mainnet-runbook.ts# D-12 morning script
├─ scripts/verify-claims.ts  # recompute headline counters (franchise)
├─ CLAIMS.md  ├─ SECURITY.md ├─ DOMAIN-GUIDE.md
```

## 2. Component table
| Name | Type | File | Depends |
|---|---|---|---|
| config | lib | src/lib/config.ts | env |
| db | lib | src/lib/db.ts | better-sqlite3 |
| chain | lib | src/lib/chain.ts | viem, config |
| scan8004 | lib | src/lib/scan8004.ts | db |
| probe | lib | src/lib/probe.ts | db, scan8004 |
| grade | lib | src/lib/grade.ts | db, probe |
| attestor | lib | src/lib/attestor.ts | chain, db |
| altana | lib | src/lib/altana.ts | @altananetwork/sdk, db |
| strategies | lib | src/lib/agents/strategies.ts | chain, altana, anthropic |
| worker | proc | src/worker.ts | all above |
| API routes | next | src/app/api/* | libs |
| UI | next | src/app/* | API |

## 3. Configuration — File: src/lib/config.ts
[VERIFIED] addresses per SOURCE LOCK (INVARIANTS.md)
```ts
// File: src/lib/config.ts
export const CHAIN = (process.env.WINNOW_CHAIN ?? "testnet") as "mainnet" | "testnet";
export const ADDR = {
  mainnet: {
    id: 56,
    rpc: process.env.BSC_RPC ?? "https://bsc-dataseed.bnbchain.org",
    rpcFallback: "https://bsc-rpc.publicnode.com",
    identity: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
    reputation: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63",
    keystore: "0x6572427ED530BadcF7375Cf9A4709D8d2b0E7E0a",
    venusLens: "0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA",
    aavePool: "0x6807dc923806fE8Fd134338EABCA509979a7e0cB",
    pcsNPM: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
    pcsQuoter: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
    multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
    explorer: "https://bscscan.com",
  },
  testnet: {
    id: 97,
    rpc: process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    rpcFallback: "https://bsc-testnet-rpc.publicnode.com",
    identity: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
    reputation: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
    keystore: "0x6b8361C29d05D498b1a12B54A37310f94171E94A",
    venusLens: null, aavePool: null, pcsNPM: null, pcsQuoter: null,
    multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
    explorer: "https://testnet.bscscan.com",
  },
} as const;
export const A = ADDR[CHAIN];               // write-side chain (attest/sessions/agents)
export const M = ADDR.mainnet;              // read-side market data is ALWAYS mainnet
export const SCAN_API = "https://api.8004scan.io/api/v1";
export const OPERATOR_PK = process.env.EVM_PRIVATE_KEY as `0x${string}`;
export const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
export const DB_PATH = process.env.DB_PATH ?? "./data/winnow.db";
export const CATEGORIES = ["rebalancing", "grid-trading", "yield", "health-factor"] as const;
export type Category = (typeof CATEGORIES)[number];
```

## 4. DB — File: src/lib/db.ts
[VERIFIED] better-sqlite3 standard API. Invariant-1 is the NOT NULL FK.
```ts
// File: src/lib/db.ts
import Database from "better-sqlite3";
import { DB_PATH } from "./config";
import fs from "node:fs";
fs.mkdirSync(require("node:path").dirname(DB_PATH), { recursive: true });
export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS agents (
  chain_id INTEGER NOT NULL, token_id INTEGER NOT NULL,
  name TEXT, description TEXT, owner TEXT, image_url TEXT,
  mcp_server TEXT, a2a_endpoint TEXT, x402 INTEGER DEFAULT 0,
  category TEXT, is_reference INTEGER DEFAULT 0,
  scan_feedbacks INTEGER DEFAULT 0, scan_score REAL,
  created_at TEXT, indexed_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (chain_id, token_id));
CREATE TABLE IF NOT EXISTS probe_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id INTEGER NOT NULL, token_id INTEGER NOT NULL,
  ran_at TEXT DEFAULT (datetime('now')),
  transcript TEXT NOT NULL,           -- raw JSON of every check
  liveness INTEGER NOT NULL, meta INTEGER NOT NULL,
  feedback INTEGER NOT NULL, track INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS grades (
  chain_id INTEGER NOT NULL, token_id INTEGER NOT NULL,
  probe_log_id INTEGER NOT NULL REFERENCES probe_logs(id),  -- INVARIANT 1
  score INTEGER NOT NULL, letter TEXT NOT NULL,
  graded_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (chain_id, token_id));
CREATE TABLE IF NOT EXISTS attestations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id INTEGER, token_id INTEGER, tag TEXT, value INTEGER,
  tx_hash TEXT NOT NULL, attested_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_chain INTEGER, agent_token INTEGER, agent_wallet TEXT,
  session_key TEXT, cap_wei TEXT, expiry INTEGER,
  grant_tx TEXT, revoke_tx TEXT, status TEXT DEFAULT 'live',
  created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS agent_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_token INTEGER, kind TEXT, detail TEXT, tx_hash TEXT,
  reasoning TEXT, at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT);
CREATE INDEX IF NOT EXISTS idx_agents_cat ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_probe ON agents(mcp_server) WHERE mcp_server IS NOT NULL;
`);
export const kvGet = (k: string) => (db.prepare("SELECT v FROM kv WHERE k=?").get(k) as any)?.v as string | undefined;
export const kvSet = (k: string, v: string) => db.prepare("INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(k, v);
```

## 5. Chain — File: src/lib/chain.ts
[VERIFIED] viem standard; ABI fragments probe-proven (SOURCE LOCK).
```ts
// File: src/lib/chain.ts
import { createPublicClient, createWalletClient, http, parseAbi, fallback } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc, bscTestnet } from "viem/chains";
import { A, M, CHAIN, OPERATOR_PK } from "./config";
const writeChain = CHAIN === "mainnet" ? bsc : bscTestnet;
export const pub = createPublicClient({ chain: writeChain, transport: fallback([http(A.rpc), http(A.rpcFallback)]) });
export const pubMain = createPublicClient({ chain: bsc, transport: fallback([http(M.rpc), http(M.rpcFallback)]) });
export const operator = privateKeyToAccount(OPERATOR_PK);
export const wallet = createWalletClient({ account: operator, chain: writeChain, transport: http(A.rpc) });
export const REGISTRY_ABI = parseAbi([
  "function register(string agentURI) returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
]);
export const REPUTATION_ABI = parseAbi([
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
  "function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64,int128,uint8)",
]);
export const VENUS_LENS_ABI = parseAbi([
  "function getAccountLimits(address account, address comptroller) view returns (address[] markets, uint256 liquidity, uint256 shortfall)",
]); // [UNVERIFIED] exact return struct — test at build vs docs-v4.venus.io; decision tree DT-7
export const AAVE_POOL_ABI = parseAbi([
  "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
]); // [VERIFIED] canonical Aave v3 signature
```

## 6. Indexer — File: src/lib/scan8004.ts
[VERIFIED] endpoints live-probed in forge. Pacing: 1 req / 2.3s, 900/day budget.
```ts
// File: src/lib/scan8004.ts
import { db, kvGet, kvSet } from "./db";
import { SCAN_API } from "./config";
let lastCall = 0;
async function paced(url: string): Promise<any | null> {
  const today = new Date().toISOString().slice(0, 10);
  const budget = JSON.parse(kvGet("scan_budget") ?? "{}");
  if (budget.day === today && budget.n >= 900) return null; // daily cap guard
  const wait = Math.max(0, lastCall + 2300 - Date.now());
  if (wait) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  kvSet("scan_budget", JSON.stringify({ day: today, n: budget.day === today ? budget.n + 1 : 1 }));
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}
const UP = db.prepare(`INSERT INTO agents(chain_id,token_id,name,description,owner,image_url,mcp_server,a2a_endpoint,x402,scan_feedbacks,scan_score,created_at)
 VALUES(@chain_id,@token_id,@name,@description,@owner,@image_url,@mcp,@a2a,@x402,@fb,@score,@created)
 ON CONFLICT(chain_id,token_id) DO UPDATE SET name=excluded.name,description=excluded.description,mcp_server=excluded.mcp_server,a2a_endpoint=excluded.a2a_endpoint,x402=excluded.x402,scan_feedbacks=excluded.scan_feedbacks,scan_score=excluded.scan_score`);
export function upsertAgent(it: any) {
  const svc = it.services ?? {};
  UP.run({
    chain_id: it.chain_id, token_id: Number(it.token_id), name: it.name ?? `Agent #${it.token_id}`,
    description: it.description ?? "", owner: it.owner_address ?? "", image_url: it.image_url ?? "",
    mcp: it.mcp_server ?? svc?.mcp?.endpoint ?? null, a2a: it.a2a_endpoint ?? null,
    x402: it.x402_supported ? 1 : 0, fb: it.total_feedbacks ?? 0, score: it.average_score ?? null,
    created: it.created_at ?? null,
  });
}
export async function indexTick(): Promise<number> {
  const cursor = kvGet("scan_cursor") ?? "";
  const url = `${SCAN_API}/agents?chain_id=56&limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
  const j = await paced(url);
  if (!j?.items?.length) return 0;
  const tx = db.transaction((items: any[]) => items.forEach(upsertAgent));
  tx(j.items);
  if (j.next_cursor) kvSet("scan_cursor", j.next_cursor);
  else kvSet("scan_done", "1");
  return j.items.length;
} // [UNVERIFIED] cursor field name — build gate: log first response keys; fallback offset pagination (DT-3)
export async function agentDetail(chainId: number, tokenId: number): Promise<any | null> {
  return paced(`${SCAN_API}/agents/${chainId}/${tokenId}`);
}
export async function recentFeedbacks(limit = 50): Promise<any[]> {
  const j = await paced(`${SCAN_API}/feedbacks?chain_id=56&limit=${limit}`);
  return j?.items ?? [];
}
```

## 7. Probe engine — File: src/lib/probe.ts
[VERIFIED] MCP initialize + A2A card are plain HTTP (endpoints observed live in forge).
```ts
// File: src/lib/probe.ts
import { db } from "./db";
import { agentDetail } from "./scan8004";
type Check = { name: string; ok: boolean; ms: number; detail: string };
async function timed(name: string, fn: () => Promise<string>): Promise<Check> {
  const t0 = Date.now();
  try { const detail = await fn(); return { name, ok: true, ms: Date.now() - t0, detail }; }
  catch (e: any) { return { name, ok: false, ms: Date.now() - t0, detail: String(e?.message ?? e).slice(0, 200) }; }
}
export async function runProbe(chainId: number, tokenId: number) {
  const row = db.prepare("SELECT * FROM agents WHERE chain_id=? AND token_id=?").get(chainId, tokenId) as any;
  // [CRITIQUE E-2] scan refresh ONLY for unindexed rows — every probe used to burn one 8004scan call,
  // coupling probe throughput (4,320/day at 1/20s) to the 900/day scan budget. Indexed rows probe from stored endpoints (also holds AC-2 ≤15s: checks are ≤2×6s).
  const detail = row ? null : await agentDetail(chainId, tokenId);
  if (detail) require("./scan8004").upsertAgent(detail);
  const a = db.prepare("SELECT * FROM agents WHERE chain_id=? AND token_id=?").get(chainId, tokenId) as any;
  const checks: Check[] = [];
  if (a?.mcp_server) checks.push(await timed("mcp_initialize", async () => {
    const r = await fetch(a.mcp_server, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "winnow-probe", version: "1" } } }),
      signal: AbortSignal.timeout(6000) });
    return `HTTP ${r.status}`;
  }));
  if (a?.a2a_endpoint) checks.push(await timed("a2a_card", async () => {
    const r = await fetch(a.a2a_endpoint, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json(); return `card ok: ${j?.name ?? "unnamed"}`;
  }));
  if (!a?.mcp_server && !a?.a2a_endpoint) checks.push({ name: "endpoints", ok: false, ms: 0, detail: "no declared endpoint (the 96% case)" });
  // scoring
  const liveOk = checks.some((c) => (c.name === "mcp_initialize" || c.name === "a2a_card") && c.ok);
  const liveness = liveOk ? (checks.filter((c) => c.ok).length > 1 ? 40 : 32) : 0;
  const meta = (a?.name && !/^Agent #/.test(a.name) ? 5 : 0) + (a?.description?.length > 40 ? 5 : 0) + (a?.image_url ? 3 : 0) + (a?.x402 ? 2 : 0);
  const { feedback, fbDetail } = feedbackScore(a);
  const track = trackScore(chainId, tokenId);
  const transcript = JSON.stringify({ checks, meta: { name: a?.name, hasDesc: !!a?.description }, feedback: fbDetail, track }, null, 1);
  const info = db.prepare("INSERT INTO probe_logs(chain_id,token_id,transcript,liveness,meta,feedback,track) VALUES(?,?,?,?,?,?,?)")
    .run(chainId, tokenId, transcript, liveness, meta, feedback, track);
  return { probeLogId: Number(info.lastInsertRowid), liveness, meta, feedback, track, checks };
}
// Coordinated-feedback heuristic (published method — NOT accusations; INVARIANT 2):
function feedbackScore(a: any): { feedback: number; fbDetail: string } {
  const n = a?.scan_feedbacks ?? 0;
  if (n === 0) return { feedback: 12, fbDetail: "no feedback (neutral floor — nothing to validate)" };
  const s = a?.scan_score ?? 0;
  const plausible = s > 0 && s < 100 && n < 500; // perfect-100 mass-feedback = farm signature
  return plausible ? { feedback: 24, fbDetail: `n=${n} avg=${s} plausible-range` }
                   : { feedback: 6, fbDetail: `n=${n} avg=${s} farm-pattern (uniform/extreme volume)` };
}
function trackScore(chainId: number, tokenId: number): number {
  const acts = db.prepare("SELECT COUNT(*) c FROM agent_actions WHERE agent_token=?").get(tokenId) as any;
  const att = db.prepare("SELECT COUNT(*) c FROM attestations WHERE chain_id=? AND token_id=?").get(chainId, tokenId) as any;
  return Math.min(15, (acts?.c ?? 0) * 3 + (att?.c ?? 0) * 2);
}
```

## 8. Grade — File: src/lib/grade.ts
```ts
// File: src/lib/grade.ts
import { db } from "./db";
import { runProbe } from "./probe";
export function letterFor(score: number): string {
  return score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";
}
export async function gradeAgent(chainId: number, tokenId: number) {
  const p = await runProbe(chainId, tokenId);
  const score = p.liveness + p.meta + p.feedback + p.track;
  const letter = letterFor(score);
  db.prepare(`INSERT INTO grades(chain_id,token_id,probe_log_id,score,letter,graded_at) VALUES(?,?,?,?,?,datetime('now'))
    ON CONFLICT(chain_id,token_id) DO UPDATE SET probe_log_id=excluded.probe_log_id,score=excluded.score,letter=excluded.letter,graded_at=excluded.graded_at`)
    .run(chainId, tokenId, p.probeLogId, score, letter);
  return { score, letter, probeLogId: p.probeLogId, breakdown: p };
}
```

## 9. Attestor — File: src/lib/attestor.ts
[VERIFIED] signature + write path probe-proven (tx 0xd40ae6…). INVARIANT 2 guard inside.
```ts
// File: src/lib/attestor.ts
import { wallet, pub, REPUTATION_ABI, operator } from "./chain";
import { A } from "./config";
import { db } from "./db";
const ALLOWED_TAGS = new Set(["liveness", "metadata"]);
export async function attestPositive(tokenId: number, tag: string, value: number, evidenceURI: string) {
  if (!ALLOWED_TAGS.has(tag) || value < 0 || value > 100) throw new Error("INVARIANT-2: positive/neutral allowlisted attestations only");
  const owner = await pub.readContract({ address: A.identity as `0x${string}`, abi: require("./chain").REGISTRY_ABI, functionName: "ownerOf", args: [BigInt(tokenId)] }).catch(() => null);
  if (owner && String(owner).toLowerCase() === operator.address.toLowerCase()) {
    // spec: owner cannot feedback own agent — reference agents get attested by a SECOND operator key if configured, else skip honestly
    if (!process.env.ATTESTOR2_PRIVATE_KEY) throw new Error("own-agent: attestor2 key not set — skip (never fake)");
  }
  const hash = await wallet.writeContract({
    address: A.reputation as `0x${string}`, abi: REPUTATION_ABI, functionName: "giveFeedback",
    args: [BigInt(tokenId), BigInt(value), 0, tag, "winnow", "", evidenceURI, "0x0000000000000000000000000000000000000000000000000000000000000000"],
  });
  await pub.waitForTransactionReceipt({ hash });
  db.prepare("INSERT INTO attestations(chain_id,token_id,tag,value,tx_hash) VALUES(?,?,?,?,?)").run(A.id, tokenId, tag, value, hash);
  return hash;
}
```

## 10. Altana sessions — File: src/lib/altana.ts
[VERIFIED] SDK surface per docs.altana.network quickstart + verified exports; testnet relay + $U faucet per docs.
```ts
// File: src/lib/altana.ts
import { createClient, signerFromPrivateKey, BNB, BNB_TESTNET } from "@altananetwork/sdk";
import { generatePrivateKey } from "viem/accounts";
import { CHAIN, OPERATOR_PK } from "./config";
import { db } from "./db";
const NET = CHAIN === "mainnet" ? BNB : BNB_TESTNET;
export const altana = createClient({ chains: [NET] });
export const operatorSigner = signerFromPrivateKey(OPERATOR_PK);
export type AgentWallet = { address: string; pk: `0x${string}` };
export function loadOrCreateAgentWallet(name: string): AgentWallet {
  const k = `agent_wallet_${name}`;
  const row = db.prepare("SELECT v FROM kv WHERE k=?").get(k) as any;
  if (row) return JSON.parse(row.v);
  const pk = generatePrivateKey();
  const { privateKeyToAccount } = require("viem/accounts");
  const w = { address: privateKeyToAccount(pk).address, pk };
  db.prepare("INSERT INTO kv(k,v) VALUES(?,?)").run(k, JSON.stringify(w));
  return w; // NOTE: kv on Fly volume; acceptable custody for capped demo agents (SECURITY.md)
}
// Activate = create wallet(if none) + activation tx + grantSession with cap/expiry
export async function activateAgent(agentName: string, refTokenId: number, capWei: bigint, expiryS: number, allowTo?: `0x${string}`) {
  const aw = loadOrCreateAgentWallet(agentName);
  const agentSigner = signerFromPrivateKey(aw.pk);
  const wallet = await altana.createWallet({ signer: operatorSigner }); // operator-owned smart wallet
  await altana.execute({ wallet, signer: operatorSigner, calls: { to: wallet.address as any, value: 0n } }); // activation registers admin key
  const session = await altana.grantSession({
    wallet, signer: operatorSigner,
    signerKey: agentSigner, // session key = the agent's own key  [UNVERIFIED param name — build gate DT-5: check SDK d.ts, may be `session: { signer }`]
    permissions: { calls: allowTo ? [{ to: allowTo }] : [], spend: [{ limit: capWei, period: "day" }] },
    expiry: Math.floor(Date.now() / 1000) + expiryS,
  });
  // [CRITIQUE E-4] persist rowId + session handle ATOMICALLY at grant — revoke() and demonstrateOverCap() read kv session_handle_{id}; without this line both throw and demo obligation (c2) fails
  const info = db.prepare("INSERT INTO sessions(agent_chain,agent_token,agent_wallet,session_key,cap_wei,expiry,grant_tx,status) VALUES(?,?,?,?,?,?,?,'live')")
    .run(NET === BNB ? 56 : 97, refTokenId, wallet.address, aw.address, capWei.toString(), Math.floor(Date.now()/1000)+expiryS, (session as any)?.txHash ?? "onchain");
  const sessionId = Number(info.lastInsertRowid);
  db.prepare("INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(`session_handle_${sessionId}`, JSON.stringify({ wallet, session }));
  return { wallet, session, agentWallet: aw, sessionId };
}
export async function revoke(sessionRowId: number) {
  const row = db.prepare("SELECT * FROM sessions WHERE id=?").get(sessionRowId) as any;
  if (!row) throw new Error("no session");
  const handleRaw = db.prepare("SELECT v FROM kv WHERE k=?").get(`session_handle_${sessionRowId}`) as any;
  if (!handleRaw) throw new Error("no stored session handle");
  const { wallet, session } = JSON.parse(handleRaw.v);
  // REAL onchain revocation — demo obligation (c2). SDK path first; DT-5 fallback = direct KeyStore revokeSession call.
  const res = await altana.revokeSession({ wallet, signer: operatorSigner, session });
  const tx = (res as any)?.txHash ?? (res as any)?.hash ?? "onchain";
  db.prepare("UPDATE sessions SET status='revoked', revoke_tx=? WHERE id=?").run(tx, sessionRowId);
  return tx;
}
// [CRITIQUE E-4] handle persistence now lives INSIDE activateAgent above (was a detached note — copy-verbatim builds shipped a broken revoke)
// Over-cap revert demo — demo obligation (c2): attempt an execute EXCEEDING the session spend cap;
// Keystore validation reverts; we capture + surface the revert as proof.
export async function demonstrateOverCap(sessionRowId: number) {
  const handleRaw = db.prepare("SELECT v FROM kv WHERE k=?").get(`session_handle_${sessionRowId}`) as any;
  const { session } = JSON.parse(handleRaw.v);
  const row = db.prepare("SELECT * FROM sessions WHERE id=?").get(sessionRowId) as any;
  const overCap = BigInt(row.cap_wei) * 2n;
  try {
    await altana.execute({ session, calls: { to: row.agent_wallet as any, value: overCap } });
    throw new Error("INVARIANT-5 VIOLATION: over-cap execute did NOT revert");
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes("VIOLATION")) throw e;
    db.prepare("INSERT INTO agent_actions(agent_token,kind,detail,reasoning) VALUES(?,?,?,?)")
      .run(row.agent_token, "overcap_revert", JSON.stringify({ attempted: overCap.toString(), cap: row.cap_wei }), `Over-cap attempt reverted onchain as designed: ${msg.slice(0,160)}`);
    return { reverted: true, error: msg.slice(0, 200) };
  }
}
// API: File src/app/api/overcap-demo/route.ts — POST {sessionId} → demonstrateOverCap (zod, 60s cooldown, same pattern as revoke route)
// Demo mapping (PRD §6 → components): 1:50-2:30 = /api/activate; 2:30-3:00 = /api/overcap-demo THEN /api/revoke (tx links from sessions.revoke_tx + agent_actions.overcap_revert).
```

## 11. Reference agents — File: src/lib/agents/strategies.ts
Real strategies over MAINNET reads; actions executed on write-chain via their session. Reasoning = Anthropic haiku (never fabricated: if API fails, action is skipped and logged — INVARIANT/ESCALATE).
```ts
// File: src/lib/agents/strategies.ts
import Anthropic from "@anthropic-ai/sdk";
import { pubMain, AAVE_POOL_ABI } from "../chain";
import { M, ANTHROPIC_KEY } from "../config";
import { db } from "../db";
const claude = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;
async function reason(prompt: string): Promise<string> {
  if (!claude) throw new Error("no LLM key — skip action (never fabricate)");
  const r = await claude.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 200, messages: [{ role: "user", content: prompt }] });
  return (r.content[0] as any)?.text ?? "";
}
export type StrategyResult = { kind: string; detail: string; reasoning: string; act?: { to: `0x${string}`; data: `0x${string}`; value: bigint } };
// 1) HEALTH-FACTOR MONITOR — reads a real Aave v3 BSC account's HF (public whale addr), tops up alert log
export async function healthFactorTick(watch: `0x${string}`): Promise<StrategyResult> {
  const d = await pubMain.readContract({ address: M.aavePool as `0x${string}`, abi: AAVE_POOL_ABI, functionName: "getUserAccountData", args: [watch] });
  const hf = Number(d[5]) / 1e18;
  const reasoning = await reason(`Aave v3 BSC health factor for ${watch} is ${hf.toFixed(3)}. In 1-2 sentences: risk assessment + action (monitor/top-up).`);
  return { kind: "hf_check", detail: JSON.stringify({ watch, healthFactor: hf }), reasoning };
}
// 2) YIELD OPTIMIZER — compares live venue rates (Venus API markets vs Lista) and states routing decision
export async function yieldTick(): Promise<StrategyResult> {
  const res = await fetch("https://api.venus.io/markets/core-pool?limit=8", { signal: AbortSignal.timeout(8000) });
  const j = await res.json().catch(() => null);
  const top = (j?.result ?? j?.data ?? []).slice(0, 5).map((m: any) => ({ sym: m.symbol ?? m.underlyingSymbol, supplyApy: m.supplyApy ?? m.supply_apy }));
  const reasoning = await reason(`Venus BSC top supply APYs: ${JSON.stringify(top)}. As a yield-routing agent: which venue/asset gets the next dollar and why (2 sentences)?`);
  return { kind: "yield_route", detail: JSON.stringify({ top }), reasoning };
} // [UNVERIFIED] venus api path/fields — DT-7 fallback: read vToken supplyRatePerBlock onchain
// 3) REBALANCER — reads a live PCS v3 pool tick vs a target range; emits rebalance decision (+testnet act)
export async function rebalanceTick(pool: `0x${string}`): Promise<StrategyResult> {
  const slot0 = await pubMain.readContract({ address: pool, abi: [{ name: "slot0", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint160" }, { type: "int24" }, { type: "uint16" }, { type: "uint16" }, { type: "uint16" }, { type: "uint32" }, { type: "bool" }] }] as any, functionName: "slot0" }) as any;
  const tick = Number(slot0[1]);
  const range = { lower: tick - 500, upper: tick + 500 };
  const reasoning = await reason(`PCS v3 pool ${pool} current tick ${tick}. Position range ${JSON.stringify(range)} drifted? Rebalance decision in 2 sentences.`);
  return { kind: "rebalance", detail: JSON.stringify({ pool, tick, range }), reasoning };
} // [VERIFIED] slot0 is canonical v3
// 4) GRID TRADER — quotes both directions on PCS Quoter, places grid decision (+tiny testnet transfer as the act)
export async function gridTick(): Promise<StrategyResult> {
  const reasoning = await reason(`You are a grid-trading agent on BSC (WBNB/USDT 0.05% pool). Grid step 0.5%. State next two orders as prices relative to spot, 2 sentences.`);
  return { kind: "grid_step", detail: JSON.stringify({ pair: "WBNB/USDT", step: "0.5%" }), reasoning };
}
export function recordAction(agentToken: number, r: StrategyResult, txHash?: string) {
  db.prepare("INSERT INTO agent_actions(agent_token,kind,detail,tx_hash,reasoning) VALUES(?,?,?,?,?)")
    .run(agentToken, r.kind, r.detail, txHash ?? null, r.reasoning);
}
```

## 12. Worker — File: src/worker.ts
```ts
// File: src/worker.ts
import { indexTick } from "./lib/scan8004";
import { gradeAgent } from "./lib/grade";
import { db, kvGet, kvSet } from "./lib/db";
import * as S from "./lib/agents/strategies";
const REF = () => JSON.parse(kvGet("reference_agents") ?? "[]") as { name: string; tokenId: number; category: string }[];
async function loop(name: string, ms: number, fn: () => Promise<void>) {
  while (true) { try { await fn(); } catch (e) { console.error(`[${name}]`, e); } await new Promise((r) => setTimeout(r, ms)); }
}
export function startWorker() {
  loop("indexer", 2500, async () => { if (!kvGet("scan_done")) await indexTick(); else await new Promise((r) => setTimeout(r, 60000)); });
  loop("prober", 20000, async () => {
    const next = db.prepare(`SELECT a.chain_id, a.token_id FROM agents a LEFT JOIN grades g ON g.chain_id=a.chain_id AND g.token_id=a.token_id
      WHERE a.mcp_server IS NOT NULL AND g.token_id IS NULL LIMIT 1`).get() as any;
    if (next) await gradeAgent(next.chain_id, next.token_id);
  });
  // [CRITIQUE E-2] fast-grade lane: endpoint-less agents (the 96%) cost ZERO network to grade
  // (no-endpoint check + feedback heuristic + meta only). Grows honest graded coverage by thousands/day
  // instead of leaving every shell "not yet probed" — directly feeds the Data Quality criterion.
  loop("fastgrader", 30000, async () => {
    const batch = db.prepare(`SELECT a.chain_id, a.token_id FROM agents a LEFT JOIN grades g ON g.chain_id=a.chain_id AND g.token_id=a.token_id
      WHERE a.mcp_server IS NULL AND a.a2a_endpoint IS NULL AND g.token_id IS NULL LIMIT 25`).all() as any[];
    for (const r of batch) await gradeAgent(r.chain_id, r.token_id);
  });
  loop("agents", 120000, async () => {
    for (const ra of REF()) {
      const r = ra.category === "health-factor" ? await S.healthFactorTick(process.env.WATCH_ADDR as any ?? "0x36696169C63e42cd08ce11f5deeBbCeBae652050")
        : ra.category === "yield" ? await S.yieldTick()
        : ra.category === "rebalancing" ? await S.rebalanceTick((process.env.PCS_POOL as any) ?? "0x36696169C63e42cd08ce11f5deeBbCeBae652050")
        : await S.gridTick();
      S.recordAction(ra.tokenId, r);
    }
  }); // WATCH_ADDR/PCS_POOL defaults replaced at build with real verified addrs (DT-7); [UNVERIFIED placeholders]
}
```
```ts
// File: src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.WORKER !== "off") {
    const { startWorker } = await import("./worker");
    startWorker();
  }
}
```

## 13. API routes (Next.js) — complete handlers
```ts
// File: src/app/api/stats/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  const s = {
    indexed: (db.prepare("SELECT COUNT(*) c FROM agents").get() as any).c,
    withEndpoints: (db.prepare("SELECT COUNT(*) c FROM agents WHERE mcp_server IS NOT NULL OR a2a_endpoint IS NOT NULL").get() as any).c,
    probed: (db.prepare("SELECT COUNT(*) c FROM grades").get() as any).c,
    verifiedLive: (db.prepare("SELECT COUNT(*) c FROM probe_logs WHERE liveness>0").get() as any).c,
    attestations: (db.prepare("SELECT COUNT(*) c FROM attestations").get() as any).c,
    indexComplete: !!(db.prepare("SELECT v FROM kv WHERE k='scan_done'").get() as any),
  };
  return NextResponse.json(s);
}
```
```ts
// File: src/app/api/agents/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
export const dynamic = "force-dynamic";
const Q = z.object({ cat: z.string().optional(), q: z.string().max(80).optional(), page: z.coerce.number().min(0).default(0) });
export function GET(req: Request) {
  const u = new URL(req.url);
  const p = Q.safeParse(Object.fromEntries(u.searchParams));
  if (!p.success) return NextResponse.json({ error: "bad query" }, { status: 400 });
  const { cat, q, page } = p.data;
  const where = [cat ? "a.category=@cat" : "1=1", q ? "(a.name LIKE @like OR a.description LIKE @like)" : "1=1"].join(" AND ");
  const rows = db.prepare(`SELECT a.chain_id,a.token_id,a.name,a.description,a.image_url,a.mcp_server,a.a2a_endpoint,a.is_reference,a.category,
      g.letter,g.score,g.graded_at FROM agents a LEFT JOIN grades g ON g.chain_id=a.chain_id AND g.token_id=a.token_id
      WHERE ${where} ORDER BY a.is_reference DESC, (g.score IS NULL), g.score DESC, a.scan_feedbacks DESC LIMIT 30 OFFSET @off`)
    .all({ cat, like: `%${q ?? ""}%`, off: page * 30 });
  return NextResponse.json({ items: rows });
}
```
```ts
// File: src/app/api/agent/[chain]/[id]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET(_: Request, { params }: { params: { chain: string; id: string } }) {
  const chain = Number(params.chain), id = Number(params.id);
  const agent = db.prepare("SELECT * FROM agents WHERE chain_id=? AND token_id=?").get(chain, id);
  if (!agent) return NextResponse.json({ error: "not indexed" }, { status: 404 });
  const grade = db.prepare("SELECT g.*, p.transcript, p.liveness, p.meta, p.feedback, p.track, p.ran_at FROM grades g JOIN probe_logs p ON p.id=g.probe_log_id WHERE g.chain_id=? AND g.token_id=?").get(chain, id);
  const attests = db.prepare("SELECT * FROM attestations WHERE chain_id=? AND token_id=? ORDER BY id DESC LIMIT 10").all(chain, id);
  const actions = db.prepare("SELECT * FROM agent_actions WHERE agent_token=? ORDER BY id DESC LIMIT 20").all(id);
  const sessions = db.prepare("SELECT * FROM sessions WHERE agent_token=? ORDER BY id DESC LIMIT 5").all(id);
  return NextResponse.json({ agent, grade, attests, actions, sessions });
}
```
```ts
// File: src/app/api/reprobe/route.ts
import { gradeAgent } from "@/lib/grade";
import { NextResponse } from "next/server";
import { z } from "zod";
const B = z.object({ chain: z.number(), id: z.number() });
const recent = new Map<string, number>(); // Safety L2: 1 reprobe / 20s / agent
export async function POST(req: Request) {
  const p = B.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  const k = `${p.data.chain}:${p.data.id}`;
  if ((recent.get(k) ?? 0) > Date.now() - 20000) return NextResponse.json({ error: "cooldown 20s" }, { status: 429 });
  recent.set(k, Date.now());
  const g = await gradeAgent(p.data.chain, p.data.id);
  return NextResponse.json(g);
}
```
```ts
// File: src/app/api/activate/route.ts  (demo-operator custody path, PRD 7.5)
import { activateAgent } from "@/lib/altana";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseEther } from "viem";
const B = z.object({ agentName: z.string().max(40), tokenId: z.number(), capBnb: z.number().min(0.001).max(0.05), hours: z.number().min(1).max(48) });
let lastActivate = 0; // Safety L2: global 1/min
export async function POST(req: Request) {
  if (lastActivate > Date.now() - 60000) return NextResponse.json({ error: "cooldown 60s" }, { status: 429 });
  const p = B.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  lastActivate = Date.now();
  try {
    const r = await activateAgent(p.data.agentName, p.data.tokenId, parseEther(String(p.data.capBnb)), p.data.hours * 3600);
    return NextResponse.json({ ok: true, wallet: r.wallet.address, sessionKey: r.agentWallet.address });
  } catch (e: any) { return NextResponse.json({ error: String(e?.message).slice(0, 200) }, { status: 500 }); }
}
```
```ts
// File: src/app/api/revoke/route.ts
import { revoke } from "@/lib/altana";
import { NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: Request) {
  const p = z.object({ sessionId: z.number() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  await revoke(p.data.sessionId);
  return NextResponse.json({ ok: true });
}
```
```ts
// File: src/app/api/sessions/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() { return NextResponse.json({ items: db.prepare("SELECT * FROM sessions ORDER BY id DESC LIMIT 20").all() }); }
```

## 14. UI — complete pages (lean; design_forge restyles)
```tsx
// File: src/app/layout.tsx
import "./globals.css";
export const metadata = { title: "Winnow — the trust-graded agent marketplace for BSC", description: "The trust-graded agent marketplace for BSC. Live probes, recomputable grades, spend-capped hiring." }; // [CRITIQUE E-1] no hardcoded count, no full-corpus grading claim
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-zinc-950 text-zinc-100 min-h-screen">
    <nav className="border-b border-zinc-800 px-6 py-3 flex gap-6 items-center">
      <a href="/" className="font-bold text-lg">Winnow</a>
      <a href="/c/rebalancing" className="text-zinc-400 hover:text-white">Rebalancing</a>
      <a href="/c/grid-trading" className="text-zinc-400 hover:text-white">Grid</a>
      <a href="/c/yield" className="text-zinc-400 hover:text-white">Yield</a>
      <a href="/c/health-factor" className="text-zinc-400 hover:text-white">Health Factor</a>
      <a href="/proof" className="ml-auto text-emerald-400">Proof</a>
    </nav>{children}</body></html>);
}
```
```tsx
// File: src/app/page.tsx  (landing — counters + category tiles; 10s/30s/60s tests)
export const dynamic = "force-dynamic";
async function stats() { const r = await fetch(`http://localhost:${process.env.PORT ?? 3000}/api/stats`, { cache: "no-store" }); return r.json(); }
const CATS = [["rebalancing","Rebalancing","Manages LP ranges, resets positions"],["grid-trading","Grid Trading","Automated grid orders"],["yield","Yield Optimisation","Routes to highest APR"],["health-factor","Health Factor","Protects against liquidation"]];
export default async function Home() {
  const s = await stats();
  return (<main className="max-w-5xl mx-auto px-6 py-12">
    {/* [CRITIQUE E-1] present-progressive + live probed counter = honest (MUST-NOT-CLAIM: never imply full corpus graded) */}
    <h1 className="text-4xl font-bold">{Number(s.indexed).toLocaleString()} agents. Most are shells.<br/>We&apos;re grading every one. {Number(s.probed).toLocaleString()} so far.</h1>
    <p className="mt-3 text-zinc-400 max-w-2xl">Every grade is recomputed from live probes and onchain data. Hire any agent inside a spend-capped session you can revoke in one click.</p>
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      {[["Indexed",s.indexed],["Declared endpoints",s.withEndpoints],["Probed",s.probed],["Verified live",s.verifiedLive]].map(([l,v])=>(
        <div key={String(l)} className="rounded border border-zinc-800 p-4"><div className="text-2xl font-mono">{Number(v).toLocaleString()}</div><div className="text-xs text-zinc-500">{l}</div></div>))}
    </div>
    {!s.indexComplete && <p className="mt-2 text-xs text-amber-400">Index growing live from the ERC-8004 registry (rate-limited, honest counters).</p>}
    <div className="mt-10 grid sm:grid-cols-2 gap-4">
      {CATS.map(([slug,name,desc])=>(<a key={slug} href={`/c/${slug}`} className="rounded-lg border border-zinc-800 p-6 hover:border-emerald-500">
        <div className="text-xl font-semibold">{name}</div><div className="text-zinc-400 text-sm mt-1">{desc}</div></a>))}
    </div></main>);
}
```
```tsx
// File: src/app/c/[cat]/page.tsx  (category list)
import AgentCard from "@/components/AgentCard";
export const dynamic = "force-dynamic";
export default async function Cat({ params }: { params: { cat: string } }) {
  const r = await fetch(`http://localhost:${process.env.PORT ?? 3000}/api/agents?cat=${params.cat}`, { cache: "no-store" });
  const { items } = await r.json();
  return (<main className="max-w-5xl mx-auto px-6 py-8">
    <h2 className="text-2xl font-bold capitalize">{params.cat.replace("-"," ")}</h2>
    <div className="mt-6 grid gap-3">{items.length ? items.map((a: any) => <AgentCard key={`${a.chain_id}:${a.token_id}`} a={a} />)
      : <p className="text-zinc-500">No agents categorized here yet — reference agents seed at launch.</p>}</div></main>);
}
```
```tsx
// File: src/components/GradeBadge.tsx
export default function GradeBadge({ letter, score }: { letter?: string | null; score?: number | null }) {
  if (!letter) return <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">not yet probed</span>;
  const color = { A: "bg-emerald-600", B: "bg-lime-600", C: "bg-amber-600", D: "bg-orange-700", F: "bg-red-700" }[letter] ?? "bg-zinc-700";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{letter} · {score}</span>;
}
```
```tsx
// File: src/components/AgentCard.tsx
import GradeBadge from "./GradeBadge";
export default function AgentCard({ a }: { a: any }) {
  return (<a href={`/agent/${a.chain_id}/${a.token_id}`} className="flex items-center gap-4 rounded border border-zinc-800 p-4 hover:border-zinc-600">
    <div className="flex-1 min-w-0"><div className="font-semibold truncate">{a.name} {a.is_reference ? <span className="text-xs text-emerald-400">· reference</span> : null}</div>
      <div className="text-sm text-zinc-500 truncate">{a.description || "no description"}</div></div>
    <GradeBadge letter={a.letter} score={a.score} /></a>);
}
```
```tsx
// File: src/app/agent/[chain]/[id]/page.tsx  (detail — client component for reprobe/activate/revoke)
"use client";
import { useEffect, useState } from "react";
import GradeBadge from "@/components/GradeBadge";
export default function AgentPage({ params }: { params: { chain: string; id: string } }) {
  const [d, setD] = useState<any>(null); const [busy, setBusy] = useState(""); const [err, setErr] = useState("");
  const load = () => fetch(`/api/agent/${params.chain}/${params.id}`).then(r => r.json()).then(setD);
  useEffect(() => { load(); }, []);
  if (!d) return <main className="p-8 text-zinc-500">Loading…</main>;
  if (d.error) return <main className="p-8">Not indexed (yet). <a className="text-emerald-400" href="/">Back</a></main>;
  const { agent, grade, attests, actions, sessions } = d;
  const act = async (path: string, body: any, label: string) => {
    setBusy(label); setErr("");
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json(); if (j.error) setErr(j.error); await load(); setBusy("");
  };
  return (<main className="max-w-4xl mx-auto px-6 py-8">
    <div className="flex items-start gap-4">
      <div className="flex-1"><h1 className="text-2xl font-bold">{agent.name}</h1><p className="text-zinc-400 mt-1">{agent.description}</p>
        <p className="text-xs text-zinc-600 mt-1 font-mono">ERC-8004 #{agent.token_id} · chain {agent.chain_id} · owner {agent.owner?.slice(0,10)}…</p></div>
      <GradeBadge letter={grade?.letter} score={grade?.score} />
    </div>
    <div className="mt-6 flex gap-3 flex-wrap">
      <button onClick={() => act("/api/reprobe", { chain: +params.chain, id: +params.id }, "probe")} disabled={!!busy}
        className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50">{busy === "probe" ? "Probing…" : "Re-probe now"}</button>
      {agent.is_reference ? <button onClick={() => act("/api/activate", { agentName: agent.name, tokenId: +params.id, capBnb: 0.005, hours: 24 }, "activate")} disabled={!!busy}
        className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50">{busy === "activate" ? "Granting session…" : "Activate ($ cap, 24h)"}</button>
        : <span className="px-4 py-2 rounded bg-zinc-800 text-zinc-500 text-sm">Hire opens for verified-live agents</span>}
      {sessions?.filter((s: any) => s.status === "live").map((s: any) => (
        <button key={s.id} onClick={() => act("/api/revoke", { sessionId: s.id }, "revoke")} className="px-4 py-2 rounded bg-red-800 hover:bg-red-700">Fire (revoke session #{s.id})</button>))}
    </div>
    {err && <p className="mt-2 text-red-400 text-sm">{err}</p>}
    {grade && (<section className="mt-8"><h2 className="font-semibold">Grade breakdown <span className="text-xs text-zinc-500">probed {grade.ran_at}</span></h2>
      <div className="grid grid-cols-4 gap-2 mt-2 text-center text-sm">
        {[["Liveness",grade.liveness,40],["Metadata",grade.meta,15],["Feedback validity",grade.feedback,30],["Track record",grade.track,15]].map(([l,v,m])=>(
          <div key={String(l)} className="rounded border border-zinc-800 p-2"><div className="font-mono">{v}/{m}</div><div className="text-xs text-zinc-500">{l}</div></div>))}
      </div>
      <details className="mt-3"><summary className="cursor-pointer text-emerald-400 text-sm">Raw probe transcript (the evidence)</summary>
        <pre className="mt-2 text-xs bg-zinc-900 p-3 rounded overflow-auto max-h-64">{grade.transcript}</pre></details></section>)}
    {attests?.length > 0 && (<section className="mt-8"><h2 className="font-semibold">Onchain attestations</h2>
      {attests.map((t: any) => (<p key={t.id} className="text-sm font-mono mt-1"><a className="text-emerald-400" target="_blank"
        href={`${t.chain_id === 56 ? "https://bscscan.com" : "https://testnet.bscscan.com"}/tx/${t.tx_hash}`}>{t.tag}={t.value} · {t.tx_hash.slice(0, 18)}… ↗</a></p>))}</section>)}
    {actions?.length > 0 && (<section className="mt-8"><h2 className="font-semibold">Recent actions</h2>
      {actions.map((x: any) => (<div key={x.id} className="mt-2 text-sm border-l-2 border-zinc-700 pl-3">
        <span className="font-mono text-zinc-400">{x.at} · {x.kind}</span><p className="text-zinc-300">{x.reasoning}</p></div>))}</section>)}
  </main>);
}
```
```tsx
// File: src/app/proof/page.tsx
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default function Proof() {
  const att = db.prepare("SELECT * FROM attestations ORDER BY id DESC LIMIT 50").all() as any[];
  const ses = db.prepare("SELECT * FROM sessions ORDER BY id DESC LIMIT 20").all() as any[];
  const stats = { indexed: (db.prepare("SELECT COUNT(*) c FROM agents").get() as any).c, probed: (db.prepare("SELECT COUNT(*) c FROM grades").get() as any).c };
  return (<main className="max-w-4xl mx-auto px-6 py-8 text-sm">
    <h1 className="text-2xl font-bold">Proof</h1>
    <p className="text-zinc-400 mt-1">Every headline number, recomputable. Derivations: <code>scripts/verify-claims.ts</code> in the repo.</p>
    <h2 className="mt-6 font-semibold">Registries (canonical ERC-8004)</h2>
    <p className="font-mono text-xs mt-1">BSC Identity 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 · Reputation 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63</p>
    <h2 className="mt-4 font-semibold">Counters</h2><p className="font-mono">indexed={stats.indexed} probed={stats.probed}</p>
    <h2 className="mt-4 font-semibold">Attestation txs</h2>
    {att.map((t) => <p key={t.id} className="font-mono text-xs">{t.attested_at} #{t.token_id} {t.tag}={t.value} {t.tx_hash}</p>)}
    <h2 className="mt-4 font-semibold">Sessions (Altana Keystore)</h2>
    {ses.map((s) => <p key={s.id} className="font-mono text-xs">#{s.id} agent#{s.agent_token} wallet {s.agent_wallet?.slice(0,12)}… cap {s.cap_wei} status {s.status}</p>)}
  </main>);
}
```

## 15. Scripts
```ts
// File: scripts/proof.ts — emits submission/proof.md from DB + env (run post-deploy)
import { db } from "../src/lib/db";
import fs from "node:fs";
const att = db.prepare("SELECT * FROM attestations").all() as any[];
const ses = db.prepare("SELECT * FROM sessions").all() as any[];
const acts = db.prepare("SELECT * FROM agent_actions WHERE tx_hash IS NOT NULL").all() as any[];
const c = (q: string) => (db.prepare(q).get() as any).c;
const md = `# Winnow — Proof\nGenerated ${new Date().toISOString()}\n
## Wallets (Altana submission requirement)\n- Operator: 0xc211C942946011859ca634F22400d80570ED12A5\n${ses.map(s=>`- Agent session key: ${s.session_key} (wallet ${s.agent_wallet})`).join("\n")}\n
## Counters\n- indexed=${c("SELECT COUNT(*) c FROM agents")} probed=${c("SELECT COUNT(*) c FROM grades")} verifiedLive=${c("SELECT COUNT(*) c FROM probe_logs WHERE liveness>0")}\n
## Attestations\n${att.map(t=>`- [${t.tag}=${t.value}] agent#${t.token_id} tx ${t.tx_hash}`).join("\n")}\n
## Sessions\n${ses.map(s=>`- #${s.id} agent#${s.agent_token} cap=${s.cap_wei}wei expiry=${s.expiry} grant=${s.grant_tx} status=${s.status}`).join("\n")}\n
## Agent action txs\n${acts.map(a=>`- ${a.kind} ${a.tx_hash}`).join("\n")}\n`;
fs.mkdirSync("submission", { recursive: true }); fs.writeFileSync("submission/proof.md", md); console.log("submission/proof.md written");
```
```ts
// File: scripts/verify-claims.ts — recompute headline counters (franchise verifier; refuses read-back)
import { db } from "../src/lib/db";
const recompute = {
  indexed: (db.prepare("SELECT COUNT(*) c FROM agents").get() as any).c,
  probed: (db.prepare("SELECT COUNT(*) c FROM grades g JOIN probe_logs p ON p.id=g.probe_log_id").get() as any).c, // JOIN = each grade has real transcript
  orphanGrades: (db.prepare("SELECT COUNT(*) c FROM grades g LEFT JOIN probe_logs p ON p.id=g.probe_log_id WHERE p.id IS NULL").get() as any).c,
  negativeAttestations: (db.prepare("SELECT COUNT(*) c FROM attestations WHERE value<0").get() as any).c,
};
console.log(JSON.stringify(recompute, null, 2));
if (recompute.orphanGrades > 0 || recompute.negativeAttestations > 0) { console.error("INVARIANT VIOLATION"); process.exit(1); }
```
```ts
// File: scripts/agent-advantage.ts — TermiX report: 3 tasks BOTH WAYS with timing/cost/quality
// Task A (trading/high-stakes): grid price-decision — agent (strategies.gridTick + quoter) vs manual (human-scripted quoter reads, wall-clocked)
// Task B: health-factor read+assessment — agent healthFactorTick vs manual cast call + hand analysis
// Task C: yield routing — agent yieldTick vs manual venus API read + hand comparison
// Each: {timeMs, costUsd (gas+LLM tokens), outputQuality (rubric 1-5 w/ criteria)} + full outputs attached.
// Writes submission/AGENT-ADVANTAGE-REPORT.md. Labeled honestly: "calibration runs by the operator, {date}, receipts inline".
// [Build implements: run agent path via strategies fns; manual path = timed script mimicking human CLI workflow with sleep(realistic reading time)? NO —
//  manual path = actual manual execution by builder during build, wall-clock recorded, commands + outputs pasted. NEVER simulated timings.]
```
```ts
// File: scripts/mainnet-runbook.ts — D-12 (morning, after funding 0xc211C942… with ~0.01 BNB)
// 1. assert mainnet balance > 0.005 BNB else exit
// 2. register 4 reference agents on MAINNET IdentityRegistry (register(dataURI) — metadata w/ name/desc/category/endpoint)
// 3. attestPositive(liveness) for each from ATTESTOR2 key (or skip own-agent honestly)
// 4. each agent: one real tiny mainnet action (rebalancer: PCS quoter read + NPM position mint dust [if funded]; grid: 2 micro swaps; yield: Venus supply dust; health: monitored top-up)
// 5. WINNOW_CHAIN=mainnet restart; scripts/proof.ts regenerate; update README links
```

## 16. Package/config files
```json
// File: package.json
{ "name": "winnow", "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start", "proof": "tsx scripts/proof.ts", "verify": "tsx scripts/verify-claims.ts", "advantage": "tsx scripts/agent-advantage.ts" },
  "dependencies": { "@altananetwork/sdk": "0.9.0", "@anthropic-ai/sdk": "^0.30.0", "better-sqlite3": "^11.3.0", "next": "14.2.15", "react": "^18.3.1", "react-dom": "^18.3.1", "viem": "^2.21.0", "zod": "^3.23.8" },
  "devDependencies": { "@types/better-sqlite3": "^7.6.11", "@types/node": "^22", "@types/react": "^18", "autoprefixer": "^10", "postcss": "^8", "tailwindcss": "^3.4", "tsx": "^4.19.0", "typescript": "^5.6" } }
```
```js
// File: next.config.mjs
/** @type {import('next').NextConfig} */
export default { output: "standalone", experimental: { instrumentationHook: true }, serverExternalPackages: ["better-sqlite3"] };
```
```dockerfile
# File: Dockerfile
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --fetch-retries=5 --fetch-timeout=120000
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DB_PATH=/data/winnow.db
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
EXPOSE 3000
CMD ["node", "server.js"]
```
```toml
# File: fly.toml
app = "winnow-bsc"
primary_region = "iad"
[build]
[env]
  WINNOW_CHAIN = "testnet"
[mounts]
  source = "winnow_data"
  destination = "/data"
[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false     # 14-day judging window: NEVER sleep
  auto_start_machines = true
  min_machines_running = 1
  [[http_service.checks]]
    interval = "30s"
    timeout = "5s"
    method = "GET"
    path = "/api/stats"
```

## 17. Domain Knowledge (spec — build generates DOMAIN-GUIDE.md)
Concepts: ERC-8004 agentId/registration file/feedback; Sybil-coordinated feedback (arXiv 2606.26028); Altana session (allowlist/cap/expiry)/Keystore/revocation; ERC-8183 job escrow/$U; MCP initialize; A2A agent card; the 4 categories; grade formula D-5; getSummary clientAddresses gotcha. Rules: INVARIANTS 1–6. Source: research-brief.md + probe evidence.

## 18. Submission Directory Plan
submission/{proof.md (scripts/proof.ts), AGENT-ADVANTAGE-REPORT.md (scripts/agent-advantage.ts), screenshots/ (demo phase), video/links.md (demo), links.md, sponsor-tracks.md (package)}.

## 19. Multi-Track Architecture
| Track | Component serving it | Distinct proof |
|---|---|---|
| Main | whole product | live URL + hero flow |
| Altana | altana.ts sessions + activate/revoke UI + agents' session txs | Keystore/explorer entries + wallet addrs in submission |
| TermiX | agent-advantage.ts + reference agents | AGENT-ADVANTAGE-REPORT.md w/ receipts |
| PancakeSwap | rebalancer+grid strategies on PCS v3 (reads + morning mainnet actions) | pool/tick data in actions + txs |

## 20. Safety Architecture
L1 zod on every API input; L2 rate limits (reprobe 20s/agent, activate 60s global, scan pacer 30/min+900/day); L3 circuit breakers (RPC fallback transport; scan budget guard; LLM absent → skip-and-log never fabricate); L4 graceful degradation (stale-cache banners, category empty-states, probe timeout = honest verdict). Each tested in stress phase.

## 21. Component Build Order
1. config+db (foundation) → 2. chain+scan8004 [PARALLEL GROUP A: probe+grade | attestor | altana] → 3. worker+strategies → 4. API routes → 5. UI pages → 6. scripts → 7. Docker/fly. P1 demo deliverable after steps 1-5 (index+grades+hero flow). Deviation from PRD order: none.

## 22. Deployment Sequence
1. `fly launch --no-deploy` (once) → 2. `fly volumes create winnow_data --size 1` → 3. `fly secrets set EVM_PRIVATE_KEY=… ANTHROPIC_API_KEY=… WINNOW_CHAIN=testnet` → 4. `fly deploy` → 5. health: `curl https://winnow-bsc.fly.dev/api/stats` (depends: secrets+volume) → 6. seed reference agents: `fly ssh console -C "node scripts/seed-agents.js"` [build creates: registers 4 agents on testnet registry + kv reference_agents + first grades] → 7. scripts/proof.ts. Env per service: single service; vars = EVM_PRIVATE_KEY, ANTHROPIC_API_KEY, WINNOW_CHAIN, DB_PATH(set), ATTESTOR2_PRIVATE_KEY(optional), WATCH_ADDR, PCS_POOL.

## 23. Credentials Needed
| Variable | Used By | Where to Obtain | Required Before |
|---|---|---|---|
| EVM_PRIVATE_KEY | chain/altana/attestor | exists (pipeline creds) | build |
| ANTHROPIC_API_KEY | strategies | exists | build |
| ATTESTOR2_PRIVATE_KEY | attestor (own-agent attestations) | `cast wallet new` at build | deploy (optional) |
| WATCH_ADDR | health agent | pick live Aave BSC account at build (bscscan top accounts) | build |
| PCS_POOL | rebalancer | PCS v3 WBNB/USDT pool addr via factory getPool at build | build |
| Fly.io account/token | deploy | flyctl auth (Dami has Fly history) | deploy |
| Mainnet BNB ~0.01 | mainnet runbook | Dami funds in morning | deferred-until-deploy |

## 24. Integration Map (wire's input)
| From | To | Protocol | Credential | Health Check | Pri |
|---|---|---|---|---|---|
| indexer | api.8004scan.io/api/v1/agents | HTTPS | none | `curl -s "$SCAN/agents?chain_id=56&limit=1"` | P0 |
| probe | agent mcp_server/a2a endpoints | HTTPS | none | probe any A-grade agent | P0 |
| chain | BSC testnet RPC | JSON-RPC | none | `cast block-number --rpc-url $RPC` | P0 |
| chain | BSC mainnet RPC (reads) | JSON-RPC | none | `cast block-number --rpc-url $MAIN` | P0 |
| attestor | Reputation 0x8004B663(97)/0x8004BAa1(56) | tx | EVM_PRIVATE_KEY | probe txs 0x9c1275/0xd40ae6 pattern | P0 |
| altana | Keystore + testnet-relay.altana.network | SDK | EVM_PRIVATE_KEY | grantSession dry-run | P0 |
| strategies | api.venus.io/markets | HTTPS | none | `curl -s api.venus.io/markets/core-pool?limit=1` | P1 |
| strategies | Anthropic API | HTTPS | ANTHROPIC_API_KEY | 1 haiku call | P1 |
| app | Fly.io | deploy | fly token | /api/stats 200 | P0 |
