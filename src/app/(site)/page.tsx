"use client";

import Image from "next/image";
import Link from "next/link";
import { useCounters } from "@/components/site/Counters";
import { Newsletter } from "@/components/site/Newsletter";
import { Icon } from "@/components/site/icons";

export default function HomePage() {
  useCounters();
  return (
    <>
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-[-6rem] h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute bottom-0 left-[-4rem] h-72 w-72 rounded-full bg-sun/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-ln bg-sf/80 px-4 py-1.5 text-sm font-semibold text-td shadow-sm backdrop-blur">Registered foundation • Community-first support</p>
            <h1 className="max-w-3xl font-heading text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-[4rem]">Dignity, safety and opportunity for people facing hard times.</h1>
            <p className="mt-6 max-w-xl text-lg text-mu sm:text-xl">Help They Need Foundation supports older people, students, refugees and families in crisis. We provide practical assistance, compassionate follow-up, and transparent impact — so help reaches people when and where it matters most.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/get-help" className="rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5 hover:shadow-lg">Request support</Link>
              <Link href="/donate" className="rounded-full border-2 border-teal px-7 py-3 font-semibold text-td transition hover:-translate-y-0.5 hover:bg-mist/40">Donate securely</Link>
              <Link href="/about" className="rounded-full px-7 py-3 font-semibold text-td underline-offset-4 hover:underline">Learn about us</Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-mu sm:grid-cols-3 sm:text-base">
              {[
                ["Transparent reporting", "Clear tracking and accountable use of funds."],
                ["Secure payments", "Donations via PayChangu with server-side verification."],
                ["Local partnerships", "Volunteers and partners embedded in communities."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-ln/70 bg-sf/70 p-3">
                  <div className="flex items-center gap-2 font-semibold text-ink"><span className="h-2.5 w-2.5 rounded-full bg-teal" />{t}</div>
                  <p className="mt-1 text-sm text-mu">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-ln bg-mist shadow-xl">
              <Image src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80" alt="Community members supporting each other" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/85 p-4 text-ink shadow-lg backdrop-blur dark:bg-[#132A29]/85 dark:text-[#EAF4F2]">
                <p className="font-heading text-lg font-bold">Real help, delivered with care</p>
                <p className="mt-1 text-sm opacity-90">From emergency relief to long-term support across four priority programs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ln bg-sf px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Our impact at a glance</h2>
              <p className="text-mu">Sample figures shown for design — replace with verified results.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [12400, "meals served", "Nutritious support for older neighbors"],
              [3200, "students supported", "Education resources and guidance"],
              [860, "families resettled", "Safe starts for displaced families"],
              [1500, "active volunteers", "People powering local outreach"],
            ].map(([n, label, sub]) => (
              <div key={label as string} className="rounded-2xl border border-ln/60 bg-bg p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                <strong data-count={n} className="block font-heading text-4xl font-extrabold text-teal">0</strong>
                <p className="mt-1 font-semibold text-ink">{label as string}</p>
                <p className="text-sm text-mu">{sub as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ln shadow-md">
            <Image src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80" alt="Volunteers organizing community support supplies" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Who we are</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">A trusted partner for people in vulnerable moments</h2>
            <p className="mt-4 text-lg text-mu">We combine rapid response with long-term follow-up. Our team and volunteers work alongside schools, clinics, and community leaders to remove barriers and restore stability with respect.</p>
            <ul className="mt-6 space-y-3 text-mu">
              {[
                "Person-centered support plans tailored to each situation",
                "Transparent donation tracking by program branch",
                "Collaboration with local partners for faster, safer outcomes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3"><span className="mt-2 h-2.5 w-2.5 rounded-full bg-sun" /><span>{item}</span></li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/about" className="rounded-full border-2 border-teal px-6 py-3 font-semibold text-td transition hover:-translate-y-0.5">About our mission</Link>
              <Link href="/how-we-help" className="rounded-full px-6 py-3 font-semibold text-td underline-offset-4 hover:underline">How we help</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sf px-4 py-20 sm:px-6 border-y border-ln">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Programs</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Focused support across four essential branches</h2>
            <p className="mt-4 text-lg text-mu">Every program is designed around practical needs and delivered with dignity. Donors can support a specific branch and track contributions in real time.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { href: "/programs", icon: "heart" as const, title: "Older people", desc: "Meals, wellness checks, transport, and companionship.", img: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=900&q=80" },
              { href: "/programs", icon: "book" as const, title: "Students", desc: "Fees, supplies, mentoring, and learning resources.", img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=900&q=80" },
              { href: "/programs", icon: "home" as const, title: "Refugees", desc: "Safe-start support, referrals, and integration help.", img: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=80" },
              { href: "/programs", icon: "people" as const, title: "Families", desc: "Crisis relief, essentials, and case follow-up.", img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80" },
            ].map((p) => (
              <Link key={p.title} href={p.href} className="group overflow-hidden rounded-2xl border border-ln bg-bg shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="relative h-44">
                  <Image src={p.img} alt={p.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                </div>
                <div className="p-5">
                  <div className="mb-3 inline-flex rounded-xl bg-mist p-2.5 text-td"><Icon name={p.icon} className="h-5 w-5" /></div>
                  <h3 className="font-heading text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-mu">{p.desc}</p>
                  <span className="mt-3 inline-flex font-semibold text-td">View programs →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Community voices</p>
              <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Stories that reflect dignity and progress</h2>
              <p className="mt-4 text-lg text-mu">Behind every number is a person and a path forward. These sample stories illustrate the kind of support and outcomes we work toward every day.</p>
              <Link href="/stories" className="mt-6 inline-flex rounded-full border-2 border-teal px-6 py-3 font-semibold text-td transition hover:-translate-y-0.5">Read more stories</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { quote: "“The weekly visits and meals helped my mother feel safe and seen again.”", name: "Grace’s family", tag: "Older people support", img: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80" },
                { quote: "“With support for fees and books, I stayed in school and finished my exams.”", name: "Thoko", tag: "Student program", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" },
              ].map((s) => (
                <article key={s.name} className="overflow-hidden rounded-2xl border border-ln bg-sf shadow-sm">
                  <div className="relative h-40">
                    <Image src={s.img} alt={s.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                  </div>
                  <div className="p-5">
                    <p className="font-medium text-ink">{s.quote}</p>
                    <p className="mt-3 text-sm font-semibold text-td">{s.name}</p>
                    <p className="text-sm text-mu">{s.tag}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[28px] bg-teal p-8 text-ot sm:p-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="max-w-xl font-heading text-3xl font-extrabold sm:text-4xl">Help someone take the next step forward</h2>
            <p className="mt-3 max-w-2xl text-lg opacity-90">Donate to a specific branch, request support, or partner with us to strengthen community care where it’s needed most.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/donate" className="rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5">Donate now</Link>
            <Link href="/get-help" className="rounded-full border-2 border-white/70 px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5">Get help</Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}