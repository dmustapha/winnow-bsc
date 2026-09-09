// tests/unit/grade-formula.test.ts — D-5 letter thresholds (A>=85 B>=70 C>=55 D>=40 else F)
// Runs against the real src/lib/grade.ts letterFor. Until C2 lands grade.ts, prints SKIP and exits 0.
import assert from "node:assert";

async function main() {
  let letterFor: (s: number) => string;
  try {
    ({ letterFor } = await import("../../src/lib/grade"));
  } catch {
    console.log("SKIP grade-formula.test: src/lib/grade.ts not built yet (lands in phase C2)");
    return;
  }
  assert.equal(letterFor(100), "A");
  assert.equal(letterFor(85), "A");
  assert.equal(letterFor(84), "B");
  assert.equal(letterFor(70), "B");
  assert.equal(letterFor(69), "C");
  assert.equal(letterFor(55), "C");
  assert.equal(letterFor(54), "D");
  assert.equal(letterFor(40), "D");
  assert.equal(letterFor(39), "F");
  assert.equal(letterFor(0), "F");
  console.log("PASS grade-formula.test (10 assertions)");
}
main().catch((e) => { console.error(e); process.exit(1); });
