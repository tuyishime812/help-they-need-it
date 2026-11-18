import Link from "next/link";
import { Newsletter } from "@/components/site/Newsletter";

export const metadata = { title: "How We Help | Help They Need Foundation" };

export default function HowWeHelpPage() {
  const steps = [
    ['Reach out', 'Send a request online or through a local partner. It takes a few minutes.'],
    ['We listen', 'A caseworker contacts you within two working days to understand your situation.'],
    ['Get support', 'Together we agree a plan and arrange food, school costs, shelter or referrals.'],
    ['Stay connected', 'We follow up until you are stable, and keep the door open afterwards.'],
  ];
  return (
    <>
      <section className="bg-deep px-4 py-16 text-[#EAF4F2] sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8DD8D2]">How we help</p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold sm:text-5xl">A simple process, with a real person at every step</h1>
            <p className="mt-5 text-lg text-[#A5BDBA]">Our process is designed to be respectful, fast, and transparent so people can get the right support without unnecessary barriers.</p>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s[0]} className="rounded-2xl border border-[#25403E] bg-[#132A29]/70 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#5FC2BB]/40">
                <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-sun font-heading font-extrabold text-sk">{i + 1}</span>
                <h2 className="mb-2 font-heading text-xl font-bold">{s[0]}</h2>
                <p className="text-[#A5BDBA]">{s[1]}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/get-help" className="rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5">Request support</Link>
            <Link href="/donate" className="rounded-full border-2 border-[#8DD8D2] px-7 py-3 font-semibold text-[#EAF4F2] transition hover:-translate-y-0.5">Support this work</Link>
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}