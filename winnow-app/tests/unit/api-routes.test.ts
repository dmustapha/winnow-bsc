// tests/unit/api-routes.test.ts — C4 route handlers against the REAL SQLite DB (no mocks).
// Covers: /api/stats shape+truth, /api/agents validation+ordering, /api/agent/[chain]/[id] 404/200,
// /api/reprobe 400 + real probe + 20s cooldown 429. Altana routes (activate/revoke/overcap) are
// live-chain writes — exercised at the dev-server gate + livetest, not here.
import assert from "node:assert";

async function main() {
  const { db } = await import("../../src/lib/db");
  const stats = await import("../../src/app/api/stats/route");
  const agents = await import("../../src/app/api/agents/route");
  const detail = await import("../../src/app/api/agent/[chain]/[id]/route");
  const reprobe = await import("../../src/app/api/reprobe/route");
  let n = 0;
  const ok = (name: string) => { n++; console.log(`  ok ${name}`); };

  // /api/stats — counters recompute from the DB (INVARIANT 6)
  {
    const j = await stats.GET().json();
    const indexed = (db.prepare("SELECT COUNT(*) c FROM agents").get() as any).c;
    const probed = (db.prepare("SELECT COUNT(*) c FROM grades").get() as any).c;
    assert.equal(j.indexed, indexed);
    assert.equal(j.probed, probed);
    assert.ok(typeof j.verifiedLive === "number" && typeof j.withEndpoints === "number");
    assert.ok(typeof j.indexComplete === "boolean");
    ok("stats matches direct DB recompute");
  }

  // /api/agents — bad query 400, valid list 200, ungraded rows included (INVARIANT 3)
  {
    const bad = agents.GET(new Request("http://x/api/agents?page=-1"));
    assert.equal(bad.status, 400);
    ok("agents rejects negative page (400)");

    const r = agents.GET(new Request("http://x/api/agents"));
    assert.equal(r.status, 200);
    const { items } = await r.json();
    assert.ok(Array.isArray(items) && items.length > 0, "expected indexed agents in list");
    // INVARIANT 3: ungraded ≠ unlisted. Page 0 can legitimately be all-graded as the
    // fastgrader progresses, so pick a known-ungraded agent from the DB and assert the
    // API returns it with letter=null (debug fix: page-0 sample went stale as grading grew).
    const ungraded = db.prepare(
      "SELECT a.name FROM agents a LEFT JOIN grades g ON g.chain_id=a.chain_id AND g.token_id=a.token_id WHERE g.score IS NULL AND length(a.name) > 6 AND (SELECT COUNT(*) FROM agents x WHERE x.name = a.name) = 1 LIMIT 1"
    ).get() as { name: string } | undefined;
    assert.ok(ungraded, "expected at least one ungraded agent while probing is in progress");
    const ru = agents.GET(new Request(`http://x/api/agents?q=${encodeURIComponent(ungraded!.name.slice(0, 40))}`));
    assert.equal(ru.status, 200);
    const ju = await ru.json();
    assert.ok(ju.items.some((a: any) => a.letter == null), "ungraded agents must be LISTED (INVARIANT 3)");
    ok(`agents lists ${items.length} rows; ungraded '${ungraded!.name}' listed with letter=null`);

    const rc = agents.GET(new Request("http://x/api/agents?cat=health-factor"));
    assert.equal(rc.status, 200);
    const jc = await rc.json();
    assert.ok(Array.isArray(jc.items));
    ok("agents?cat=health-factor 200");
  }

  // /api/agent/[chain]/[id] — 404 unindexed, 200 with grade JOINed to raw transcript (INVARIANT 1)
  {
    const miss = detail.GET(new Request("http://x"), { params: { chain: "56", id: "999999999" } });
    assert.equal(miss.status, 404);
    ok("detail 404 for unindexed agent");

    const hit = detail.GET(new Request("http://x"), { params: { chain: "56", id: "49637" } });
    assert.equal(hit.status, 200);
    const j = await hit.json();
    assert.equal(j.agent.token_id, 49637);
    assert.ok(j.grade && typeof j.grade.transcript === "string" && j.grade.transcript.length > 10, "grade must carry its raw probe transcript");
    assert.ok(["A", "B", "C", "D", "F"].includes(j.grade.letter));
    ok(`detail 56/49637 → ${j.grade.letter}/${j.grade.score} with transcript`);
  }

  // /api/reprobe — 400 bad body; real probe of an endpoint-less shell; 429 within 20s
  {
    const bad = await reprobe.POST(new Request("http://x", { method: "POST", body: "not json" }));
    assert.equal(bad.status, 400);
    ok("reprobe 400 on bad body");

    const before = (db.prepare("SELECT COUNT(*) c FROM probe_logs").get() as any).c;
    const r1 = await reprobe.POST(new Request("http://x", { method: "POST", body: JSON.stringify({ chain: 56, id: 341620 }) }));
    assert.equal(r1.status, 200);
    const g = await r1.json();
    assert.ok(["A", "B", "C", "D", "F"].includes(g.letter), `letter, got ${JSON.stringify(g)}`);
    const after = (db.prepare("SELECT COUNT(*) c FROM probe_logs").get() as any).c;
    assert.equal(after, before + 1, "reprobe must write a REAL probe_logs row (INVARIANT 1)");
    ok(`reprobe 56/341620 ran a real probe → ${g.letter}/${g.score}`);

    const r2 = await reprobe.POST(new Request("http://x", { method: "POST", body: JSON.stringify({ chain: 56, id: 341620 }) }));
    assert.equal(r2.status, 429, "second reprobe within 20s must 429");
    ok("reprobe cooldown 429 within 20s");
  }

  console.log(`PASS api-routes.test (${n} checks)`);
}
main().catch((e) => { console.error(e); process.exit(1); });
