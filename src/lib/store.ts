import { getSupabaseAdmin } from "./supabase";

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

type DbDonation = {
  id: string;
  amount: number | string;
  currency: "MWK" | "USD";
  frequency: "once" | "monthly";
  branch: Branch;
  donor_name: string;
  email: string | null;
  tx_ref: string | null;
  payment_status: "pending" | "successful" | "failed";
  created_at: string;
  updated_at: string;
};
type DbRequest = {
  id: string;
  name: string;
  contact: string;
  category: string;
  message: string;
  status: "new" | "in_review" | "resolved";
  created_at: string;
};

function mapDonation(d: DbDonation): Donation {
  return {
    id: d.id,
    amount: Number(d.amount),
    currency: d.currency,
    frequency: d.frequency,
    branch: d.branch,
    donorName: d.donor_name,
    email: d.email || undefined,
    txRef: d.tx_ref || undefined,
    paymentStatus: d.payment_status,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}
function mapRequest(r: DbRequest): SupportRequest {
  return {
    id: r.id,
    name: r.name,
    contact: r.contact,
    category: r.category,
    message: r.message || "",
    createdAt: r.created_at,
    status: r.status,
  };
}

// Simple in-process pub/sub for live SSE updates in the current server instance
const g = globalThis as unknown as { __HTN_LISTENERS__?: Set<(event: { type: string }) => void> };
function getListeners() {
  if (!g.__HTN_LISTENERS__) g.__HTN_LISTENERS__ = new Set();
  return g.__HTN_LISTENERS__;
}
export function subscribe(listener: (event: { type: string }) => void) {
  const listeners = getListeners();
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function emit(event: { type: string }) {
  for (const l of getListeners()) {
    try { l(event); } catch {}
  }
}

export function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listDonations(limit = 100): Promise<Donation[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("donations").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data as DbDonation[]).map(mapDonation);
}

export async function listRequests(limit = 100): Promise<SupportRequest[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("requests").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data as DbRequest[]).map(mapRequest);
}

export async function createDonation(input: {
  id?: string;
  amount: number;
  currency: "MWK" | "USD";
  frequency: "once" | "monthly";
  branch: Branch;
  donorName: string;
  email?: string;
  txRef?: string;
  paymentStatus: "pending" | "successful" | "failed";
}): Promise<Donation> {
  const sb = getSupabaseAdmin();
  const row = {
    id: input.id || uid("d"),
    amount: input.amount,
    currency: input.currency,
    frequency: input.frequency,
    branch: input.branch,
    donor_name: input.donorName,
    email: input.email || null,
    tx_ref: input.txRef || null,
    payment_status: input.paymentStatus,
  };
  const { data, error } = await sb.from("donations").insert(row).select("*").single();
  if (error) throw error;
  return mapDonation(data as DbDonation);
}

export async function upsertDonationByTxRef(txRef: string, patch: Partial<Pick<Donation, "paymentStatus" | "amount" | "currency" | "frequency" | "branch" | "donorName" | "email">>) {
  const sb = getSupabaseAdmin();
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (patch.paymentStatus) update.payment_status = patch.paymentStatus;
  if (patch.amount !== undefined) update.amount = patch.amount;
  if (patch.currency) update.currency = patch.currency;
  if (patch.frequency) update.frequency = patch.frequency;
  if (patch.branch) update.branch = patch.branch;
  if (patch.donorName) update.donor_name = patch.donorName;
  if (patch.email !== undefined) update.email = patch.email || null;
  const { data, error } = await sb.from("donations").update(update).eq("tx_ref", txRef).select("*").maybeSingle();
  if (error) throw error;
  return data ? mapDonation(data as DbDonation) : null;
}

export async function createRequest(input: { name: string; contact: string; category: string; message: string }): Promise<SupportRequest> {
  const sb = getSupabaseAdmin();
  const row = {
    id: uid("r"),
    name: input.name,
    contact: input.contact,
    category: input.category,
    message: input.message || "",
    status: "new" as const,
  };
  const { data, error } = await sb.from("requests").insert(row).select("*").single();
  if (error) throw error;
  return mapRequest(data as DbRequest);
}

export async function updateRequestStatus(id: string, status: SupportRequest["status"]) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("requests").update({ status }).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data ? mapRequest(data as DbRequest) : null;
}

export async function computeStats() {
  const [donations, requests] = await Promise.all([listDonations(200), listRequests(100)]);
  const byBranch: Record<Branch, { MWK: number; USD: number }> = {
    "Older people": { MWK: 0, USD: 0 },
    "Students": { MWK: 0, USD: 0 },
    "Refugees": { MWK: 0, USD: 0 },
    "Families": { MWK: 0, USD: 0 },
  };
  const totals = { MWK: 0, USD: 0 };
  const monthlyRecurring = { MWK: 0, USD: 0 };
  let successfulCount = 0;
  let pendingCount = 0;
  for (const d of donations) {
    if (d.paymentStatus === "pending") pendingCount += 1;
    if (d.paymentStatus !== "successful") continue;
    successfulCount += 1;
    totals[d.currency] += d.amount;
    byBranch[d.branch][d.currency] += d.amount;
    if (d.frequency === "monthly") monthlyRecurring[d.currency] += d.amount;
  }
  const recent = donations.slice(0, 10);
  const recentRequests = requests.slice(0, 8);
  return {
    totalDonations: successfulCount,
    pendingCount,
    totals,
    monthlyRecurring,
    byBranch,
    openRequests: requests.filter((r) => r.status !== "resolved").length,
    recentDonations: recent,
    recentRequests,
  };
}