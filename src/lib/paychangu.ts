import crypto from "crypto";

export type PayChanguVerifyResponse = {
  status: string;
  message?: string;
  data?: {
    tx_ref?: string;
    status?: string;
    currency?: string;
    amount?: number;
    [k: string]: unknown;
  };
};

export function getPayChanguSecret() {
  const key = process.env.PAYCHANGU_SECRET_KEY;
  if (!key) throw new Error("PAYCHANGU_SECRET_KEY is not configured");
  return key;
}

export async function verifyPayChanguTransaction(txRef: string): Promise<PayChanguVerifyResponse> {
  const secret = getPayChanguSecret();
  const res = await fetch(`https://api.paychangu.com/verify-payment/${encodeURIComponent(txRef)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${secret}`,
    },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as PayChanguVerifyResponse;
  if (!res.ok) throw new Error(json?.message || "Verification failed");
  return json;
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(signatureHeader, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}