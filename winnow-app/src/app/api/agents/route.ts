// File: src/app/api/agents/route.ts — paginated index, ungraded rows included (INVARIANT 3)
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
export const dynamic = "force-dynamic";
const Q = z.object({ cat: z.string().optional(), q: z.string().max(80).optional(), page: z.coerce.number().int().min(0).max(1e6).default(0) }); // STRESS FIX (ST-API-3): 1e308*30=Infinity crashed the sqlite binding
export function GET(req: Request) {
  const u = new URL(req.url);
  const p = Q.safeParse(Object.fromEntries(u.searchParams));
  if (!p.success) return NextResponse.json({ error: "bad query" }, { status: 400 });
  const { cat, q, page } = p.data;
  const where = [cat ? "a.category=@cat" : "1=1", q ? "(a.name LIKE @like OR a.description LIKE @like)" : "1=1"].join(" AND ");
  const rows = db.prepare(`SELECT a.chain_id,a.token_id,a.name,a.description,a.image_url,a.mcp_server,a.a2a_endpoint,a.is_reference,a.category,
      g.letter,g.score,g.graded_at FROM agents a LEFT JOIN grades g ON g.chain_id=a.chain_id AND g.token_id=a.token_id
      WHERE ${where} ORDER BY a.is_reference DESC, (g.score IS NULL), g.score DESC, a.scan_feedbacks DESC LIMIT 30 OFFSET @off`)
    .all({ cat, like: `%${q ?? ""}%`, off: page * 30 });
  return NextResponse.json({ items: rows });
}
