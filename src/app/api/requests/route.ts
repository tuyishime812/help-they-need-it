import { NextResponse } from "next/server";
import { createRequest, emit, listRequests, updateRequestStatus } from "@/lib/store";

export async function GET() {
  try {
    const requests = await listRequests(200);
    return NextResponse.json({ requests });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to load requests" }, { status: 500 });
  }
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
    const item = await createRequest({ name, contact, category, message });
    emit({ type: "request" });
    return NextResponse.json({ ok: true, request: item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid request" }, { status: 400 });
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
    const updated = await updateRequestStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    emit({ type: "request_update" });
    return NextResponse.json({ ok: true, request: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid request" }, { status: 400 });
  }
}