// C3 unit: pure data helpers for reference-agent strategies (offline; no network, no LLM).
// Hermetic: dummy key so chain.ts import-time account derivation works without .env.
import assert from "node:assert";
process.env.EVM_PRIVATE_KEY ??= "0x0000000000000000000000000000000000000000000000000000000000000001";

async function main() {
  const { topVenusMarkets, usdtPerWbnbFromTick } = await import("../../src/lib/agents/strategies");

  // topVenusMarkets: filters zero/NaN APY, sorts desc, caps at 5, tolerates missing shape
  const fixture = { result: [
    { symbol: "vvhU", supplyApy: "0" },
    { symbol: "vUSDT", supplyApy: 2.78 },
    { symbol: "vFDUSD", supplyApy: "2.72" },
    { symbol: "vBad", supplyApy: "not-a-number" },
    { underlyingSymbol: "BNB", supplyApy: 1.1 },
    { symbol: "vA", supplyApy: 0.2 }, { symbol: "vB", supplyApy: 0.3 }, { symbol: "vC", supplyApy: 0.4 },
  ] };
  const top = topVenusMarkets(fixture);
  assert.strictEqual(top.length, 5);
  assert.strictEqual(top[0].sym, "vUSDT");
  assert.strictEqual(top[1].sym, "vFDUSD");
  assert.ok(top.every((m) => m.supplyApy > 0));
  assert.deepStrictEqual(topVenusMarkets(null), []);
  assert.deepStrictEqual(topVenusMarkets({}), []);

  // usdtPerWbnbFromTick: token0=USDT so price must INVERT the tick ratio (regression: raw 1.0001^tick gave ~0.0013)
  const spot = usdtPerWbnbFromTick(-66226);
  assert.ok(spot > 100 && spot < 10000, `spot ${spot} out of sane WBNB/USDT band`);
  assert.ok(Math.abs(usdtPerWbnbFromTick(0) - 1) < 1e-9);

  console.log("strategies-data: all assertions passed");
}
main();
