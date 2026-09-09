// File: scripts/seed-agents.ts — C3-T3.3
// Registers 4 reference agents on TESTNET ERC-8004 identity (register(string dataURI)),
// parses tokenId from the Transfer log (topics[3]), inserts agents rows (chain 97, is_reference=1),
// writes kv reference_agents, grades each (probe finds no endpoints — honest: their value shows
// via track record/actions), then honestly auto-categorizes indexed mainnet agents by description keywords.
// Run: npx tsx --env-file=.env scripts/seed-agents.ts
import { getWallet, pub, REGISTRY_ABI } from "../src/lib/chain";
import { A } from "../src/lib/config";
import { db, kvGet, kvSet } from "../src/lib/db";
import { gradeAgent } from "../src/lib/grade";

const REFS = [
  { name: "Winnow Sentinel", category: "health-factor", description: "Reference health-factor monitor: watches a live Aave v3 BSC account's health factor and reasons about liquidation risk each tick." },
  { name: "Winnow Harvester", category: "yield", description: "Reference yield optimizer: compares live Venus BSC core-pool supply APYs and routes the next dollar with reasoned justification." },
  { name: "Winnow Ranger", category: "rebalancing", description: "Reference LP rebalancer: reads the live PancakeSwap v3 WBNB/USDT pool tick against its position range and decides when to rebalance." },
  { name: "Winnow Gridsmith", category: "grid-trading", description: "Reference grid trader: derives spot from the live PCS v3 pool tick and places 0.5%-step grid decisions around it." },
] as const;

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function registerRef(r: (typeof REFS)[number]): Promise<{ tokenId: number; tx: string }> {
  const dataURI = "data:application/json;base64," + Buffer.from(JSON.stringify({ type: "Agent", name: r.name, description: r.description, category: r.category })).toString("base64");
  const hash = await getWallet().writeContract({ address: A.identity as `0x${string}`, abi: REGISTRY_ABI, functionName: "register", args: [dataURI] });
  const receipt = await pub.waitForTransactionReceipt({ hash });
  const transfer = receipt.logs.find((l) => l.address.toLowerCase() === A.identity.toLowerCase() && l.topics[0] === TRANSFER_TOPIC && l.topics.length === 4);
  if (!transfer) throw new Error(`no Transfer log in register tx ${hash}`);
  const tokenId = Number(BigInt(transfer.topics[3]!));
  return { tokenId, tx: hash };
}

async function main() {
  const existing = JSON.parse(kvGet("reference_agents") ?? "[]") as { name: string; tokenId: number; category: string; registerTx?: string }[];
  const out = [...existing];
  for (const r of REFS) {
    if (out.some((e) => e.name === r.name)) { console.log(`skip (already registered): ${r.name}`); continue; }
    const { tokenId, tx } = await registerRef(r);
    console.log(`registered ${r.name} → tokenId ${tokenId} tx ${tx}`);
    db.prepare(`INSERT INTO agents(chain_id,token_id,name,description,owner,category,is_reference) VALUES(?,?,?,?,?,?,1)
      ON CONFLICT(chain_id,token_id) DO UPDATE SET name=excluded.name,description=excluded.description,category=excluded.category,is_reference=1`)
      .run(A.id, tokenId, r.name, r.description, getWallet().account!.address, r.category);
    out.push({ name: r.name, tokenId, category: r.category, registerTx: tx });
    kvSet("reference_agents", JSON.stringify(out)); // persist incrementally — a later failure loses nothing
    const g = await gradeAgent(A.id, tokenId); // honest: no endpoints → low probe score; value shows via track record/actions
    console.log(`  graded: ${g.letter} (${g.score})`);
  }

  // Honest auto-categorization of indexed mainnet agents (keyword heuristic — labeled `auto` in UI per PRD 7.7)
  const CATS: [string, string[]][] = [
    ["rebalancing", ["rebalanc", "lp range", "liquidity range", "concentrated liquidity"]],
    ["grid-trading", ["grid"]],
    ["yield", ["yield", "apy", "apr"]],
    ["health-factor", ["health factor", "liquidat", "collateral monitor"]],
  ];
  for (const [cat, kws] of CATS) {
    const where = kws.map(() => "lower(description) LIKE ?").join(" OR ");
    const res = db.prepare(`UPDATE agents SET category=? WHERE category IS NULL AND is_reference=0 AND description IS NOT NULL AND (${where})`)
      .run(cat, ...kws.map((k) => `%${k}%`));
    console.log(`auto-categorized ${cat}: +${res.changes}`);
  }
  const counts = db.prepare("SELECT category, COUNT(*) c, SUM(is_reference) refs FROM agents WHERE category IS NOT NULL GROUP BY category").all();
  console.log("per-category:", JSON.stringify(counts));
}

main().then(() => process.exit(0)).catch((e) => { console.error("SEED FAIL:", e?.message ?? e); process.exit(1); });
