import { NextResponse } from "next/server";
import { Branch, emit, getStore, uid } from "@/lib/store";

const branches: Branch[] = ["Older people", "Students", "Refugees", "Families"];
const currencies = ["MWK", "USD"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body?.amount);
    const currency = currencies.includes(body?.currency) ? (body.currency as "MWK" | "USD") : "MWK";
    const frequency: "once" | "monthly" = body?.frequency === "monthly" ? "monthly" : "once";
    const branch = branches.includes(body?.branch) ? (body.branch as Branch) : "Families";
    const donorName = String(body?.donorName || "Anonymous").trim().slice(0, 80) || "Anonymous";
    const email = String(body?.email || "").trim().slice(0, 120);

    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required for payment." }, { status: 400 });
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY;
    if (!publicKey) {
      return NextResponse.json({ error: "Payment provider is not configured. Please set NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY." }, { status: 503 });
    }

    const txRef = `htn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const callback_url = `${origin}/payment/callback`;
    const return_url = `${origin}/payment/return`;

    const pending = {
      id: uid("d"),
      amount,
      currency,
      frequency,
      branch,
      donorName,
      email,
      txRef,
      paymentStatus: "pending" as "pending" | "successful" | "failed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    getStore().donations.push(pending);
    emit({ type: "donation_pending" });

    return NextResponse.json({
      ok: true,
      tx_ref: txRef,
      public_key: publicKey,
      callback_url,
      return_url,
    });
  } catch {
    return NextResponse.json({ error: "Could not prepare payment." }, { status: 500 });
  }
}