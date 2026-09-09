// tests/unit/debug-p2-risk-worker-lock.test.ts — C3 pidfile-collision fix verification.
// 1) second worker refuses to start while a live holder exists
// 2) stale pidfile (dead holder, e.g. kill -9) is taken over
import assert from "node:assert";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PIDFILE = path.join(process.cwd(), "data", "worker.pid");
const run = () => spawn("npx", ["tsx", "scripts/run-worker.mts"], { cwd: process.cwd(), env: process.env });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  try { fs.unlinkSync(PIDFILE); } catch { }

  // 1) first worker acquires the lock; second refuses
  const w1 = run();
  let w1err = ""; w1.stderr.on("data", (d) => (w1err += d));
  await sleep(4000);
  assert.ok(fs.existsSync(PIDFILE), "first worker must write data/worker.pid");
  const holder = Number(fs.readFileSync(PIDFILE, "utf8").trim());
  assert.ok(holder > 0, "pidfile must contain a pid");

  const w2 = run();
  let w2err = ""; w2.stderr.on("data", (d) => (w2err += d));
  await sleep(4000);
  assert.ok(w2err.includes("another instance holds"), `second worker must refuse; stderr was: ${w2err.slice(0, 200)}`);
  assert.equal(Number(fs.readFileSync(PIDFILE, "utf8").trim()), holder, "pidfile must still belong to first worker");
  console.log("  ok live holder → second instance refuses to start");

  // 2) kill -9 the holder (stale pidfile) → next worker takes over.
  // NB: kill the HOLDER pid from the pidfile — w1 is the npx wrapper, not the tsx child.
  w1.kill("SIGKILL"); w2.kill("SIGKILL");
  try { process.kill(holder, "SIGKILL"); } catch { }
  await sleep(1000);
  assert.ok(fs.existsSync(PIDFILE), "SIGKILL leaves a stale pidfile (no exit hook)");
  const w3 = run();
  let w3err = ""; w3.stderr.on("data", (d) => (w3err += d));
  await sleep(4000);
  const newHolder = Number(fs.readFileSync(PIDFILE, "utf8").trim());
  assert.notEqual(newHolder, holder, "stale pid must be taken over by the new worker");
  assert.ok(!w3err.includes("another instance holds"), "takeover must not refuse");
  console.log("  ok stale pidfile (kill -9) → takeover succeeds");

  w3.kill("SIGKILL");
  try { process.kill(Number(fs.readFileSync(PIDFILE, "utf8").trim()), "SIGKILL"); } catch { }
  await sleep(500);
  try { fs.unlinkSync(PIDFILE); } catch { }
  console.log("PASS debug-p2-risk-worker-lock.test (2 scenarios)");
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
