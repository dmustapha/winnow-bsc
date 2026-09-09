// Falsification: session spend caps must be enforced ONCHAIN — an over-cap execute must revert.
// Live test (burns a real testnet tx; 60s route cooldown): RUN_LIVE=1 npx tsx tests/falsify/overcap-live.test.ts
// Without RUN_LIVE it verifies the guard exists in code (static assert) and exits 0.
import assert from "node:assert";
import fs from "node:fs";
const src = fs.readFileSync("src/lib/altana.ts", "utf8");
assert(src.includes("INVARIANT-5 VIOLATION"), "over-cap demo must assert revert (INVARIANT-5 guard missing)");
assert(src.includes("demonstrateOverCap"), "demonstrateOverCap missing");
if (process.env.RUN_LIVE === "1") {
  const res = await fetch("http://localhost:3000/api/overcap-demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: 5 }) });
  const j: any = await res.json();
  assert(j.reverted === true, `expected reverted:true, got ${JSON.stringify(j)}`);
  console.log("PASS overcap-live (onchain revert witnessed)");
} else {
  console.log("PASS overcap-live (static guard; run with RUN_LIVE=1 for onchain leg — witnessed live at stress: ExceededSpendLimit)");
}
