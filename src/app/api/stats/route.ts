import { NextResponse } from "next/server";
import { computeStats, getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  return NextResponse.json(computeStats(store), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}