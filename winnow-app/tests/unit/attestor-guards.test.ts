// tests/unit/attestor-guards.test.ts — INVARIANT 2 guards fire BEFORE any chain call.
// Hermetic: dummy key (chain.ts derives the account at import; no network happens at import),
// and every asserted rejection comes from the synchronous first-line guard — a chain call would
// instead fail slowly with an RPC error, which the message assertion would catch.
import assert from "node:assert";
process.env.EVM_PRIVATE_KEY ??= "0x0000000000000000000000000000000000000000000000000000000000000001";

async function expectInvariantThrow(p: Promise<unknown>, label: string) {
  const t0 = Date.now();
  try { await p; assert.fail(`${label}: did not throw`); }
  catch (e: any) {
    assert.match(String(e?.message ?? e), /INVARIANT-2/, `${label}: wrong error: ${e}`);
    assert.ok(Date.now() - t0 < 500, `${label}: too slow — suggests a chain call happened first`);
  }
}

async function main() {
  const { attestPositive } = await import("../../src/lib/attestor");
  await expectInvariantThrow(attestPositive(2286, "spam", 10, "data:,x"), "bad tag");
  await expectInvariantThrow(attestPositive(2286, "liveness", -1, "data:,x"), "negative value");
  await expectInvariantThrow(attestPositive(2286, "liveness", 101, "data:,x"), "value > 100");
  console.log("PASS attestor-guards.test (3 guard rejections, all pre-chain)");
}
main().catch((e) => { console.error(e); process.exit(1); });
