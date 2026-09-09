// File: src/lib/grade.ts
import { db } from "./db";
import { runProbe } from "./probe";
export function letterFor(score: number): string {
  return score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";
}
export async function gradeAgent(chainId: number, tokenId: number) {
  const p = await runProbe(chainId, tokenId);
  const score = p.liveness + p.meta + p.feedback + p.track;
  const letter = letterFor(score);
  db.prepare(`INSERT INTO grades(chain_id,token_id,probe_log_id,score,letter,graded_at) VALUES(?,?,?,?,?,datetime('now'))
    ON CONFLICT(chain_id,token_id) DO UPDATE SET probe_log_id=excluded.probe_log_id,score=excluded.score,letter=excluded.letter,graded_at=excluded.graded_at`)
    .run(chainId, tokenId, p.probeLogId, score, letter);
  return { score, letter, probeLogId: p.probeLogId, breakdown: p };
}
