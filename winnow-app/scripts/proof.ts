// File: scripts/proof.ts — emits submission/proof.md from DB + env (run post-deploy)
// ARCH §15 verbatim, extended (C5): reference agent registration txs (kv reference_agents)
// + full session lifecycle (grant AND revoke txs, status).
import { db, kvGet } from "../src/lib/db";
import { A } from "../src/lib/config";
import fs from "node:fs";
const att = db.prepare("SELECT * FROM attestations").all() as any[];
const ses = db.prepare("SELECT * FROM sessions").all() as any[];
const acts = db.prepare("SELECT * FROM agent_actions WHERE tx_hash IS NOT NULL").all() as any[];
const refs = JSON.parse(kvGet("reference_agents") ?? "[]") as { name: string; tokenId: number; category: string; registerTx: string }[];
const c = (q: string) => (db.prepare(q).get() as any).c;
const ex = A.explorer;
const md = `# Winnow — Proof
Generated ${new Date().toISOString()}
Write-side chain: ${A.id === 97 ? "BSC testnet (97)" : "BSC mainnet (56)"} — every explorer link below is on ${ex}. Market-data reads are BSC mainnet.

## Wallets (Altana submission requirement)
- Operator: 0xc211C942946011859ca634F22400d80570ED12A5
${ses.map((s) => `- Agent session key: ${s.session_key} (wallet ${s.agent_wallet})`).join("\n")}

## Counters
- indexed=${c("SELECT COUNT(*) c FROM agents")} probed=${c("SELECT COUNT(*) c FROM grades")} verifiedLive=${c("SELECT COUNT(*) c FROM probe_logs WHERE liveness>0")}

## Reference agent registrations (ERC-8004 Identity ${A.identity}, chain ${A.id})
${refs.map((r) => `- ${r.name} (${r.category}) — agent #${r.tokenId} — register tx ${ex}/tx/${r.registerTx}`).join("\n")}
- A2A cards served at https://winnow-bsc.fly.dev/api/a2a/{slug} (a2a_endpoint rows point at the live deployment; graded via public probes)

## Attestations
${att.map((t) => `- [${t.tag}=${t.value}] agent#${t.token_id} tx ${ex}/tx/${t.tx_hash}`).join("\n")}

## Sessions (Altana Keystore ${A.keystore} — full lifecycle)
${ses.map((s) => `- #${s.id} agent#${s.agent_token} cap=${s.cap_wei}wei expiry=${s.expiry} status=${s.status}\n  - grant ${ex}/tx/${s.grant_tx}${s.revoke_tx ? `\n  - revoke ${ex}/tx/${s.revoke_tx}` : ""}`).join("\n")}

## Agent action txs
${acts.map((a) => `- ${a.kind} ${ex}/tx/${a.tx_hash}`).join("\n")}
`;
fs.mkdirSync("submission", { recursive: true });
fs.writeFileSync("submission/proof.md", md);
console.log("submission/proof.md written");
