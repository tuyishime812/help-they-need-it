"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const BRANCHES = ["Older people", "Students", "Refugees", "Families"] as const;
type Branch = (typeof BRANCHES)[number];

const DONATION_OPTIONS = [
  { amount: 10, impact: "provides a week of meals for an older neighbor", branch: "Older people" as Branch },
  { amount: 25, impact: "buys school books and supplies for one student", branch: "Students" as Branch },
  { amount: 50, impact: "gives a refugee family a food and hygiene pack", branch: "Refugees" as Branch },
  { amount: 100, impact: "covers a month of rent help for a family in crisis", branch: "Families" as Branch },
] as const;

function Icon({ name, className = "h-6 w-6" }: { name: "heart" | "book" | "home" | "people" | "phone" | "mail" | "pin" | "menu" | "close"; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "heart":
      return <svg {...common}><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z" /></svg>;
    case "book":
      return <svg {...common}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13" /></svg>;
    case "home":
      return <svg {...common}><path d="M3 11l9-8 9 8v10H3zM10 21v-6h4v6" /></svg>;
    case "people":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2c2.9.2 5 2.5 5 5.8" /></svg>;
    case "phone":
      return <svg {...common}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>;
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
    case "pin":
      return <svg {...common}><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "menu":
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "close":
      return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
  }
}

