// File: src/app/api/agent/[chain]/[id]/route.ts — detail: agent + grade w/ raw transcript (INVARIANT 1/6)
import { db } from "@/lib/db";
import { deriveSessionStatus, isSessionExpired } from "@/lib/session-status";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET(_: Request, { params }: { params: { chain: string; id: string } }) {
  const chain = Number(params.chain), id = Number(params.id);
  if (!Number.isFinite(chain) || !Number.isFinite(id)) return NextResponse.json({ error: "bad params" }, { status: 400 });
  const agent = db.prepare("SELECT * FROM agents WHERE chain_id=? AND token_id=?").get(chain, id);
  if (!agent) return NextResponse.json({ error: "not indexed" }, { status: 404 });
  const grade = db.prepare("SELECT g.*, p.transcript, p.liveness, p.meta, p.feedback, p.track, p.ran_at FROM grades g JOIN probe_logs p ON p.id=g.probe_log_id WHERE g.chain_id=? AND g.token_id=?").get(chain, id);
  const attests = db.prepare("SELECT * FROM attestations WHERE chain_id=? AND token_id=? ORDER BY id DESC LIMIT 10").all(chain, id);
  // DEBUG FIX (P5 M1): agent_actions/sessions are keyed by token_id only — gate on is_reference /
  // filter by chain so a chain-56 agent never shows a chain-97 reference agent's activity.
  const actions = (agent as any).is_reference
    ? db.prepare("SELECT * FROM agent_actions WHERE agent_token=? ORDER BY id DESC LIMIT 20").all(id)
    : [];
  // INTERROGATE FIX (F-06): expiry-aware derived status computed server-side so all consumers agree —
  // a status='live' row past its expiry ships as expired:true / status:'expired' (DB has no expired state).
  const sessions = (db.prepare("SELECT * FROM sessions WHERE agent_token=? AND agent_chain=? ORDER BY id DESC LIMIT 5").all(id, chain) as any[])
    .map((s) => ({ ...s, expired: isSessionExpired(s), status: deriveSessionStatus(s) }));
  return NextResponse.json({ agent, grade, attests, actions, sessions });
}
