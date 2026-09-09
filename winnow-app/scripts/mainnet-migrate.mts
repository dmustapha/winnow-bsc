// One-shot mainnet migration proof (D-1): registers the 4 reference agents on BSC MAINNET
// ERC-8004 identity, then writes one INVARIANT-2 liveness attestation (attestor2, spec bars self-feedback).
// Uses a throwaway DB so nothing in the deployed testnet app is touched. Emits /tmp/mainnet-proof.json.
// Run: WINNOW_CHAIN=mainnet DB_PATH=/tmp/winnow-mainnet.db npx tsx --env-file=.env scripts/mainnet-migrate.mts
import { getWallet, getOperator, pub, REGISTRY_ABI } from "../src/lib/chain";
import { attestPositive } from "../src/lib/attestor";
import { A } from "../src/lib/config";
import { privateKeyToAccount } from "viem/accounts";
import { parseEther } from "viem";
import { bsc } from "viem/chains";
import fs from "node:fs";

if (A.id !== 56) throw new Error(`expected mainnet (56), got ${A.id} — set WINNOW_CHAIN=mainnet`);

const REFS = [
  { name: "Winnow Sentinel", category: "health-factor", description: "Reference health-factor monitor: watches a live Aave v3 BSC account's health factor and reasons about liquidation risk each tick." },
  { name: "Winnow Harvester", category: "yield", description: "Reference yield optimizer: compares live Venus BSC core-pool supply APYs and routes the next dollar with reasoned justification." },
  { name: "Winnow Ranger", category: "rebalancing", description: "Reference LP rebalancer: reads the live PancakeSwap v3 WBNB/USDT pool tick against its position range and decides when to rebalance." },
  { name: "Winnow Gridsmith", category: "grid-trading", description: "Reference grid trader: derives spot from the live PCS v3 pool tick and places 0.5%-step grid decisions around it." },
] as const;
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function register(r: (typeof REFS)[number]) {
  const dataURI = "data:application/json;base64," + Buffer.from(JSON.stringify({ type: "Agent", name: r.name, description: r.description, category: r.category })).toString("base64");
  const hash = await getWallet().writeContract({ address: A.identity as `0x${string}`, abi: REGISTRY_ABI, functionName: "register", args: [dataURI] });
  const receipt = await pub.waitForTransactionReceipt({ hash });
  const t = receipt.logs.find((l) => l.address.toLowerCase() === A.identity.toLowerCase() && l.topics[0] === TRANSFER_TOPIC && l.topics.length === 4);
  if (!t) throw new Error(`no Transfer log in ${hash}`);
  return { tokenId: Number(BigInt(t.topics[3]!)), tx: hash };
}

async function main() {
  const out: any = { chain: 56, operator: getOperator().address, registrations: [], attestation: null };
  for (const r of REFS) {
    const { tokenId, tx } = await register(r);
    console.log(`registered ${r.name} -> #${tokenId} ${tx}`);
    out.registrations.push({ name: r.name, category: r.category, tokenId, tx });
  }

  // Fund attestor2 for one attestation (operator owns the refs; spec bars self-feedback).
  const a2 = privateKeyToAccount(process.env.ATTESTOR2_PRIVATE_KEY as `0x${string}`);
  const bal = await pub.getBalance({ address: a2.address });
  if (bal < parseEther("0.00005")) {
    const fundTx = await getWallet().sendTransaction({ to: a2.address, value: parseEther("0.0002") });
    await pub.waitForTransactionReceipt({ hash: fundTx });
    console.log(`funded attestor2 ${a2.address}: ${fundTx}`);
    out.fundAttestor2Tx = fundTx;
  }
  const target = out.registrations[0];
  const evidence = Buffer.from(JSON.stringify({ source: "winnow-mainnet-migration", chainId: 56, tokenId: target.tokenId, measured: { liveness: 32 }, note: "mainnet write-path proof" })).toString("base64");
  const attestTx = await attestPositive(target.tokenId, "liveness", 32, `data:application/json;base64,${evidence}`);
  console.log(`attested liveness on #${target.tokenId}: ${attestTx}`);
  out.attestation = { tokenId: target.tokenId, tag: "liveness", value: 32, tx: attestTx };

  const remaining = await pub.getBalance({ address: getOperator().address });
  out.operatorRemainingBnb = Number(remaining) / 1e18;
  fs.writeFileSync("/tmp/mainnet-proof.json", JSON.stringify(out, null, 2));
  console.log("WROTE /tmp/mainnet-proof.json; operator remaining:", out.operatorRemainingBnb, "BNB");
}
main().then(() => process.exit(0)).catch((e) => { console.error("MIGRATE FAIL:", e?.message ?? e); process.exit(1); });
