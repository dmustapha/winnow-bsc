// File: src/lib/attestor.ts
import { getWallet, pub, REPUTATION_ABI, getOperator } from "./chain";
import { A } from "./config";
import { db } from "./db";
const ALLOWED_TAGS = new Set(["liveness", "metadata"]);
export async function attestPositive(tokenId: number, tag: string, value: number, evidenceURI: string) {
  if (!ALLOWED_TAGS.has(tag) || value < 0 || value > 100) throw new Error("INVARIANT-2: positive/neutral allowlisted attestations only");
  const owner = await pub.readContract({ address: A.identity as `0x${string}`, abi: require("./chain").REGISTRY_ABI, functionName: "ownerOf", args: [BigInt(tokenId)] }).catch(() => null);
  let signer = getWallet();
  if (owner && String(owner).toLowerCase() === getOperator().address.toLowerCase()) {
    // spec: owner cannot feedback own agent — reference agents get attested by a SECOND operator key if configured, else skip honestly
    if (!process.env.ATTESTOR2_PRIVATE_KEY) throw new Error("own-agent: attestor2 key not set — skip (never fake)");
    const { createWalletClient, http } = require("viem");
    const { privateKeyToAccount } = require("viem/accounts");
    const attestor2 = privateKeyToAccount(process.env.ATTESTOR2_PRIVATE_KEY as `0x${string}`);
    signer = createWalletClient({ account: attestor2, chain: getWallet().chain, transport: http(A.rpc) });
  }
  const hash = await signer.writeContract({
    address: A.reputation as `0x${string}`, abi: REPUTATION_ABI, functionName: "giveFeedback",
    args: [BigInt(tokenId), BigInt(value), 0, tag, "winnow", "", evidenceURI, "0x0000000000000000000000000000000000000000000000000000000000000000"],
  });
  await pub.waitForTransactionReceipt({ hash });
  db.prepare("INSERT INTO attestations(chain_id,token_id,tag,value,tx_hash) VALUES(?,?,?,?,?)").run(A.id, tokenId, tag, value, hash);
  return hash;
}
