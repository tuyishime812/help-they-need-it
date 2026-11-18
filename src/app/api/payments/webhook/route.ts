import { NextResponse } from "next/server";
import { emit, upsertDonationByTxRef } from "@/lib/store";
import { verifyPayChanguTransaction, verifyWebhookSignature } from "@/lib/paychangu";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const signature = req.headers.get("signature") || req.headers.get("Signature");
    // If webhook secret is configured, require a valid signature.
    if (process.env.PAYCHANGU_WEBHOOK_SECRET && !verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    const payload = raw ? JSON.parse(raw) : {};
    const txRef = payload?.tx_ref || payload?.data?.tx_ref || payload?.reference;
    if (!txRef) return NextResponse.json({ ok: true });

    // Always re-query/verify before trusting webhook payload.
    const verified = await verifyPayChanguTransaction(String(txRef));
    const status = String(verified?.data?.status || "").toLowerCase();
    if (status === "success" || status === "successful") {
      upsertDonationByTxRef(String(txRef), { paymentStatus: "successful" });
      emit({ type: "donation_success" });
    } else if (status === "failed" || status === "cancelled") {
      upsertDonationByTxRef(String(txRef), { paymentStatus: "failed" });
      emit({ type: "donation_failed" });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}