"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CallbackInner() {
  const sp = useSearchParams();
  const txRef = sp.get("tx_ref") || sp.get("txRef") || sp.get("reference") || "";
  const [state, setState] = useState<"loading" | "success" | "failed" | "pending" | "error">("loading");
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    if (!txRef) { setState("error"); return; }
    (async () => {
      try {
        const res = await fetch(`/api/payments/confirm?tx_ref=${encodeURIComponent(txRef)}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");
        setInfo(json);
        if (json.paymentStatus === "successful") setState("success");
        else if (json.paymentStatus === "failed") setState("failed");
        else setState("pending");
      } catch {
        setState("error");
      }
    })();
  }, [txRef]);

  const title = state === "success" ? "Payment successful" : state === "failed" ? "Payment not completed" : state === "pending" ? "Payment pending" : "Payment status";
  const desc =
    state === "success" ? "Thank you. Your donation has been verified and recorded." :
    state === "failed" ? "Your payment was not completed. No successful donation was recorded." :
    state === "pending" ? "We received your return from the payment process. Verification is still pending; it will update automatically once confirmed." :
    txRef ? "We could not verify your payment right now. Please check back shortly or contact support with your transaction reference." :
    "Missing transaction reference.";

  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-ln bg-sf p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-teal">Secure Payment</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold">{title}</h1>
        <p className="mt-3 text-mu">{desc}</p>
        {txRef && <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm"><span className="font-semibold">Transaction reference:</span> <span className="font-mono">{txRef}</span></p>}
        {info?.donation && (
          <div className="mt-4 rounded-xl border border-ln p-4 text-sm space-y-1">
            <div><span className="font-semibold">Amount:</span> {info.donation.currency} {info.donation.amount}</div>
            <div><span className="font-semibold">Branch:</span> {info.donation.branch}</div>
            <div><span className="font-semibold">Status:</span> {info.donation.paymentStatus}</div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-sun px-6 py-3 font-semibold text-sk">Back to home</Link>
          <Link href="/admin" className="rounded-full border-2 border-teal px-6 py-3 font-semibold text-td">Open dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg text-ink flex items-center justify-center">Loading payment status...</div>}>
      <CallbackInner />
    </Suspense>
  );
}