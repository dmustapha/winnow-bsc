// One-shot: re-grade the 4 reference agents now that they serve real A2A cards (dev server must be up)
import { gradeAgent } from "../src/lib/grade";
for (const id of [2288, 2289, 2290, 2291]) {
  const g = await gradeAgent(97, id);
  const b = g.breakdown;
  console.log(id, g.letter, g.score, JSON.stringify({ liveness: b.liveness, meta: b.meta, feedback: b.feedback, track: b.track, checks: b.checks }));
}
