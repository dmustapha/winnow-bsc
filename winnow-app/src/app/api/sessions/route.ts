// File: src/app/api/sessions/route.ts — live sessions list (F-004)
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() { return NextResponse.json({ items: db.prepare("SELECT * FROM sessions ORDER BY id DESC LIMIT 20").all() }); }
