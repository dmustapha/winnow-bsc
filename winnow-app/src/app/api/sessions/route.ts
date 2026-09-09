// File: src/app/api/sessions/route.ts — live sessions list (F-004)
import { db } from "@/lib/db";
import { deriveSessionStatus, isSessionExpired } from "@/lib/session-status";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
// INTERROGATE FIX (F-06): expiry-aware derived status — live-past-expiry rows ship as expired
export function GET() {
  const items = (db.prepare("SELECT * FROM sessions ORDER BY id DESC LIMIT 20").all() as any[])
    .map((s) => ({ ...s, expired: isSessionExpired(s), status: deriveSessionStatus(s) }));
  return NextResponse.json({ items });
}
