// tests/unit/pacer.test.ts — 8004scan pacer: >=2.3s spacing, budget counter, 900/day cap guard.
// Real code, real API (2 paced calls), isolated test DB. Until C1 lands scan8004.ts, prints SKIP.
process.env.DB_PATH = "./data/test-pacer.db";
import assert from "node:assert";
import fs from "node:fs";

async function main() {
  let scan: typeof import("../../src/lib/scan8004");
  try {
    scan = await import("../../src/lib/scan8004");
  } catch {
    console.log("SKIP pacer.test: src/lib/scan8004.ts not built yet (lands in phase C1)");
    return;
  }
  const { kvGet, kvSet } = await import("../../src/lib/db");
  const today = new Date().toISOString().slice(0, 10);

  // 1) two real paced calls must be spaced >= 2300ms
  const t0 = Date.now();
  await scan.agentDetail(56, 49637);
  await scan.agentDetail(56, 49637);
  const elapsed = Date.now() - t0;
  assert.ok(elapsed >= 2300, `pacing violated: 2 calls in ${elapsed}ms (< 2300ms)`);

  // 2) budget counter incremented by 2 for today
  const budget = JSON.parse(kvGet("scan_budget") ?? "{}");
  assert.equal(budget.day, today, "scan_budget day mismatch");
  assert.ok(budget.n >= 2, `scan_budget n=${budget.n}, expected >= 2`);

  // 3) daily cap guard: at n=900 paced() must return null (no fetch)
  kvSet("scan_budget", JSON.stringify({ day: today, n: 900 }));
  const capped = await scan.agentDetail(56, 49637);
  assert.equal(capped, null, "900/day cap guard did not return null");

  console.log(`PASS pacer.test (spacing=${elapsed}ms, budget+cap guards ok)`);
}
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { try { fs.rmSync("./data/test-pacer.db"); fs.rmSync("./data/test-pacer.db-wal", { force: true }); fs.rmSync("./data/test-pacer.db-shm", { force: true }); } catch {} });
