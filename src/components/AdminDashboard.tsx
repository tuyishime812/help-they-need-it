"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Branch = "Older people" | "Students" | "Refugees" | "Families";
type Donation = { id: string; amount: number; currency: "MWK" | "USD"; frequency: "once" | "monthly"; branch: Branch; donorName: string; createdAt: string; paymentStatus: "pending" | "successful" | "failed"; txRef?: string };
type Req = { id: string; name: string; contact: string; category: string; message: string; createdAt: string; status: "new" | "in_review" | "resolved" };
type Money = { MWK: number; USD: number };
type Stats = {
  totalDonations: number;
  pendingCount: number;
  totals: Money;
  monthlyRecurring: Money;
  byBranch: Record<Branch, Money>;
  openRequests: number;
  recentDonations: Donation[];
  recentRequests: Req[];
};

const BRANCHES: Branch[] = ["Older people", "Students", "Refugees", "Families"];
const BRANCH_COLORS: Record<Branch, string> = {
  "Older people": "#2dd4bf",
  "Students": "#f59e0b",
  "Refugees": "#818cf8",
  "Families": "#34d399",
};

function fmtMoney(amount: number, currency: "MWK" | "USD") {
  return currency === "MWK" ? `MWK ${amount.toLocaleString("en-US")}` : `$${amount.toLocaleString("en-US")}`;
}
function fmtTime(iso: string) { return new Date(iso).toLocaleString(); }
function cn(...a: Array<string | false | null | undefined>) { return a.filter(Boolean).join(" "); }

