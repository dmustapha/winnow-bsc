// tests/falsify/garbage-endpoint.test.ts — STRESS Phase 8.5 self-falsification (feed a lie, assert red)
// Headline claim: Winnow grades HONESTLY — a dead agent (unreachable MCP endpoint) must NOT
// receive a passing liveness grade. We insert a fake agent whose mcp_server points at a dead
// port and assert the grader flunks it. If this ever grades C or better, the suite goes red.
import assert from "node:assert";
import Database from "better-sqlite3";

const CHAIN = 99999, ID = 424242; // reserved test namespace, cleaned on exit

async function main() {
  const db = new Database("data/winnow.db");
  const clean = () => {
    db.prepare("DELETE FROM grades WHERE chain_id=?").run(CHAIN);
    db.prepare("DELETE FROM probe_logs WHERE chain_id=?").run(CHAIN);
    db.prepare("DELETE FROM agents WHERE chain_id=?").run(CHAIN);
  };
  clean();
  db.prepare(
    "INSERT INTO agents (chain_id, token_id, name, a2a_endpoint, category) VALUES (?, ?, 'falsify-dead-agent', 'http://127.0.0.1:1/none', 'yield')"
  ).run(CHAIN, ID);
  try {
    const { gradeAgent } = await import("../../src/lib/grade");
    const r: any = await gradeAgent(CHAIN, ID);
    // the lie: agent claims an endpoint; reality: it is dead. Honest grader => D/F, liveness 0.
    assert.ok(r.score < 40, `dead agent scored ${r.score} — grader is lying about liveness`);
    assert.ok(["D", "F"].includes(r.letter), `dead agent got letter ${r.letter}`);
    assert.equal(r.breakdown?.liveness ?? 0, 0, "dead endpoint must earn 0 liveness points");
    console.log(`PASS falsify/garbage-endpoint: dead agent honestly graded ${r.letter}/${r.score}`);
  } finally {
    clean();
    const leftover = (db.prepare("SELECT COUNT(*) c FROM agents WHERE chain_id=?").get(CHAIN) as any).c;
    assert.equal(leftover, 0, "test rows not cleaned");
  }
}
main().catch((e) => { console.error("FAIL falsify/garbage-endpoint:", e.message); process.exit(1); });
