export type Branch = "Older people" | "Students" | "Refugees" | "Families";

export type Donation = {
  id: string;
  amount: number;
  currency: "MWK" | "USD";
  frequency: "once" | "monthly";
  branch: Branch;
  donorName: string;
  email?: string;
  txRef?: string;
  paymentStatus: "pending" | "successful" | "failed";
  createdAt: string;
  updatedAt: string;
};

export type SupportRequest = {
  id: string;
  name: string;
  contact: string;
  category: string;
  message: string;
  createdAt: string;
  status: "new" | "in_review" | "resolved";
};

type Store = {
  donations: Donation[];
  requests: SupportRequest[];
  listeners: Set<(event: { type: string }) => void>;
};

const g = globalThis as unknown as { __HTN_STORE__?: Store };

function seed(): Store {
  const now = Date.now();
  const mk = (mins: number) => new Date(now - mins * 60_000).toISOString();
  return {
    donations: [
      { id: "d1", amount: 50, currency: "USD", frequency: "monthly", branch: "Students", donorName: "A. Khan", createdAt: mk(320), updatedAt: mk(320), paymentStatus: "successful" },
      { id: "d2", amount: 25, currency: "USD", frequency: "once", branch: "Older people", donorName: "L. Chen", createdAt: mk(240), updatedAt: mk(240), paymentStatus: "successful" },
      { id: "d3", amount: 100, currency: "USD", frequency: "monthly", branch: "Refugees", donorName: "M. Silva", createdAt: mk(180), updatedAt: mk(180), paymentStatus: "successful" },
      { id: "d4", amount: 40, currency: "USD", frequency: "once", branch: "Families", donorName: "J. Patel", createdAt: mk(120), updatedAt: mk(120), paymentStatus: "successful" },
      { id: "d5", amount: 75, currency: "USD", frequency: "monthly", branch: "Students", donorName: "S. Ali", createdAt: mk(75), updatedAt: mk(75), paymentStatus: "successful" },
      { id: "d6", amount: 30, currency: "USD", frequency: "once", branch: "Refugees", donorName: "R. Gomez", createdAt: mk(30), updatedAt: mk(30), paymentStatus: "successful" },
    ],
    requests: [
      { id: "r1", name: "Grace M.", contact: "grace@example.org", category: "An older person", message: "Needs weekly check-ins and meal support.", createdAt: mk(200), status: "in_review" },
      { id: "r2", name: "Thoko N.", contact: "+000111222", category: "A student", message: "Seeking help with exam fees and books.", createdAt: mk(90), status: "new" },
      { id: "r3", name: "Amina K.", contact: "amina@example.org", category: "A refugee or displaced family", message: "Family needs temporary shelter referral.", createdAt: mk(40), status: "new" },
    ],
    listeners: new Set(),
  };
}

export function getStore(): Store {
  if (!g.__HTN_STORE__) g.__HTN_STORE__ = seed();
  if (!g.__HTN_STORE__.listeners) g.__HTN_STORE__.listeners = new Set();
  return g.__HTN_STORE__;
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function subscribe(listener: (event: { type: string }) => void) {
  const store = getStore();
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

export function emit(event: { type: string }) {
  const store = getStore();
  for (const l of store.listeners) {
    try { l(event); } catch {}
  }
}

export function computeStats(store: Store) {
  const zero = { MWK: 0, USD: 0 };
  const byBranch: Record<Branch, { MWK: number; USD: number }> = {
    "Older people": { ...zero },
    "Students": { ...zero },
    "Refugees": { ...zero },
    "Families": { ...zero },
  };
  const totals = { MWK: 0, USD: 0 };
  const monthlyRecurring = { MWK: 0, USD: 0 };
  let successfulCount = 0;
  let pendingCount = 0;
  for (const d of store.donations) {
    if (d.paymentStatus === "pending") pendingCount += 1;
    if (d.paymentStatus !== "successful") continue;
    successfulCount += 1;
    totals[d.currency] += d.amount;
    byBranch[d.branch][d.currency] += d.amount;
    if (d.frequency === "monthly") monthlyRecurring[d.currency] += d.amount;
  }
  const recent = [...store.donations].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 10);
  const recentRequests = [...store.requests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);
  return {
    totalDonations: successfulCount,
    pendingCount,
    totals,
    monthlyRecurring,
    byBranch,
    openRequests: store.requests.filter((r) => r.status !== "resolved").length,
    recentDonations: recent,
    recentRequests,
  };
}

export function upsertDonationByTxRef(txRef: string, patch: Partial<Donation>) {
  const store = getStore();
  const d = store.donations.find((x) => x.txRef === txRef);
  if (!d) return null;
  Object.assign(d, patch, { updatedAt: new Date().toISOString() });
  return d;
}

export function updateRequestStatus(id: string, status: SupportRequest["status"]) {
  const store = getStore();
  const r = store.requests.find((x) => x.id === id);
  if (!r) return null;
  r.status = status;
  return r;
}