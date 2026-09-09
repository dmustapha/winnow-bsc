// tests/unit/debug-p2-risk-paced-retry.test.ts — DEV-006 fix verification.
// paced() must retry exactly once on transient failures (network error / 5xx / 429)
// and must NOT retry on non-transient failures (404). fetch is stubbed here because a
// deterministic 8004scan outage cannot be triggered on demand; pacing/budget paths are real.
import assert from "node:assert";

async function main() {
  const calls: string[] = [];
  let responses: Array<() => Response | null> = [];
  (globalThis as any).fetch = async (url: string) => {
    calls.push(String(url));
    const next = responses.shift();
    if (!next) throw new Error("no scripted response left");
    const r = next();
    if (r === null) throw new TypeError("fetch failed (scripted network error)");
    return r;
  };

  const { agentDetail } = await import("../../src/lib/scan8004");

  // 1) transient 500 then success → retried once, JSON returned
  responses = [
    () => new Response("boom", { status: 500 }),
    () => new Response(JSON.stringify({ token_id: 1, name: "ok" }), { status: 200 }),
  ];
  const j1 = await agentDetail(56, 1);
  assert.equal(calls.length, 2, "500 must trigger exactly one retry");
  assert.equal(j1?.name, "ok", "retry result must be returned");
  console.log("  ok transient 500 → one retry → success");

  // 2) network error then success → retried once
  calls.length = 0;
  responses = [() => null, () => new Response(JSON.stringify({ token_id: 2 }), { status: 200 })];
  const j2 = await agentDetail(56, 2);
  assert.equal(calls.length, 2, "network error must trigger exactly one retry");
  assert.equal(j2?.token_id, 2);
  console.log("  ok network error → one retry → success");

  // 3) two transient failures → gives up after ONE retry (returns null, 2 calls total)
  calls.length = 0;
  responses = [() => new Response("x", { status: 503 }), () => new Response("x", { status: 503 })];
  const j3 = await agentDetail(56, 3);
  assert.equal(calls.length, 2, "must not retry more than once");
  assert.equal(j3, null);
  console.log("  ok double transient → null after exactly 2 attempts");

  // 4) non-transient 404 → NO retry
  calls.length = 0;
  responses = [() => new Response("nf", { status: 404 })];
  const j4 = await agentDetail(56, 4);
  assert.equal(calls.length, 1, "404 must not be retried");
  assert.equal(j4, null);
  console.log("  ok 404 → no retry");

  console.log("PASS debug-p2-risk-paced-retry.test (4 checks)");
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
