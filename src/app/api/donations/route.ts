import { NextResponse } from "next/server";
import { Branch, emit, getStore, uid } from "@/lib/store";

const branches: Branch[] = ["Older people", "Students", "Refugees", "Families"];

export async function GET() {
  const store = getStore();
  const donations = [...store.donations].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return NextResponse.json({ donations });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body?.amount);
    const frequency: "once" | "monthly" = body?.frequency === "monthly" ? "monthly" : "once";
    const currency: "MWK" | "USD" = body?.currency === "USD" ? "USD" : "MWK";
    const branch = branches.includes(body?.branch) ? (body.branch as Branch) : "Families";
    const donorName = String(body?.donorName || "Anonymous").slice(0, 80).trim() || "Anonymous";
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const donation = { id: uid("d"), amount, currency, frequency, branch, donorName, createdAt: now, updatedAt: now, paymentStatus: "successful" as const };
    getStore().donations.push(donation);
    emit({ type: "donation" });
    return NextResponse.json({ ok: true, donation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}