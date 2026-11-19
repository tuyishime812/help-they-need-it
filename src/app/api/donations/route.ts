import { NextResponse } from "next/server";
import { Branch, createDonation, emit, listDonations } from "@/lib/store";

const branches: Branch[] = ["Older people", "Students", "Refugees", "Families"];

export async function GET() {
  try {
    const donations = await listDonations(200);
    return NextResponse.json({ donations });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load donations" }, { status: 500 });
  }
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
    const donation = await createDonation({ amount, currency, frequency, branch, donorName, paymentStatus: "successful" });
    emit({ type: "donation" });
    return NextResponse.json({ ok: true, donation }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid request" }, { status: 400 });
  }
}