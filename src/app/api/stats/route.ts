import { NextResponse } from "next/server";
import { computeStats } from "@/lib/store";

export async function GET() {
  try {
    const stats = await computeStats();
    return NextResponse.json(stats, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load stats" }, { status: 500 });
  }
}