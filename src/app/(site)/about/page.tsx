import { Newsletter } from "@/components/site/Newsletter";

export const metadata = { title: "About Us | Help They Need Foundation" };

export default function AboutPage() {
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">About us</p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold sm:text-5xl">We exist so no one is left behind</h1>
            <p className="mt-5 text-lg text-mu">Hardship can arrive suddenly: an illness, a lost job, a journey away from home. Help They Need Foundation provides practical, respectful support and stays connected until people regain stability.</p>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div className="space-y-4 text-lg text-mu">
              <p>We work with local volunteers, schools, clinics and community leaders so help reaches people where they live. Our approach combines rapid response with long-term follow-up.</p>
              <p>From meals and medical transport for older neighbors to education support for students, safe-start assistance for refugees, and crisis relief for families, we focus on dignity and measurable impact.</p>
            </div>
            <div className="grid gap-5">
              {[
                ['Dignity first', 'People choose the help that suits them. We never decide for them.'],
                ['Open books', 'We publish where every donation goes and maintain transparent reporting.'],
                ['Lasting change', 'We aim for independence, not dependence, with follow-up after every case.'],
              ].map(([h, p]) => (
                <div key={h} className="rounded-2xl border border-ln bg-sf p-6 shadow-sm">
                  <div className="mb-3 h-1.5 w-14 rounded-full bg-sun" />
                  <h2 className="font-heading text-2xl font-bold">{h}</h2>
                  <p className="mt-2 text-mu">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}