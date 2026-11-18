"use client";

import { useEffect, useMemo, useState } from "react";

const BRANCHES = ["Older people", "Students", "Refugees", "Families"] as const;
type Branch = (typeof BRANCHES)[number];
const DONATION_OPTIONS = [
  { amount: 10, impact: "provides a week of meals for an older neighbor", branch: "Older people" as Branch },
  { amount: 25, impact: "buys school books and supplies for one student", branch: "Students" as Branch },
  { amount: 50, impact: "gives a refugee family a food and hygiene pack", branch: "Refugees" as Branch },
  { amount: 100, impact: "covers a month of rent help for a family in crisis", branch: "Families" as Branch },
] as const;

export function DonateSection() {
  const [freq, setFreq] = useState<"once" | "monthly">("monthly");
  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState("");
  const [currency, setCurrency] = useState<"MWK" | "USD">("MWK");
  const [branch, setBranch] = useState<Branch>("Students");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const presetAmounts = currency === "MWK" ? [5000, 10000, 25000, 50000] : [10, 25, 50, 100];
  const currencySymbol = currency === "MWK" ? "MWK " : "$";

  const impact = useMemo(() => {
    const idx = presetAmounts.indexOf(amount);
    const preset = idx >= 0 ? DONATION_OPTIONS[idx] : null;
    const base = `${currencySymbol}${amount.toLocaleString()}${freq === "monthly" ? " every month " : " "}`;
    return base + (preset ? `${preset.impact}.` : `helps us respond to urgent needs in the ${branch} program.`);
  }, [amount, freq, currencySymbol, presetAmounts, branch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).PaychanguCheckout) return;
    const existing = document.querySelector('script[data-paychangu-popup="1"]') as HTMLScriptElement | null;
    if (existing) return;
    const s = document.createElement("script");
    s.src = "https://in.paychangu.com/js/popup.js";
    s.async = true;
    s.dataset.paychanguPopup = "1";
    document.body.appendChild(s);
  }, []);

  async function onDonate() {
    if (!Number.isFinite(amount) || amount <= 0) { setMsg("Please choose or enter a valid donation amount."); return; }
    if (!donorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) { setMsg("Please enter a valid email address to continue to secure payment."); return; }
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/payments/prepare", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, frequency: freq, branch, donorName: donorName.trim() || "Anonymous", email: donorEmail.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.tx_ref || !json?.public_key) throw new Error(json?.error || "Could not prepare payment.");
      const PaychanguCheckout = (window as any).PaychanguCheckout;
      if (typeof PaychanguCheckout !== "function") throw new Error("PayChangu payment popup could not load. Please check your connection and try again.");
      const nameParts = (donorName.trim() || "Anonymous Donor").split(/\s+/).filter(Boolean);
      setMsg("Opening PayChangu secure payment popup...");
      PaychanguCheckout({
        public_key: json.public_key, tx_ref: json.tx_ref, amount, currency,
        callback_url: json.callback_url, return_url: json.return_url,
        customer: { email: donorEmail.trim(), first_name: nameParts[0] || "Anonymous", last_name: nameParts.slice(1).join(" ") || "Donor" },
        customization: { title: "Help They Need Foundation Donation", description: `${freq === "monthly" ? "Monthly" : "One-time"} donation for ${branch}` },
        meta: { branch, frequency: freq, donorName: donorName.trim() || "Anonymous" },
      });
    } catch (e: any) {
      setMsg(String(e?.message || "We could not start your payment right now. Please try again."));
    } finally { setBusy(false); }
  }

  return (
    <section className="bg-mist px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">Give today, change a life</h2>
          <p className="mt-4 text-lg text-mu">Every gift goes toward food, education, shelter and care. Donate securely via PayChangu (mobile money/cards).</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl bg-sf p-6 sm:p-8 shadow-sm border border-ln/50">
            <h3 className="mb-4 font-heading text-2xl font-bold">Make a donation</h3>
            <div className="mb-4 grid grid-cols-2 rounded-full bg-bg p-1" role="group" aria-label="Donation frequency">
              <button type="button" onClick={() => setFreq('once')} aria-pressed={freq === 'once'} className={`rounded-full px-4 py-2.5 font-semibold transition ${freq === 'once' ? 'bg-teal text-ot' : 'text-ink'}`}>One time</button>
              <button type="button" onClick={() => setFreq('monthly')} aria-pressed={freq === 'monthly'} className={`rounded-full px-4 py-2.5 font-semibold transition ${freq === 'monthly' ? 'bg-teal text-ot' : 'text-ink'}`}>Monthly</button>
            </div>
            <label className="mb-3 grid gap-1 font-semibold">Currency
              <select value={currency} onChange={(e) => { const c = e.target.value as "MWK" | "USD"; setCurrency(c); setAmount(c === "MWK" ? 10000 : 25); setCustom(''); setMsg(''); }} className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink">
                <option value="MWK">MWK (Malawi Kwacha)</option><option value="USD">USD (US Dollar)</option>
              </select>
            </label>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Donation amount">
              {presetAmounts.map((amt, i) => (
                <button key={amt} type="button" onClick={() => { setAmount(amt); setCustom(''); setBranch(DONATION_OPTIONS[i].branch); setMsg(''); }} aria-pressed={amount === amt && !custom} className={`rounded-xl border-2 px-3 py-3 font-heading text-lg font-bold transition ${amount === amt && !custom ? 'border-teal bg-mist text-td' : 'border-ln'}`}>{currency === "MWK" ? `MWK ${amt.toLocaleString()}` : `$${amt}`}</button>
              ))}
            </div>
            <label className="grid gap-1 font-semibold">Or enter another amount
              <input type="number" min={1} inputMode="numeric" placeholder={currency === "MWK" ? "Amount in MWK" : "Amount in USD"} value={custom} onChange={(e) => { const v = e.target.value; setCustom(v); const n = parseInt(v, 10); if (Number.isFinite(n) && n > 0) { setAmount(n); setMsg(''); } }} className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink" />
            </label>
            <label className="mt-3 grid gap-1 font-semibold">Support program / branch
              <select value={branch} onChange={(e) => { setBranch(e.target.value as Branch); setMsg(''); }} className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink">{BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}</select>
            </label>
            <label className="mt-3 grid gap-1 font-semibold">Your name (optional)
              <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Anonymous" className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink" />
            </label>
            <label className="mt-3 grid gap-1 font-semibold">Email address (required for payment)
              <input type="email" value={donorEmail} onChange={(e) => { setDonorEmail(e.target.value); setMsg(''); }} placeholder="you@example.com" required className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink" />
            </label>
            <p className="mt-3 min-h-[3.4em] font-medium" aria-live="polite">{impact}</p>
            <button type="button" onClick={onDonate} disabled={busy} className="mt-2 rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Opening PayChangu..." : "Donate securely with PayChangu"}</button>
            <p className="mt-2 text-sm text-mu">Pay with PayChangu inline popup (mobile money/cards) without leaving the site flow.</p>
            {msg && <p role="status" className="mt-4 rounded-xl border-l-4 border-teal bg-mist px-4 py-3">{msg}</p>}
          </div>
          <div className="rounded-3xl bg-sf p-6 sm:p-8 shadow-sm border border-ln/50">
            <h3 className="mb-5 font-heading text-2xl font-bold">Where your money goes</h3>
            <div className="space-y-4">
              {[['Direct programs', '85%'], ['Operations', '10%'], ['Fundraising', '5%']].map(([label, pct]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between font-semibold"><span>{label}</span><span>{pct}</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-bg"><i className="block h-full rounded-full bg-teal" style={{ width: pct }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-mu">Sample breakdown. Update with your audited figures.</p>
          </div>
        </div>
      </div>
    </section>
  );
}