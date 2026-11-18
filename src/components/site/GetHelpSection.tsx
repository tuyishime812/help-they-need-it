"use client";

import { FormEvent, useState } from "react";
import { Icon } from "./icons";

export function GetHelpSection() {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setMsg("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const category = String(data.get("who") || "General").trim();
    const message = String(data.get("msg") || "").trim();
    if (!name || !contact) {
      setError("Please provide your name and a phone number or email so we can reach you.");
      const target = form.querySelector<HTMLInputElement>(!name ? 'input[name="name"]' : 'input[name="contact"]');
      target?.focus();
      return;
    }
    try {
      const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, contact, category, message }) });
      if (!res.ok) throw new Error("failed");
      setMsg("Thank you. We have your request and will be in touch within two working days.");
      form.reset();
    } catch {
      setError("We could not submit your request right now. Please try again.");
    }
  }
  return (
    <section className="bg-mist px-4 py-20 sm:px-6">
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
        <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-3xl border border-ln bg-sf p-6 shadow-sm sm:p-8">
          <label className="grid gap-1 font-semibold">Your name<input name="name" autoComplete="name" required className="rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal" /></label>
          <label className="grid gap-1 font-semibold">Phone or email<input name="contact" autoComplete="email" required className="rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal" /></label>
          <label className="grid gap-1 font-semibold">I am contacting you about
            <select name="who" className="rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal">
              <option>An older person</option><option>A student</option><option>A refugee or displaced family</option><option>A family in need</option><option>Volunteering</option><option>Partnership</option>
            </select>
          </label>
          <label className="grid gap-1 font-semibold">How can we help?<textarea name="msg" rows={4} className="min-h-[110px] rounded-xl border-2 border-ln bg-bg px-4 py-3 font-normal" /></label>
          <button type="submit" className="justify-self-start rounded-full bg-teal px-7 py-3 font-semibold text-ot transition hover:-translate-y-0.5">Send request</button>
          {error && <p role="alert" className="rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
          {msg && <p role="status" className="rounded-xl border-l-4 border-teal bg-mist px-4 py-3">{msg}</p>}
        </form>
      </div>
    </section>
  );
}