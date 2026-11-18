"use client";

import { FormEvent, useState } from "react";

export function Newsletter() {
  const [msg, setMsg] = useState("");
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") || "").trim();
    if (!email) return;
    setMsg("Thank you for subscribing. We'll keep you updated with our annual report and impact news.");
    form.reset();
  }
  return (
    <section className="bg-deep px-4 py-10 text-[#EAF4F2] sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h3 className="font-heading text-2xl font-bold">Stay in touch</h3>
          <p className="text-[#A5BDBA]">Get our yearly report and news of the people your support helps.</p>
        </div>
        {msg ? (
          <p role="status" className="rounded-xl border-l-4 border-sun bg-[#173533] px-4 py-3">{msg}</p>
        ) : (
          <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" name="email" type="email" required placeholder="Your email" className="min-w-0 flex-1 rounded-xl border-2 border-[#25403E] bg-[#132A29] px-4 py-3 text-[#EAF4F2] placeholder:text-[#A5BDBA]" />
            <button type="submit" className="rounded-full bg-sun px-6 py-3 font-semibold text-sk transition hover:-translate-y-0.5">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}