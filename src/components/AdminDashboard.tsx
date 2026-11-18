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
  "Older people": "#5FC2BB",
  "Students": "#F0A92E",
  "Refugees": "#7C9CFF",
  "Families": "#6EE7A8",
};

function fmtMoney(amount: number, currency: "MWK" | "USD") {
  return currency === "MWK" ? `MWK ${amount.toLocaleString("en-US")}` : `$${amount.toLocaleString("en-US")}`;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleString();
}
function cn(...a: Array<string | false | null | undefined>) { return a.filter(Boolean).join(" "); }

function useAnimatedNumber(value: number, duration = 700) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    if (diff === 0) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else prev.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

function StatusDonut({ stats }: { stats: Stats }) {
  const counts = useMemo(() => {
    let success = 0, pending = 0, failed = 0;
    for (const d of stats.recentDonations) {
      if (d.paymentStatus === "successful") success++;
      else if (d.paymentStatus === "pending") pending++;
      else failed++;
    }
    // include overall pending count context if recent window small
    pending = Math.max(pending, Math.min(stats.pendingCount, 20));
    const total = Math.max(success + pending + failed, 1);
    return { success, pending, failed, total };
  }, [stats]);
  const r = 42, c = 2 * Math.PI * r;
  const seg = (n: number) => (n / counts.total) * c;
  const s1 = seg(counts.success);
  const s2 = seg(counts.pending);
  const s3 = seg(counts.failed);
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#0B1B1B" strokeWidth="12" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#34D399" strokeWidth="12" strokeDasharray={`${s1} ${c}`} strokeLinecap="round" className="transition-all duration-700" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#FBBF24" strokeWidth="12" strokeDasharray={`${s2} ${c}`} strokeDashoffset={-s1} strokeLinecap="round" className="transition-all duration-700" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F87171" strokeWidth="12" strokeDasharray={`${s3} ${c}`} strokeDashoffset={-(s1 + s2)} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-xl font-extrabold">{stats.totalDonations}</span>
          <span className="text-[10px] uppercase tracking-wide text-[#A5BDBA]">success</span>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Successful <span className="ml-auto pl-3 font-semibold text-[#EAF4F2]">{counts.success}</span></div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Pending <span className="ml-auto pl-3 font-semibold text-[#EAF4F2]">{counts.pending}</span></div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400" />Failed <span className="ml-auto pl-3 font-semibold text-[#EAF4F2]">{counts.failed}</span></div>
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

  useEffect(() => {
    if (sessionStorage.getItem("htn_admin") === "1") setAuthed(true);
  }, []);

  async function load(silent = false) {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as Stats;
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
      if (silent) { setPulse(true); setTimeout(() => setPulse(false), 600); }
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    let es: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    const safeLoad = async (silent = false) => { if (!cancelled) await load(silent); };
    safeLoad(false);
    const startPolling = () => {
      if (poll) clearInterval(poll);
      poll = setInterval(() => safeLoad(true), 5000);
      if (!cancelled) setConnection("polling");
    };
    if (live) {
      try {
        es = new EventSource("/api/stream");
        es.addEventListener("stats", (e) => {
          try {
            const data = JSON.parse((e as MessageEvent).data) as Stats;
            if (!cancelled) {
              setStats(data);
              setLastUpdated(new Date().toLocaleTimeString());
              setLoading(false);
              setConnection("live");
              setPulse(true); setTimeout(() => setPulse(false), 600);
            }
          } catch {}
        });
        es.onerror = () => { if (!cancelled) { es?.close(); es = null; startPolling(); } };
      } catch { startPolling(); }
    } else {
      setConnection("polling");
    }
    return () => { cancelled = true; es?.close(); if (poll) clearInterval(poll); };
  }, [authed, live]);

  const maxBranch = useMemo(() => {
    if (!stats) return 1;
    return Math.max(1, ...BRANCHES.map((b) => (stats.byBranch[b].MWK / 1000) + stats.byBranch[b].USD));
  }, [stats]);

  const filteredDonations = useMemo(() => {
    if (!stats) return [];
    const q = donationQuery.trim().toLowerCase();
    return stats.recentDonations.filter((d) => {
      if (donationFilter !== "all" && d.paymentStatus !== donationFilter) return false;
      if (!q) return true;
      return [d.donorName, d.branch, d.paymentStatus, d.currency, d.txRef || "", String(d.amount)].some((v) => v.toLowerCase().includes(q));
    });
  }, [stats, donationQuery, donationFilter]);

  const filteredRequests = useMemo(() => {
    if (!stats) return [];
    if (requestFilter === "all") return stats.recentRequests;
    return stats.recentRequests.filter((r) => r.status === requestFilter);
  }, [stats, requestFilter]);

  const topBranch = useMemo(() => {
    if (!stats) return null;
    let best: { b: Branch; score: number } | null = null;
    for (const b of BRANCHES) {
      const v = stats.byBranch[b];
      const score = v.MWK / 1000 + v.USD;
      if (!best || score > best.score) best = { b, score };
    }
    return best?.b || null;
  }, [stats]);

  async function setRequestStatus(id: string, status: Req["status"]) {
    setUpdatingId(id);
    try {
      await fetch("/api/requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      await load(true);
    } finally {
      setUpdatingId(null);
    }
  }

  function exportDonations() {
    if (!stats) return;
    const rows = [["createdAt","donorName","branch","frequency","currency","amount","paymentStatus","txRef"]];
    for (const d of stats.recentDonations) rows.push([d.createdAt, d.donorName, d.branch, d.frequency, d.currency, String(d.amount), d.paymentStatus, d.txRef || ""]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "donations.csv"; a.click(); URL.revokeObjectURL(url);
  }

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass.trim() === "admin123") {
      sessionStorage.setItem("htn_admin", "1"); setAuthed(true); setError("");
    } else setError("Incorrect password.");
  }
  function logout() { sessionStorage.removeItem("htn_admin"); setAuthed(false); setPass(""); }

  const animMWK = useAnimatedNumber(stats?.totals.MWK || 0);
  const animUSD = useAnimatedNumber(stats?.totals.USD || 0);
  const animSuccess = useAnimatedNumber(stats?.totalDonations || 0);
  const animPending = useAnimatedNumber(stats?.pendingCount || 0);

  if (!authed) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050b0b] text-[#EAF4F2] flex items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-[#1F6F6B]/30 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#F0A92E]/10 blur-3xl" />
        </div>
        <form onSubmit={login} className="relative w-full max-w-md rounded-3xl border border-[#25403E]/80 bg-[#0d1f1e]/90 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-[#5FC2BB]">Help They Need</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">Admin Control Center</h1>
          <p className="mt-2 text-[#A5BDBA]">Secure access to live donations, branch analytics, and case tracking.</p>
          <label className="mt-6 grid gap-1 font-semibold">Password
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="rounded-xl border-2 border-[#25403E] bg-[#071212] px-4 py-3 font-normal outline-none transition focus:border-[#5FC2BB]" placeholder="Enter admin password" />
          </label>
          {error && <p className="mt-3 rounded-xl border-l-4 border-red-400 bg-red-950/30 px-4 py-3 text-red-200">{error}</p>}
          <button type="submit" className="mt-5 w-full rounded-full bg-gradient-to-r from-[#F0A92E] to-[#ffd36e] px-6 py-3 font-semibold text-[#3A2600] transition hover:brightness-105">Access dashboard</button>
          <p className="mt-4 text-xs text-[#A5BDBA]">Demo password: <span className="font-mono">admin123</span></p>
        </form>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050b0b] text-[#EAF4F2]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(10px);} to {opacity:1; transform: translateY(0);} }
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        .fade-up { animation: fadeUp .5s ease both; }
        .shimmer { background-size: 200% 100%; animation: shimmer 3s linear infinite; }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#1F6F6B]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[#F0A92E]/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-[#25403E]/70 bg-[#050b0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-6">
          <div className="fade-up">
            <p className="text-xs uppercase tracking-[0.25em] text-[#5FC2BB]">Operations Control Center</p>
            <h1 className="font-heading text-2xl font-extrabold sm:text-3xl">Live Donations & Impact Dashboard</h1>
            <p className="mt-1 text-sm text-[#A5BDBA]">Real-time PayChangu tracking by branch, status, and case activity</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border transition", live ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300" : "border-[#25403E] bg-[#132A29] text-[#A5BDBA]", pulse && "ring-2 ring-emerald-400/30")}>
              <span className={cn("h-2.5 w-2.5 rounded-full", live ? "bg-emerald-400 animate-pulse" : "bg-[#496260]")} />
              {live ? (connection === "live" ? "Real-time connected" : "Syncing (fallback)") : "Live paused"}
            </span>
            <button onClick={() => setLive((v) => !v)} className="rounded-full border border-[#25403E] bg-[#132A29]/60 px-4 py-2 text-sm font-semibold transition hover:bg-[#173533] hover:-translate-y-0.5">{live ? "Pause" : "Resume"}</button>
            <button onClick={() => load(true)} className="rounded-full border border-[#25403E] bg-[#132A29]/60 px-4 py-2 text-sm font-semibold transition hover:bg-[#173533] hover:-translate-y-0.5">Refresh</button>
            <button onClick={exportDonations} className="rounded-full border border-[#25403E] bg-[#132A29]/60 px-4 py-2 text-sm font-semibold transition hover:bg-[#173533] hover:-translate-y-0.5">Export CSV</button>
            <a href="/" className="rounded-full border border-[#25403E] bg-[#132A29]/60 px-4 py-2 text-sm font-semibold transition hover:bg-[#173533] hover:-translate-y-0.5">View site</a>
            <button onClick={logout} className="rounded-full bg-[#132A29] px-4 py-2 text-sm font-semibold transition hover:bg-[#173533]">Log out</button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {loading || !stats ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-36 rounded-2xl border border-[#25403E] bg-[#132A29]/60 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={cn("fade-up rounded-2xl border border-[#25403E]/80 bg-gradient-to-br from-[#132A29] to-[#0b1b1b] p-5 shadow-lg shadow-black/20", pulse && "ring-1 ring-[#5FC2BB]/30")} style={{animationDelay:".02s"}}>
                <p className="text-sm text-[#A5BDBA]">Successful donations (verified)</p>
                <p className="mt-2 font-heading text-2xl font-extrabold text-[#5FC2BB]">MWK {animMWK.toLocaleString()}</p>
                <p className="font-heading text-xl font-bold text-[#5FC2BB]">${animUSD.toLocaleString()}</p>
                <p className="mt-1 text-sm text-[#A5BDBA]">{animSuccess} successful • {animPending} pending</p>
              </div>
              <div className="fade-up rounded-2xl border border-[#25403E]/80 bg-gradient-to-br from-[#132A29] to-[#0b1b1b] p-5 shadow-lg" style={{animationDelay:".06s"}}>
                <p className="text-sm text-[#A5BDBA]">Monthly recurring</p>
                <p className="mt-2 font-heading text-2xl font-extrabold text-[#F0A92E]">{fmtMoney(stats.monthlyRecurring.MWK, "MWK")}</p>
                <p className="font-heading text-xl font-bold text-[#F0A92E]">{fmtMoney(stats.monthlyRecurring.USD, "USD")}</p>
                <p className="mt-1 text-sm text-[#A5BDBA]">Active monthly commitments</p>
              </div>
              <div className="fade-up rounded-2xl border border-[#25403E]/80 bg-gradient-to-br from-[#132A29] to-[#0b1b1b] p-5 shadow-lg" style={{animationDelay:".1s"}}>
                <p className="text-sm text-[#A5BDBA]">Open support requests</p>
                <p className="mt-2 font-heading text-4xl font-extrabold">{stats.openRequests}</p>
                <p className="mt-1 text-sm text-[#A5BDBA]">Cases needing follow-up / review</p>
                {topBranch && <p className="mt-2 inline-flex rounded-full bg-[#173533] px-3 py-1 text-xs text-[#8DD8D2]">Top branch: {topBranch}</p>}
              </div>
              <div className="fade-up rounded-2xl border border-[#25403E]/80 bg-gradient-to-br from-[#132A29] to-[#0b1b1b] p-5 shadow-lg" style={{animationDelay:".14s"}}>
                <p className="text-sm text-[#A5BDBA]">System status</p>
                <p className="mt-2 font-heading text-3xl font-extrabold">{lastUpdated || "—"}</p>
                <p className="mt-1 text-sm text-[#A5BDBA]">{live ? (connection === "live" ? "Real-time stream active" : "Auto-refresh every 5s") : "Updates paused"}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0B1B1B]"><div className={cn("h-full rounded-full bg-gradient-to-r from-[#5FC2BB] via-[#F0A92E] to-[#5FC2BB]", live && "shimmer")} style={{width: live ? "100%" : "35%"}} /></div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
              <section className="fade-up rounded-2xl border border-[#25403E]/80 bg-[#0f2221]/90 p-5 sm:p-6 shadow-lg" style={{animationDelay:".16s"}}>
                <div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-xl font-bold">Money donated by branch (live)</h2><span className="text-sm text-[#A5BDBA]">Verified totals</span></div>
                <div className="space-y-4">
                  {BRANCHES.map((b) => {
                    const val = stats.byBranch[b];
                    const score = (val.MWK / 1000) + val.USD;
                    const pct = Math.max(4, Math.round((score / maxBranch) * 100));
                    return (
                      <div key={b} className="group">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm"><span className="font-semibold flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: BRANCH_COLORS[b]}} />{b}</span><span className="text-[#A5BDBA]">{fmtMoney(val.MWK, "MWK")} • {fmtMoney(val.USD, "USD")}</span></div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#071212] ring-1 ring-inset ring-[#25403E]/60"><div className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRANCH_COLORS[b]}, ${BRANCH_COLORS[b]}cc)` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="space-y-6">
                <section className="fade-up rounded-2xl border border-[#25403E]/80 bg-[#0f2221]/90 p-5 sm:p-6 shadow-lg" style={{animationDelay:".2s"}}>
                  <h2 className="mb-4 font-heading text-xl font-bold">Payment status overview</h2>
                  <StatusDonut stats={stats} />
                </section>
                <section className="fade-up rounded-2xl border border-[#25403E]/80 bg-[#0f2221]/90 p-5 sm:p-6 shadow-lg" style={{animationDelay:".24s"}}>
                  <div className="mb-3 flex items-center justify-between"><h2 className="font-heading text-xl font-bold">Live activity</h2><span className={cn("text-sm", connection === "live" ? "text-emerald-300" : "text-amber-300")}>● {connection === "live" ? "real-time" : "syncing"}</span></div>
                  <ul className="space-y-2.5">
                    {stats.recentDonations.slice(0, 5).map((d) => (
                      <li key={d.id} className="rounded-xl border border-[#25403E]/70 bg-[#071212]/70 p-3 transition hover:border-[#5FC2BB]/40">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">{d.donorName} <span className="text-[#A5BDBA] font-normal">{d.paymentStatus === "successful" ? "donated" : d.paymentStatus === "pending" ? "initiated" : "attempted"}</span> {fmtMoney(d.amount, d.currency)}</p>
                            <p className="text-xs text-[#A5BDBA] mt-0.5">{d.branch} • {d.frequency} • <span className={d.paymentStatus === "successful" ? "text-emerald-300" : d.paymentStatus === "pending" ? "text-amber-300" : "text-red-300"}>{d.paymentStatus}</span></p>
                          </div>
                          <span className="text-[11px] text-[#A5BDBA] whitespace-nowrap">{new Date(d.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </li>
                    ))}
                    {stats.recentDonations.length === 0 && <li className="text-[#A5BDBA]">No donations yet.</li>}
                  </ul>
                </section>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="fade-up rounded-2xl border border-[#25403E]/80 bg-[#0f2221]/90 p-5 sm:p-6 shadow-lg overflow-hidden" style={{animationDelay:".28s"}}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-heading text-xl font-bold">Donations tracker</h2>
                  <div className="flex flex-wrap gap-2">
                    <input value={donationQuery} onChange={(e) => setDonationQuery(e.target.value)} placeholder="Search donor, branch, tx ref..." className="w-full sm:w-56 rounded-lg border border-[#25403E] bg-[#071212] px-3 py-2 text-sm outline-none focus:border-[#5FC2BB]" />
                    <select value={donationFilter} onChange={(e) => setDonationFilter(e.target.value as any)} className="rounded-lg border border-[#25403E] bg-[#071212] px-3 py-2 text-sm outline-none focus:border-[#5FC2BB]">
                      <option value="all">All statuses</option><option value="successful">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[#A5BDBA]"><tr><th className="py-2 pr-4">Time</th><th className="py-2 pr-4">Donor</th><th className="py-2 pr-4">Branch</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Status</th><th className="py-2">Amount</th></tr></thead>
                    <tbody>
                      {filteredDonations.map((d) => (
                        <tr key={d.id} className="border-t border-[#25403E]/70 transition hover:bg-[#132A29]/40">
                          <td className="py-2.5 pr-4 text-[#A5BDBA] whitespace-nowrap">{fmtTime(d.createdAt)}</td>
                          <td className="py-2.5 pr-4 font-medium">{d.donorName}<div className="text-[11px] text-[#6b8a87] font-mono">{d.txRef || "—"}</div></td>
                          <td className="py-2.5 pr-4"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{backgroundColor: BRANCH_COLORS[d.branch]}} />{d.branch}</span></td>
                          <td className="py-2.5 pr-4">{d.frequency}</td>
                          <td className="py-2.5 pr-4"><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", d.paymentStatus === "successful" ? "bg-emerald-900/50 text-emerald-300" : d.paymentStatus === "pending" ? "bg-amber-900/50 text-amber-300" : "bg-red-900/50 text-red-300")}>{d.paymentStatus}</span></td>
                          <td className="py-2.5 font-semibold text-[#5FC2BB]">{fmtMoney(d.amount, d.currency)}</td>
                        </tr>
                      ))}
                      {filteredDonations.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-[#A5BDBA]">No donations match your filters.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="fade-up rounded-2xl border border-[#25403E]/80 bg-[#0f2221]/90 p-5 sm:p-6 shadow-lg overflow-hidden" style={{animationDelay:".32s"}}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-heading text-xl font-bold">Support requests & case management</h2>
                  <select value={requestFilter} onChange={(e) => setRequestFilter(e.target.value as any)} className="rounded-lg border border-[#25403E] bg-[#071212] px-3 py-2 text-sm outline-none focus:border-[#5FC2BB]">
                    <option value="all">All cases</option><option value="new">New</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[#A5BDBA]"><tr><th className="py-2 pr-4">Time</th><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Category</th><th className="py-2 pr-4">Status / Action</th><th className="py-2">Contact</th></tr></thead>
                    <tbody>
                      {filteredRequests.map((r) => (
                        <tr key={r.id} className="border-t border-[#25403E]/70 align-top transition hover:bg-[#132A29]/40">
                          <td className="py-2.5 pr-4 text-[#A5BDBA] whitespace-nowrap">{fmtTime(r.createdAt)}</td>
                          <td className="py-2.5 pr-4 font-medium">{r.name}<div className="text-[11px] text-[#6b8a87] max-w-xs truncate" title={r.message}>{r.message || "—"}</div></td>
                          <td className="py-2.5 pr-4">{r.category}</td>
                          <td className="py-2.5 pr-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", r.status === "new" ? "bg-amber-900/50 text-amber-300" : r.status === "in_review" ? "bg-sky-900/50 text-sky-300" : "bg-emerald-900/50 text-emerald-300")}>{r.status.replace("_", " ")}</span>
                              <select disabled={updatingId === r.id} value={r.status} onChange={(e) => setRequestStatus(r.id, e.target.value as Req["status"])} className="rounded-md border border-[#25403E] bg-[#071212] px-2 py-1 text-xs outline-none focus:border-[#5FC2BB] disabled:opacity-50">
                                <option value="new">new</option><option value="in_review">in_review</option><option value="resolved">resolved</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-2.5 text-[#A5BDBA]">{r.contact}</td>
                        </tr>
                      ))}
                      {filteredRequests.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-[#A5BDBA]">No requests match your filter.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}