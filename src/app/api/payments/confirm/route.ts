import { NextResponse } from "next/server";
import { emit, listDonations, upsertDonationByTxRef } from "@/lib/store";
import { verifyPayChanguTransaction } from "@/lib/paychangu";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get("tx_ref") || searchParams.get("txRef") || "";
  if (!txRef) return NextResponse.json({ error: "tx_ref is required" }, { status: 400 });
  try {
    const verified = await verifyPayChanguTransaction(txRef);
    const status = String(verified?.data?.status || "").toLowerCase();
    const paymentStatus = status === "success" || status === "successful" ? "successful" : status === "failed" || status === "cancelled" ? "failed" : "pending";
    const donation = await upsertDonationByTxRef(txRef, { paymentStatus });
    if (paymentStatus === "successful") emit({ type: "donation_success" });
    if (paymentStatus === "failed") emit({ type: "donation_failed" });
    let found = donation;
    if (!found) {
      const all = await listDonations(200);
      found = all.find((d) => d.txRef === txRef) || null;
    }
    return NextResponse.json({ ok: true, paymentStatus, donation: found, verified: verified.data || null });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || "Verification failed") }, { status: 502 });
  }
}