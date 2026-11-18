import { Newsletter } from "@/components/site/Newsletter";

export const metadata = { title: "Stories | Help They Need Foundation" };

export default function StoriesPage() {
  const stories = [
    { q: '“The weekly visit is the best part of my week. Someone knows my name and asks how I am.”', a: 'G', who: 'Grace, 74', prog: 'Home visit program' },
    { q: '“Paying my exam fees meant I could finish school. Now I am studying nursing.”', a: 'T', who: 'Thoko, 19', prog: 'Student support' },
    { q: '“We arrived with nothing. They found us a home, a doctor and a teacher for the children.”', a: 'A', who: 'Amina, mother of three', prog: 'Refugee program' },
  ];
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Stories</p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold sm:text-5xl">Stories from our community</h1>
            <p className="mt-5 text-lg text-mu">Sample stories shown as placeholders. Replace with real, consented testimonials and impact narratives.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {stories.map((t) => (
              <blockquote key={t.who} className="flex flex-col justify-between gap-6 rounded-[22px] border border-ln bg-sf p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <p className="font-heading text-lg font-medium leading-snug">{t.q}</p>
                <footer className="flex items-center gap-3 text-mu">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-teal font-heading text-lg font-bold text-ot">{t.a}</span>
                  <span>{t.who}<br />{t.prog}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}