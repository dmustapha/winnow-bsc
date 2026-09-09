// File: src/app/api/revoke/route.ts — one-click onchain fire (demo obligation c2)
import { revoke } from "@/lib/altana";
import { NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: Request) {
  const p = z.object({ sessionId: z.number() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad body" }, { status: 400 });
  try {
    const tx = await revoke(p.data.sessionId);
    return NextResponse.json({ ok: true, tx });
  } catch (e: any) { return NextResponse.json({ error: String(e?.message ?? e).slice(0, 200) }, { status: 500 }); }
}