function useAnimatedNumber(value: number, duration = 900) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const mounted = useRef(false);
  useEffect(() => {
    const start = mounted.current ? prev.current : 0;
    mounted.current = true;
    const diff = value - start;
    if (diff === 0) { setDisplay(value); prev.current = value; return; }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else prev.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <div className={cn("reveal", className)} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

function StatusDonut({ stats }: { stats: Stats }) {
  const counts = useMemo(() => {
    let success = 0, pending = 0, failed = 0;
    for (const d of stats.recentDonations) {
      if (d.paymentStatus === "successful") success++;
      else if (d.paymentStatus === "pending") pending++;
      else failed++;
    }
    pending = Math.max(pending, Math.min(stats.pendingCount, 30));
    const total = Math.max(success + pending + failed, 1);
    return { success, pending, failed, total };
  }, [stats]);
  const r = 40, c = 2 * Math.PI * r;
  const seg = (n: number) => (n / counts.total) * c;
  const s1 = seg(counts.success), s2 = seg(counts.pending), s3 = seg(counts.failed);
  const rate = Math.round((counts.success / counts.total) * 100);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-36 w-36">
        <div className="absolute inset-3 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
        <svg viewBox="0 0 100 100" className="relative h-full w-full -rotate-90 drop-shadow-lg">
          <defs>
            <linearGradient id="gSuccess" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="#2dd4bf"/></linearGradient>
            <linearGradient id="gPending" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
            <linearGradient id="gFailed" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#ef4444"/></linearGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="url(#gSuccess)" strokeWidth="10" strokeDasharray={`${s1} ${c}`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="url(#gPending)" strokeWidth="10" strokeDasharray={`${s2} ${c}`} strokeDashoffset={-s1} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="url(#gFailed)" strokeWidth="10" strokeDasharray={`${s3} ${c}`} strokeDashoffset={-(s1 + s2)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-extrabold text-emerald-300">{rate}%</span>
          <span className="text-[10px] uppercase tracking-widest text-[#7aa7a3]">success rate</span>
        </div>
      </div>
      <div className="w-full space-y-3 text-sm">
        {[
          { label: "Successful", value: counts.success, color: "bg-emerald-400", text: "text-emerald-300" },
          { label: "Pending", value: counts.pending, color: "bg-amber-400", text: "text-amber-300" },
          { label: "Failed", value: counts.failed, color: "bg-rose-400", text: "text-rose-300" },
        ].map((x) => (
          <div key={x.label} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className={cn("h-2.5 w-2.5 rounded-full", x.color)} />{x.label}</span><span className={cn("font-semibold", x.text)}>{x.value}</span></div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5"><div className={cn("h-full rounded-full transition-all duration-1000", x.color)} style={{ width: `${Math.max(4, (x.value / counts.total) * 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [connection, setConnection] = useState<"connecting" | "live" | "polling">("connecting");
  const [donationQuery, setDonationQuery] = useState("");
  const [donationFilter, setDonationFilter] = useState<"all" | "successful" | "pending" | "failed">("all");
  const [requestFilter, setRequestFilter] = useState<"all" | "new" | "in_review" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => { if (sessionStorage.getItem("htn_admin") === "1") setAuthed(true); }, []);

  async function load(silent = false) {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as Stats;
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
      if (silent) { setPulse(true); setTimeout(() => setPulse(false), 700); }
    } catch { setLoading(false); }
  }

  useEffect(() => {
    if (!authed) return;
    let cancelled = false, es: EventSource | null = null, poll: ReturnType<typeof setInterval> | null = null;
    const safeLoad = async (silent = false) => { if (!cancelled) await load(silent); };
    safeLoad(false);
    const startPolling = () => { if (poll) clearInterval(poll); poll = setInterval(() => safeLoad(true), 5000); if (!cancelled) setConnection("polling"); };
    if (live) {
      try {
        es = new EventSource("/api/stream");
        es.addEventListener("stats", (e) => {
          try {
            const data = JSON.parse((e as MessageEvent).data) as Stats;
            if (!cancelled) { setStats(data); setLastUpdated(new Date().toLocaleTimeString()); setLoading(false); setConnection("live"); setPulse(true); setTimeout(() => setPulse(false), 700); }
          } catch {}
        });
        es.onerror = () => { if (!cancelled) { es?.close(); es = null; startPolling(); } };
      } catch { startPolling(); }
    } else setConnection("polling");
    return () => { cancelled = true; es?.close(); if (poll) clearInterval(poll); };
  }, [authed, live]);

  const maxBranch = useMemo(() => (!stats ? 1 : Math.max(1, ...BRANCHES.map((b) => (stats.byBranch[b].MWK / 1000) + stats.byBranch[b].USD))), [stats]);
  const filteredDonations = useMemo(() => {
    if (!stats) return [];
    const q = donationQuery.trim().toLowerCase();
    return stats.recentDonations.filter((d) => {
      if (donationFilter !== "all" && d.paymentStatus !== donationFilter) return false;
      if (!q) return true;
      return [d.donorName, d.branch, d.paymentStatus, d.currency, d.txRef || "", String(d.amount)].some((v) => v.toLowerCase().includes(q));
    });
  }, [stats, donationQuery, donationFilter]);
  const filteredRequests = useMemo(() => (!stats ? [] : requestFilter === "all" ? stats.recentRequests : stats.recentRequests.filter((r) => r.status === requestFilter)), [stats, requestFilter]);
  const topBranch = useMemo(() => {
    if (!stats) return null;
    let best: { b: Branch; score: number } | null = null;
    for (const b of BRANCHES) { const v = stats.byBranch[b]; const score = v.MWK / 1000 + v.USD; if (!best || score > best.score) best = { b, score }; }
    return best?.b || null;
  }, [stats]);

  async function setRequestStatus(id: string, status: Req["status"]) {
    setUpdatingId(id);
    try { await fetch("/api/requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); await load(true); }
    finally { setUpdatingId(null); }
  }
  function exportDonations() {
    if (!stats) return;
    const rows = [["createdAt","donorName","branch","frequency","currency","amount","paymentStatus","txRef"]];
    for (const d of stats.recentDonations) rows.push([d.createdAt, d.donorName, d.branch, d.frequency, d.currency, String(d.amount), d.paymentStatus, d.txRef || ""]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "donations.csv"; a.click(); URL.revokeObjectURL(url);
  }
  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass.trim() === "admin123") { sessionStorage.setItem("htn_admin", "1"); setAuthed(true); setError(""); }
    else setError("Incorrect password.");
  }
  function logout() { sessionStorage.removeItem("htn_admin"); setAuthed(false); setPass(""); }

  const animMWK = useAnimatedNumber(stats?.totals.MWK || 0);
  const animUSD = useAnimatedNumber(stats?.totals.USD || 0);
  const animSuccess = useAnimatedNumber(stats?.totalDonations || 0);
  const animPending = useAnimatedNumber(stats?.pendingCount || 0);

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020807] px-4 text-[#EAF4F2]">
        <style>{`@keyframes floatA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.1)}}@keyframes floatB{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,20px) scale(1.05)}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-teal-500/20 blur-[100px]" style={{animation:"floatA 8s ease-in-out infinite"}} />
          <div className="absolute -bottom-24 -right-16 h-[28rem] w-[28rem] rounded-full bg-amber-500/15 blur-[110px]" style={{animation:"floatB 10s ease-in-out infinite"}} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.08),transparent_50%)]" />
        </div>
        <form onSubmit={login} className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b1817]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl" style={{animation:"fadeUp .6s ease both"}}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/20 to-amber-400/20 ring-1 ring-white/10"><span className="h-3 w-3 rounded-full bg-teal-400 animate-pulse" /></div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-300/80">Help They Need</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">Admin Control Center</h1>
          <p className="mt-2 text-sm text-[#8fb8b4]">Secure access to live donations, revenue analytics, and case tracking.</p>
          <label className="mt-7 grid gap-1.5 text-sm font-semibold">Password
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-normal text-[#EAF4F2] outline-none transition duration-300 placeholder:text-[#5d807c] focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10" placeholder="Enter admin password" />
          </label>
          {error && <p className="mt-3 rounded-xl border-l-4 border-rose-400 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">{error}</p>}
          <button type="submit" className="group mt-5 relative w-full overflow-hidden rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3 font-semibold text-[#3A2600] transition duration-300 hover:shadow-lg hover:shadow-amber-500/20 hover:brightness-105">
            <span className="relative z-10">Access dashboard</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-full" />
          </button>
          <p className="mt-4 text-xs text-[#6f9490]">Demo password: <span className="font-mono text-[#9dc7c3]">admin123</span></p>
        </form>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020807] text-[#EAF4F2]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(18px) scale(.985);} to {opacity:1; transform: translateY(0) scale(1);} }
        @keyframes fadeIn { from { opacity:0;} to {opacity:1;} }
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glowPulse { 0%,100%{opacity:.35} 50%{opacity:.7} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .reveal { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) both; }
        .shimmer { background-size: 200% 100%; animation: shimmer 2.5s linear infinite; }
        .glass { background: linear-gradient(180deg, rgba(19,42,41,.75), rgba(10,24,23,.85)); backdrop-filter: blur(14px); }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-[10%] h-[32rem] w-[32rem] rounded-full bg-teal-500/15 blur-[120px]" style={{animation:"glowPulse 8s ease-in-out infinite"}} />
        <div className="absolute top-[30%] -right-32 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-[120px]" style={{animation:"glowPulse 10s ease-in-out infinite .5s"}} />
        <div className="absolute bottom-[-10%] left-[30%] h-[24rem] w-[24rem] rounded-full bg-indigo-500/10 blur-[120px]" style={{animation:"glowPulse 9s ease-in-out infinite 1s"}} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.06),transparent_55%)]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020807]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-6">
          <Reveal className="flex items-center gap-4">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 shadow-lg shadow-teal-900/20">
              <span className={cn("h-3 w-3 rounded-full", live ? "bg-emerald-400" : "bg-slate-500")} />
              {live && <span className="absolute inset-0 rounded-2xl border border-emerald-400/30 animate-ping" style={{animationDuration:"2.5s"}} />}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-teal-300/80">Operations Control Center</p>
              <h1 className="font-heading text-2xl font-extrabold sm:text-3xl">Live Revenue & Impact Dashboard</h1>
              <p className="mt-0.5 text-sm text-[#8fb8b4]">Real-time donation, branch, and case tracking</p>
            </div>
          </Reveal>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-500", live ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,.15)]" : "border-white/10 bg-white/5 text-[#8fb8b4]", pulse && "scale-[1.03] ring-2 ring-emerald-400/20")}>
              <span className="relative flex h-2.5 w-2.5"><span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", live && "animate-ping bg-emerald-400")} /><span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", live ? "bg-emerald-400" : "bg-slate-500")} /></span>
              {live ? (connection === "live" ? "Live stream" : "Syncing") : "Paused"}
            </span>
            {[
              { label: live ? "Pause" : "Resume", onClick: () => setLive((v) => !v) },
              { label: "Refresh", onClick: () => load(true) },
              { label: "Export CSV", onClick: exportDonations },
            ].map((b) => (
              <button key={b.label} onClick={b.onClick} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#d7ece9] transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400/30 hover:bg-teal-500/10 hover:shadow-lg hover:shadow-teal-900/20">{b.label}</button>
            ))}
            <a href="/" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#d7ece9] transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400/30 hover:bg-teal-500/10">View site</a>
            <button onClick={logout} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15">Log out</button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {loading || !stats ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-36 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"><div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/[0.04] to-transparent shimmer" /></div>)}</div>
            <div className="grid gap-6 xl:grid-cols-2">{[1,2].map((i) => <div key={i} className="h-72 rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse" />)}</div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Revenue tracked (verified)", main: `MWK ${animMWK.toLocaleString()}`, sub: `$${animUSD.toLocaleString()}`, foot: `${animSuccess} successful • ${animPending} pending`, accent: "from-teal-500/20 to-teal-500/0", glow: "shadow-teal-900/20", valueClass: "text-teal-300" },
                { label: "Monthly recurring", main: fmtMoney(stats.monthlyRecurring.MWK, "MWK"), sub: fmtMoney(stats.monthlyRecurring.USD, "USD"), foot: "Active commitments", accent: "from-amber-500/20 to-amber-500/0", glow: "shadow-amber-900/10", valueClass: "text-amber-300" },
                { label: "Open support requests", main: String(stats.openRequests), sub: topBranch ? `Top branch: ${topBranch}` : "Tracking active cases", foot: "Needs follow-up / review", accent: "from-indigo-500/20 to-indigo-500/0", glow: "shadow-indigo-900/10", valueClass: "text-indigo-300" },
                { label: "System status", main: lastUpdated || "—", sub: live ? (connection === "live" ? "Real-time stream active" : "Auto-refresh every 5s") : "Updates paused", foot: "Live data pipeline", accent: "from-emerald-500/20 to-emerald-500/0", glow: "shadow-emerald-900/10", valueClass: "text-emerald-300" },
              ].map((c, i) => (
                <Reveal key={c.label} delay={i * 70}>
                  <div className={cn("group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl", "glass", c.glow, pulse && "ring-1 ring-teal-400/20")}>
                    <div className={cn("pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition duration-500 group-hover:opacity-100", c.accent)} />
                    <p className="text-sm text-[#8fb8b4]">{c.label}</p>
                    <p className={cn("mt-2 font-heading text-2xl font-extrabold tracking-tight", c.valueClass, c.label.includes("Open") ? "text-4xl" : "")}>{c.main}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#cfe8e4]">{c.sub}</p>
                    <p className="mt-2 text-xs text-[#7aa7a3]">{c.foot}</p>
                    {c.label === "System status" && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5"><div className={cn("h-full rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400", live && "shimmer")} style={{width: live ? "100%" : "35%"}} /></div>}
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
              <Reveal delay={120}>
                <section className="glass rounded-2xl border border-white/10 p-5 shadow-xl sm:p-6">
                  <div className="mb-5 flex items-center justify-between"><h2 className="font-heading text-xl font-bold">Revenue by branch (live)</h2><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8fb8b4]">Verified totals</span></div>
                  <div className="space-y-4">
                    {BRANCHES.map((b, i) => {
                      const val = stats.byBranch[b];
                      const score = (val.MWK / 1000) + val.USD;
                      const pct = Math.max(score > 0 ? 6 : 2, Math.round((score / maxBranch) * 100));
                      return (
                        <div key={b} className="group">
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                            <span className="flex items-center gap-2 font-semibold"><span className="h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{backgroundColor: BRANCH_COLORS[b], color: BRANCH_COLORS[b]}} />{b}</span>
                            <span className="text-[#8fb8b4]">{fmtMoney(val.MWK, "MWK")} • {fmtMoney(val.USD, "USD")}</span>
                          </div>
                          <div className="relative h-3 overflow-hidden rounded-full bg-white/5 ring-1 ring-inset ring-white/10">
                            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-[1200ms] ease-out group-hover:brightness-125" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRANCH_COLORS[b]}, ${BRANCH_COLORS[b]}99)`, transitionDelay: `${i * 80}ms` }} />
                            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/20 to-transparent" style={{ width: `${pct}%`, transitionDelay: `${i * 80}ms` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </Reveal>

              <div className="space-y-6">
                <Reveal delay={180}><section className="glass rounded-2xl border border-white/10 p-5 shadow-xl sm:p-6"><h2 className="mb-4 font-heading text-xl font-bold">Payment status overview</h2><StatusDonut stats={stats} /></section></Reveal>
                <Reveal delay={240}>
                  <section className="glass rounded-2xl border border-white/10 p-5 shadow-xl sm:p-6">
                    <div className="mb-3 flex items-center justify-between"><h2 className="font-heading text-xl font-bold">Live activity</h2><span className={cn("inline-flex items-center gap-1.5 text-sm", connection === "live" ? "text-emerald-300" : "text-amber-300")}><span className={cn("h-2 w-2 rounded-full", connection === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />{connection === "live" ? "real-time" : "syncing"}</span></div>
                    <ul className="space-y-2.5">
                      {stats.recentDonations.slice(0, 5).map((d, i) => (
                        <li key={d.id} className="group rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400/30 hover:bg-teal-500/[0.06]" style={{animation: `fadeIn .4s ease ${i * 60}ms both`}}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{d.donorName} <span className="font-normal text-[#8fb8b4]">{d.paymentStatus === "successful" ? "donated" : d.paymentStatus === "pending" ? "initiated" : "attempted"}</span> <span className="text-teal-300">{fmtMoney(d.amount, d.currency)}</span></p>
                              <p className="mt-0.5 text-xs text-[#7aa7a3]">{d.branch} • {d.frequency} • <span className={d.paymentStatus === "successful" ? "text-emerald-300" : d.paymentStatus === "pending" ? "text-amber-300" : "text-rose-300"}>{d.paymentStatus}</span></p>
                            </div>
                            <span className="whitespace-nowrap text-[11px] text-[#6f9490]">{new Date(d.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </li>
                      ))}
                      {stats.recentDonations.length === 0 && <li className="rounded-xl border border-dashed border-white/10 p-6 text-center text-[#7aa7a3]">No donations tracked yet.</li>}
                    </ul>
                  </section>
                </Reveal>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Reveal delay={300}>
                <section className="glass overflow-hidden rounded-2xl border border-white/10 p-5 shadow-xl sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-heading text-xl font-bold">Donations tracker</h2>
                    <div className="flex flex-wrap gap-2">
                      <input value={donationQuery} onChange={(e) => setDonationQuery(e.target.value)} placeholder="Search donor, branch, tx ref..." className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/10 sm:w-56" />
                      <select value={donationFilter} onChange={(e) => setDonationFilter(e.target.value as any)} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-teal-400/50">
                        <option value="all">All statuses</option><option value="successful">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-[#7aa7a3]"><tr className="border-b border-white/10"><th className="py-2 pr-4 font-medium">Time</th><th className="py-2 pr-4 font-medium">Donor</th><th className="py-2 pr-4 font-medium">Branch</th><th className="py-2 pr-4 font-medium">Type</th><th className="py-2 pr-4 font-medium">Status</th><th className="py-2 font-medium">Amount</th></tr></thead>
                      <tbody>
                        {filteredDonations.map((d) => (
                          <tr key={d.id} className="group border-t border-white/5 transition-colors duration-200 hover:bg-white/[0.04]">
                            <td className="py-3 pr-4 whitespace-nowrap text-[#8fb8b4]">{fmtTime(d.createdAt)}</td>
                            <td className="py-3 pr-4 font-medium">{d.donorName}<div className="font-mono text-[11px] text-[#5d807c]">{d.txRef || "—"}</div></td>
                            <td className="py-3 pr-4"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{backgroundColor: BRANCH_COLORS[d.branch]}} />{d.branch}</span></td>
                            <td className="py-3 pr-4 capitalize text-[#a8c9c5]">{d.frequency}</td>
                            <td className="py-3 pr-4"><span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", d.paymentStatus === "successful" ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20" : d.paymentStatus === "pending" ? "bg-amber-500/10 text-amber-300 ring-amber-500/20" : "bg-rose-500/10 text-rose-300 ring-rose-500/20")}>{d.paymentStatus}</span></td>
                            <td className="py-3 font-semibold text-teal-300">{fmtMoney(d.amount, d.currency)}</td>
                          </tr>
                        ))}
                        {filteredDonations.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[#7aa7a3]">No donations match your filters.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </Reveal>

              <Reveal delay={360}>
                <section className="glass overflow-hidden rounded-2xl border border-white/10 p-5 shadow-xl sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-heading text-xl font-bold">Support requests & cases</h2>
                    <select value={requestFilter} onChange={(e) => setRequestFilter(e.target.value as any)} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-teal-400/50">
                      <option value="all">All cases</option><option value="new">New</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-[#7aa7a3]"><tr className="border-b border-white/10"><th className="py-2 pr-4 font-medium">Time</th><th className="py-2 pr-4 font-medium">Name</th><th className="py-2 pr-4 font-medium">Category</th><th className="py-2 pr-4 font-medium">Status / Action</th><th className="py-2 font-medium">Contact</th></tr></thead>
                      <tbody>
                        {filteredRequests.map((r) => (
                          <tr key={r.id} className="border-t border-white/5 align-top transition-colors duration-200 hover:bg-white/[0.04]">
                            <td className="py-3 pr-4 whitespace-nowrap text-[#8fb8b4]">{fmtTime(r.createdAt)}</td>
                            <td className="py-3 pr-4 font-medium">{r.name}<div className="max-w-xs truncate text-[11px] text-[#5d807c]" title={r.message}>{r.message || "—"}</div></td>
                            <td className="py-3 pr-4 text-[#a8c9c5]">{r.category}</td>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", r.status === "new" ? "bg-amber-500/10 text-amber-300 ring-amber-500/20" : r.status === "in_review" ? "bg-sky-500/10 text-sky-300 ring-sky-500/20" : "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20")}>{r.status.replace("_", " ")}</span>
                                <select disabled={updatingId === r.id} value={r.status} onChange={(e) => setRequestStatus(r.id, e.target.value as Req["status"])} className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs outline-none transition focus:border-teal-400/50 disabled:opacity-50">
                                  <option value="new">new</option><option value="in_review">in_review</option><option value="resolved">resolved</option>
                                </select>
                              </div>
                            </td>
                            <td className="py-3 text-[#8fb8b4]">{r.contact}</td>
                          </tr>
                        ))}
                        {filteredRequests.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-[#7aa7a3]">No requests match your filter.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </Reveal>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}