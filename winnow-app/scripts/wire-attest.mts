// wire evidence: attest measured liveness (probe_log 462) for probed reference agent 97:2288
import { attestPositive } from "../src/lib/attestor";
import { pub } from "../src/lib/chain";
const evidence = Buffer.from(JSON.stringify({
  source: "winnow-probe", probeLogId: 462, chainId: 97, tokenId: 2288,
  measured: { liveness: 32, meta: 10, feedback: 12, track: 15, score: 69, letter: "C" },
  ranAt: "2026-09-09 04:29:34",
})).toString("base64");
const tx = await attestPositive(2288, "liveness", 32, `data:application/json;base64,${evidence}`);
console.log("attest tx:", tx);
const rc = await pub.getTransactionReceipt({ hash: tx as `0x${string}` });
console.log("receipt status:", rc.status, "block:", rc.blockNumber.toString());
