// File: src/app/api/feed/route.ts — landing feed: top graded agents + recent activity (all real rows)
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  const top = db.prepare(`SELECT a.chain_id, a.token_id, a.name, a.description, a.category, a.is_reference, g.letter, g.score, g.graded_at
    FROM grades g JOIN agents a ON a.chain_id=g.chain_id AND a.token_id=g.token_id
    ORDER BY g.score DESC, g.graded_at DESC LIMIT 8`).all();
  const recentGrades = db.prepare(`SELECT a.name, g.chain_id, g.token_id, g.letter, g.score, g.graded_at
    FROM grades g JOIN agents a ON a.chain_id=g.chain_id AND a.token_id=g.token_id
    ORDER BY g.graded_at DESC LIMIT 6`).all();
  const recentActions = db.prepare(`SELECT a.name, x.kind, x.reasoning, x.at, x.agent_token
    FROM agent_actions x LEFT JOIN agents a ON a.token_id=x.agent_token AND a.is_reference=1
    WHERE x.reasoning NOT LIKE '%skip%' ORDER BY x.id DESC LIMIT 5`).all();
  const attests = db.prepare(`SELECT token_id, tag, value, tx_hash, chain_id, attested_at FROM attestations ORDER BY id DESC LIMIT 4`).all();
  return NextResponse.json({ top, recentGrades, recentActions, attests });
}
