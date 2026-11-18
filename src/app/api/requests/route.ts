import { NextResponse } from "next/server";
import { emit, getStore, uid, updateRequestStatus } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const requests = [...store.requests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim().slice(0, 120);
    const contact = String(body?.contact || "").trim().slice(0, 120);
    const category = String(body?.category || "General").trim().slice(0, 120);
    const message = String(body?.message || "").trim().slice(0, 2000);
    if (!name || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const item = { id: uid("r"), name, contact, category, message, createdAt: new Date().toISOString(), status: "new" as const };
    getStore().requests.push(item);
    emit({ type: "request" });
    return NextResponse.json({ ok: true, request: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = String(body?.id || "");
    const status = body?.status;
    if (!id || !["new", "in_review", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const updated = updateRequestStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    emit({ type: "request_update" });
    return NextResponse.json({ ok: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}