function useCounters() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    if (!els.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const n = Number(el.dataset.count || "0");
          if (reduce) {
            el.textContent = `${n.toLocaleString("en-US")}+`;
            return;
          }
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min((t - t0) / 1200, 1);
            const val = Math.round(n * (1 - Math.pow(1 - p, 3)));
            el.textContent = `${val.toLocaleString("en-US")}${p < 1 ? "" : "+"}`;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Site() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [freq, setFreq] = useState<"once" | "monthly">("monthly");
  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState("");
  const [currency, setCurrency] = useState<"MWK" | "USD">("MWK");
  const [branch, setBranch] = useState<Branch>("Students");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationMsg, setDonationMsg] = useState("");
  const [donationBusy, setDonationBusy] = useState(false);
  const [contactMsg, setContactMsg] = useState("");
  const [contactError, setContactError] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const contactRef = useRef<HTMLFormElement>(null);
  useCounters();

  const presetAmounts = currency === "MWK" ? [5000, 10000, 25000, 50000] : [10, 25, 50, 100];
  const currencySymbol = currency === "MWK" ? "MWK " : "$";

  const donationImpact = useMemo(() => {
    const idx = presetAmounts.indexOf(amount);
    const preset = idx >= 0 ? DONATION_OPTIONS[idx] : null;
    const base = `${currencySymbol}${amount.toLocaleString()}${freq === "monthly" ? " every month " : " "}`;
    return base + (preset ? `${preset.impact}.` : `helps us respond to urgent needs in the ${branch} program.`);
  }, [amount, freq, currencySymbol, presetAmounts, branch]);

  function closeMenu() { setMenuOpen(false); }

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
    if (!Number.isFinite(amount) || amount <= 0) {
      setDonationMsg("Please choose or enter a valid donation amount.");
      return;
    }
    if (!donorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      setDonationMsg("Please enter a valid email address to continue to secure payment.");
      return;
    }
    setDonationBusy(true);
    setDonationMsg("");
    try {
      const res = await fetch("/api/payments/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          frequency: freq,
          branch,
          donorName: donorName.trim() || "Anonymous",
          email: donorEmail.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.tx_ref || !json?.public_key) {
        throw new Error(json?.error || "Could not prepare payment.");
      }
      const PaychanguCheckout = (window as any).PaychanguCheckout;
      if (typeof PaychanguCheckout !== "function") {
        throw new Error("Secure payment window could not load. Please check your connection and try again.");
      }
      const nameParts = (donorName.trim() || "Anonymous Donor").split(/\s+/).filter(Boolean);
      const first_name = nameParts[0] || "Anonymous";
      const last_name = nameParts.slice(1).join(" ") || "Donor";
      setDonationMsg("Opening secure payment window...");
      PaychanguCheckout({
        public_key: json.public_key,
        tx_ref: json.tx_ref,
        amount,
        currency,
        callback_url: json.callback_url,
        return_url: json.return_url,
        customer: {
          email: donorEmail.trim(),
          first_name,
          last_name,
        },
        customization: {
          title: "Help They Need Foundation Donation",
          description: `${freq === "monthly" ? "Monthly" : "One-time"} donation for ${branch}`,
        },
        meta: {
          branch,
          frequency: freq,
          donorName: donorName.trim() || "Anonymous",
        },
      });
    } catch (e: any) {
      setDonationMsg(String(e?.message || "We could not start your payment right now. Please try again."));
    } finally {
      setDonationBusy(false);
    }
  }

  async function onContactSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setContactError("");
    setContactMsg("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const category = String(data.get("who") || "General").trim();
    const message = String(data.get("msg") || "").trim();
    if (!name || !contact) {
      setContactError("Please provide your name and a phone number or email so we can reach you.");
      const target = form.querySelector<HTMLInputElement>(!name ? 'input[name="name"]' : 'input[name="contact"]');
      target?.focus();
      return;
    }
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, category, message }),
      });
      if (!res.ok) throw new Error("failed");
      setContactMsg("Thank you. We have your request and will be in touch within two working days.");
      form.reset();
    } catch {
      setContactError("We could not submit your request right now. Please try again.");
    }
  }

  function onNewsletterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") || "").trim();
    if (!email) return;
    setNewsletterMsg("Thank you for subscribing. We'll keep you updated with our annual report and impact news.");
    form.reset();
  }

  const navLinks = [
    ["#about", "About"],
    ["#programs", "Programs"],
    ["#how", "How we help"],
    ["#stories", "Stories"],
    ["#faq", "FAQ"],
  ] as const;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-ln/80 bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5 font-heading text-xl font-extrabold text-ink" onClick={closeMenu}>
            <span className="relative inline-block h-8 w-8 rounded-[50%_50%_50%_8px] bg-teal">
              <span className="absolute inset-[0.55rem] rounded-full bg-sun" />
            </span>
            Help They Need
          </a>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border-2 border-ln p-2 text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <nav
            id="site-nav"
            aria-label="Main"
            className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col items-start gap-3 border-b border-ln bg-bg px-4 pb-5 pt-2 shadow-sm lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} onClick={closeMenu} className="font-medium text-mu transition hover:text-ink">{label}</a>
            ))}
            <a href="#get-help" onClick={closeMenu} className="rounded-full border-2 border-teal px-5 py-2.5 font-semibold text-td transition hover:-translate-y-0.5">Get help</a>
            <a href="#give" onClick={closeMenu} className="rounded-full bg-sun px-5 py-2.5 font-semibold text-sk transition hover:-translate-y-0.5">Donate</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h1 className="max-w-3xl font-heading text-4xl font-extrabold sm:text-5xl lg:text-[4.2rem]">
                Dignity, safety and opportunity for people facing hard times.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-mu sm:text-xl">
                Help They Need is a foundation supporting older people, students, refugees and families who are struggling. We listen, we act, and we stay until people are back on their feet.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#get-help" className="rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5">Get help</a>
                <a href="#give" className="rounded-full border-2 border-teal px-7 py-3 font-semibold text-td transition hover:-translate-y-0.5">Support our work</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mu sm:text-base">
                {['Registered foundation', 'Annual public report', 'Local volunteers'].map((t) => (
                  <span key={t} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-teal" />{t}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { href: '#programs', cls: 'bg-teal text-ot', icon: 'heart' as const, title: 'Older people', sub: 'Care and company', mt: '' },
                { href: '#programs', cls: 'bg-sun text-sk lg:mt-8', icon: 'book' as const, title: 'Students', sub: 'Learning for all', mt: '' },
                { href: '#programs', cls: 'bg-mist text-td lg:-mt-8', icon: 'home' as const, title: 'Refugees', sub: 'A safe start', mt: '' },
                { href: '#programs', cls: 'bg-deep text-[#EAF4F2]', icon: 'people' as const, title: 'Families', sub: 'Steady support', mt: '' },
              ].map((c) => (
                <a key={c.title} href={c.href} className={`flex min-h-[13rem] flex-col items-center justify-end gap-2 rounded-[999px_999px_22px_22px] p-5 text-center transition hover:-translate-y-1 ${c.cls}`}>
                  <Icon name={c.icon} className="h-10 w-10" />
                  <strong className="font-heading text-xl">{c.title}</strong>
                  <span className="text-sm opacity-90">{c.sub}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-ln bg-sf px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [12400, 'meals served to older neighbors'],
                [3200, 'students kept in school'],
                [860, 'refugee families resettled'],
                [1500, 'active volunteers'],
              ].map(([n, label]) => (
                <div key={label}>
                  <strong data-count={n} className="block font-heading text-4xl font-extrabold text-teal">0</strong>
                  <span className="text-mu">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-mu">Sample figures for design purposes. Replace with your real results.</p>
          </div>
        </section>

        <section id="about" className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">We exist so no one is left behind</h2>
            </div>
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-4 text-mu text-lg">
                <p>Hardship can arrive suddenly: an illness, a lost job, a journey away from home. Help They Need was founded to give people practical support quickly, and to treat everyone with respect while we do it.</p>
                <p>We work with local volunteers, schools, clinics and community leaders, so help reaches people where they live.</p>
              </div>
              <div className="grid gap-5">
                {[
                  ['Dignity first', 'People choose the help that suits them. We never decide for them.'],
                  ['Open books', 'We publish where every donation goes, every year.'],
                  ['Lasting change', 'We aim for independence, not dependence, with follow-up after every case.'],
                ].map(([h, p]) => (
                  <div key={h} className="border-l-4 border-sun pl-5">
                    <h3 className="font-heading text-xl font-bold">{h}</h3>
                    <p className="text-mu">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="programs" className="border-y border-ln bg-sf px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">Our programs</h2>
              <p className="mt-4 text-lg text-mu">Four programs, each shaped by what people tell us they need.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: 'heart' as const, title: 'Older people', desc: 'Support for older neighbors who live alone or struggle day to day.', items: ['Hot meals and weekly visits', 'Rides to clinics', 'Help with pensions and paperwork'] },
                { icon: 'book' as const, title: 'Students', desc: 'Help so talented students can stay in education.', items: ['Fees, books and uniforms', 'Mentors and study spaces', 'Scholarship guidance'] },
                { icon: 'home' as const, title: 'Refugees', desc: 'A safe start for families who have fled conflict or hardship.', items: ['Shelter and food parcels', 'Legal and medical referrals', 'Language and job training'] },
                { icon: 'people' as const, title: 'Families in need', desc: 'Short-term help when a crisis hits a household.', items: ['Rent, utilities and groceries', 'Child and school support', 'A caseworker who stays in touch'] },
              ].map((p) => (
                <article key={p.title} className="flex flex-col gap-4 rounded-[22px] border border-ln bg-sf p-7 shadow-sm">
                  <div className="grid h-13 w-13 place-items-center rounded-[14px] bg-mist text-td p-3 w-fit"><Icon name={p.icon} className="h-7 w-7" /></div>
                  <h3 className="font-heading text-2xl font-bold">{p.title}</h3>
                  <p className="text-mu">{p.desc}</p>
                  <ul className="flex-1 list-disc space-y-1 pl-5 text-mu">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                  <a href="#get-help" className="font-semibold text-td underline-offset-2 hover:underline">Request support</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="bg-deep px-4 py-20 text-[#EAF4F2] sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">How we help</h2>
              <p className="mt-4 text-lg text-[#A5BDBA]">A simple process, with a real person at every step.</p>
            </div>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Reach out', 'Send a request online or through a local partner. It takes a few minutes.'],
                ['We listen', 'A caseworker contacts you within two working days to understand your situation.'],
                ['Get support', 'Together we agree a plan and arrange food, school costs, shelter or referrals.'],
                ['Stay connected', 'We follow up until you are stable, and keep the door open afterwards.'],
              ].map((s, i) => (
                <li key={s[0]} className="border-t-[3px] border-sun pt-5">
                  <span className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-sun font-heading font-extrabold text-sk">{i + 1}</span>
                  <h3 className="mb-2 font-heading text-xl font-bold">{s[0]}</h3>
                  <p className="text-[#A5BDBA]">{s[1]}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="stories" className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">Stories from our community</h2>
              <p className="mt-4 text-lg text-mu">Sample stories shown as placeholders. Replace with real, consented testimonials.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { q: '“The weekly visit is the best part of my week. Someone knows my name and asks how I am.”', a: 'G', who: 'Grace, 74', prog: 'Home visit program' },
                { q: '“Paying my exam fees meant I could finish school. Now I am studying nursing.”', a: 'T', who: 'Thoko, 19', prog: 'Student support' },
                { q: '“We arrived with nothing. They found us a home, a doctor and a teacher for the children.”', a: 'A', who: 'Amina, mother of three', prog: 'Refugee program' },
              ].map((t) => (
                <blockquote key={t.who} className="flex flex-col justify-between gap-6 rounded-[22px] border border-ln bg-sf p-7">
                  <p className="font-heading text-lg font-medium leading-snug">{t.q}</p>
                  <footer className="flex items-center gap-3 text-mu">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-teal font-heading text-lg font-bold text-ot">{t.a}</span>
                    <span>{t.who}<br />{t.prog}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="give" className="bg-mist px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">Give today, change a life</h2>
              <p className="mt-4 text-lg text-mu">Every gift goes toward food, education, shelter and care.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-3xl bg-sf p-6 sm:p-8 shadow-sm">
                <h3 className="mb-4 font-heading text-2xl font-bold">Make a donation</h3>
                <div className="mb-4 grid grid-cols-2 rounded-full bg-bg p-1" role="group" aria-label="Donation frequency">
                  <button type="button" onClick={() => setFreq('once')} aria-pressed={freq === 'once'} className={`rounded-full px-4 py-2.5 font-semibold transition ${freq === 'once' ? 'bg-teal text-ot' : 'text-ink'}`}>One time</button>
                  <button type="button" onClick={() => setFreq('monthly')} aria-pressed={freq === 'monthly'} className={`rounded-full px-4 py-2.5 font-semibold transition ${freq === 'monthly' ? 'bg-teal text-ot' : 'text-ink'}`}>Monthly</button>
                </div>
                <label className="mb-3 grid gap-1 font-semibold">Currency
                  <select value={currency} onChange={(e) => { const c = e.target.value as "MWK" | "USD"; setCurrency(c); setAmount(c === "MWK" ? 10000 : 25); setCustom(''); setDonationMsg(''); }} className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink">
                    <option value="MWK">MWK (Malawi Kwacha)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </label>
                <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Donation amount">
                  {presetAmounts.map((amt, i) => (
                    <button key={amt} type="button" onClick={() => { setAmount(amt); setCustom(''); setBranch(DONATION_OPTIONS[i].branch); setDonationMsg(''); }} aria-pressed={amount === amt && !custom} className={`rounded-xl border-2 px-3 py-3 font-heading text-lg font-bold transition ${amount === amt && !custom ? 'border-teal bg-mist text-td' : 'border-ln'}`}>{currency === "MWK" ? `MWK ${amt.toLocaleString()}` : `$${amt}`}</button>
                  ))}
                </div>
                <label className="grid gap-1 font-semibold">Or enter another amount
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder={currency === "MWK" ? "Amount in MWK" : "Amount in USD"}
                    value={custom}
                    onChange={(e) => {
                      const v = e.target.value; setCustom(v);
                      const n = parseInt(v, 10); if (Number.isFinite(n) && n > 0) { setAmount(n); setDonationMsg(''); }
                    }}
                    className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink"
                  />
                </label>
                <label className="mt-3 grid gap-1 font-semibold">Support program / branch
                  <select value={branch} onChange={(e) => { setBranch(e.target.value as Branch); setDonationMsg(''); }} className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink">
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
                <label className="mt-3 grid gap-1 font-semibold">Your name (optional)
                  <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Anonymous" className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink" />
                </label>
                <label className="mt-3 grid gap-1 font-semibold">Email address (required for payment)
                  <input type="email" value={donorEmail} onChange={(e) => { setDonorEmail(e.target.value); setDonationMsg(''); }} placeholder="you@example.com" required className="w-full rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal text-ink" />
                </label>
                <p className="mt-3 min-h-[3.4em] font-medium" aria-live="polite">{donationImpact}</p>
                <button type="button" onClick={onDonate} disabled={donationBusy} className="mt-2 rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{donationBusy ? "Opening secure payment..." : "Donate securely"}</button>
                <p className="mt-2 text-sm text-mu">Complete your payment securely (mobile money/cards) without leaving the site flow.</p>
                {donationMsg && <p role="status" className="mt-4 rounded-xl border-l-4 border-teal bg-mist px-4 py-3">{donationMsg}</p>}
              </div>
              <div className="rounded-3xl bg-sf p-6 sm:p-8 shadow-sm">
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

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[28px] bg-teal p-8 text-ot sm:p-12 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-xl font-heading text-3xl font-extrabold sm:text-4xl">Give your time. Join our volunteers.</h2>
              <p className="mt-3 max-w-2xl text-lg opacity-90">A few hours a week can make a real difference. Visit a neighbor, mentor a student or welcome a family. No special training is needed.</p>
            </div>
            <a href="#get-help" className="shrink-0 rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5">Become a volunteer</a>
          </div>
        </section>

        <section id="faq" className="px-4 pb-20 pt-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-2xl"><h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">Questions we often hear</h2></div>
            <div className="max-w-3xl divide-y divide-ln">
              {[
                ['Who can ask for help?', 'Anyone facing hardship, including older people, students, refugees and families. You can also ask on behalf of someone else.'],
                ['Does it cost anything to get support?', 'No. Our services are free for the people we help.'],
                ['Is my information kept private?', 'Yes. We only share details with partners when you agree, and only to arrange your support.'],
                ['How is my donation used?', 'Most goes directly to programs. We publish an annual report showing every category of spending.'],
                ['Can I volunteer from home?', 'Yes. Phone calls, online tutoring and translation can all be done remotely.'],
              ].map(([q, a]) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-bold marker:content-none">
                    <span>{q}</span><span className="text-2xl text-teal group-open:hidden">+</span><span className="hidden text-2xl text-teal group-open:inline">–</span>
                  </summary>
                  <p className="mt-2 text-mu">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="get-help" className="bg-mist px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">Need help, or know someone who does?</h2>
              <p className="mt-4 text-lg text-mu">Send us a few details and our team will reply within two working days. You can ask for yourself or for someone else.</p>
              <ul className="mt-6 space-y-3 text-ink">
                <li className="flex items-center gap-3"><Icon name="phone" className="h-6 w-6 text-td" />+000 000 000 000</li>
                <li className="flex items-center gap-3"><Icon name="mail" className="h-6 w-6 text-td" />hello@helptheyneed.org</li>
                <li className="flex items-center gap-3"><Icon name="pin" className="h-6 w-6 text-td" />Your city, Your country</li>
              </ul>
            </div>
            <form ref={contactRef} onSubmit={onContactSubmit} noValidate className="grid gap-4 rounded-3xl border border-ln bg-sf p-6 shadow-sm sm:p-8">
              <label className="grid gap-1 font-semibold">Your name<input name="name" autoComplete="name" required className="rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal" /></label>
              <label className="grid gap-1 font-semibold">Phone or email<input name="contact" autoComplete="email" required className="rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal" /></label>
              <label className="grid gap-1 font-semibold">I am contacting you about
                <select name="who" className="rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal">
                  <option>An older person</option><option>A student</option><option>A refugee or displaced family</option><option>A family in need</option><option>Volunteering</option><option>Partnership</option>
                </select>
              </label>
              <label className="grid gap-1 font-semibold">How can we help?<textarea name="msg" rows={4} className="min-h-[110px] rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal" /></label>
              <button type="submit" className="justify-self-start rounded-full bg-teal px-7 py-3 font-semibold text-ot transition hover:-translate-y-0.5">Send request</button>
              {contactError && <p role="alert" className="rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-red-800 dark:bg-red-950/30 dark:text-red-200">{contactError}</p>}
              {contactMsg && <p role="status" className="rounded-xl border-l-4 border-teal bg-mist px-4 py-3">{contactMsg}</p>}
            </form>
          </div>
        </section>
      </main>

      <section className="bg-deep px-4 py-10 text-[#EAF4F2] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-heading text-2xl font-bold">Stay in touch</h3>
            <p className="text-[#A5BDBA]">Get our yearly report and news of the people your support helps.</p>
          </div>
          {newsletterMsg ? (
            <p role="status" className="rounded-xl border-l-4 border-sun bg-[#173533] px-4 py-3">{newsletterMsg}</p>
          ) : (
            <form onSubmit={onNewsletterSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" name="email" type="email" required placeholder="Your email" className="min-w-0 flex-1 rounded-xl border-2 border-[#25403E] bg-[#132A29] px-4 py-3 text-[#EAF4F2] placeholder:text-[#A5BDBA]" />
              <button type="submit" className="rounded-full bg-sun px-6 py-3 font-semibold text-sk transition hover:-translate-y-0.5">Subscribe</button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-[#25403E] bg-deep px-4 py-10 text-[#A5BDBA] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div>
              <a href="#top" className="flex items-center gap-2.5 font-heading text-xl font-extrabold text-[#EAF4F2]">
                <span className="relative inline-block h-8 w-8 rounded-[50%_50%_50%_8px] bg-teal"><span className="absolute inset-[0.55rem] rounded-full bg-sun" /></span>
                Help They Need
              </a>
              <p className="mt-3 max-w-sm">A registered foundation supporting people who need it most, with dignity and respect.</p>
            </div>
            <div><h3 className="mb-3 font-heading text-lg font-bold text-[#EAF4F2]">Our work</h3><ul className="space-y-2"><li><a href="#programs" className="hover:text-white">Programs</a></li><li><a href="#how" className="hover:text-white">How we help</a></li><li><a href="#stories" className="hover:text-white">Stories</a></li></ul></div>
            <div><h3 className="mb-3 font-heading text-lg font-bold text-[#EAF4F2]">Get involved</h3><ul className="space-y-2"><li><a href="#give" className="hover:text-white">Donate</a></li><li><a href="#get-help" className="hover:text-white">Volunteer</a></li><li><a href="#get-help" className="hover:text-white">Partner with us</a></li></ul></div>
            <div><h3 className="mb-3 font-heading text-lg font-bold text-[#EAF4F2]">About</h3><ul className="space-y-2"><li><a href="#about" className="hover:text-white">Our mission</a></li><li><a href="#faq" className="hover:text-white">FAQ</a></li><li><a href="#get-help" className="hover:text-white">Contact</a></li><li><a href="/admin" className="hover:text-white">Admin dashboard</a></li></ul></div>
          </div>
          <p className="mt-8 border-t border-[#25403E] pt-5 text-sm">© 2026 Help They Need Foundation. All rights reserved. Registered charity no. 000000.</p>
        </div>
      </footer>
    </div>
  );
}