// File: src/app/api/stats/route.ts — honest counters (ARCH §13, INVARIANT 3/6)
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  const s = {
    indexed: (db.prepare("SELECT COUNT(*) c FROM agents").get() as any).c,
    withEndpoints: (db.prepare("SELECT COUNT(*) c FROM agents WHERE mcp_server IS NOT NULL OR a2a_endpoint IS NOT NULL").get() as any).c,
    probed: (db.prepare("SELECT COUNT(*) c FROM grades").get() as any).c,
    verifiedLive: (db.prepare("SELECT COUNT(*) c FROM probe_logs WHERE liveness>0").get() as any).c,
    attestations: (db.prepare("SELECT COUNT(*) c FROM attestations").get() as any).c,
    indexComplete: !!(db.prepare("SELECT v FROM kv WHERE k='scan_done'").get() as any),
  };
  return NextResponse.json(s);
}
