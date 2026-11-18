"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ReturnInner() {
  const sp = useSearchParams();
  const txRef = sp.get("tx_ref") || sp.get("txRef") || "";
  const status = sp.get("status") || "failed";
  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-ln bg-sf p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-teal">PayChangu Payment</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold">Payment cancelled or not completed</h1>
        <p className="mt-3 text-mu">You returned from PayChangu before a successful payment was confirmed. No successful donation has been recorded for this attempt.</p>
        {txRef && <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm"><span className="font-semibold">Transaction reference:</span> <span className="font-mono">{txRef}</span></p>}
        <p className="mt-2 text-sm text-mu">Status: {status}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/#give" className="rounded-full bg-sun px-6 py-3 font-semibold text-sk">Try again</Link>
          <Link href="/" className="rounded-full border-2 border-teal px-6 py-3 font-semibold text-td">Back to home</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg text-ink flex items-center justify-center">Loading...</div>}>
      <ReturnInner />
    </Suspense>
  );
}