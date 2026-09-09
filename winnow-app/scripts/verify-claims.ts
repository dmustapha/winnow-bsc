// File: scripts/verify-claims.ts — recompute headline counters (franchise verifier; refuses read-back)
import { db } from "../src/lib/db";
const recompute = {
  indexed: (db.prepare("SELECT COUNT(*) c FROM agents").get() as any).c,
  probed: (db.prepare("SELECT COUNT(*) c FROM grades g JOIN probe_logs p ON p.id=g.probe_log_id").get() as any).c, // JOIN = each grade has real transcript
  orphanGrades: (db.prepare("SELECT COUNT(*) c FROM grades g LEFT JOIN probe_logs p ON p.id=g.probe_log_id WHERE p.id IS NULL").get() as any).c,
  negativeAttestations: (db.prepare("SELECT COUNT(*) c FROM attestations WHERE value<0").get() as any).c,
};
console.log(JSON.stringify(recompute, null, 2));
if (recompute.orphanGrades > 0 || recompute.negativeAttestations > 0) { console.error("INVARIANT VIOLATION"); process.exit(1); }
