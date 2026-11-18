import Link from "next/link";
import { Newsletter } from "@/components/site/Newsletter";
import { Icon } from "@/components/site/icons";

export const metadata = { title: "Programs | Help They Need Foundation" };

export default function ProgramsPage() {
  const programs = [
    { icon: 'heart' as const, title: 'Older people', desc: 'Support for older neighbors who live alone or struggle day to day.', items: ['Hot meals and weekly visits', 'Rides to clinics', 'Help with pensions and paperwork'] },
    { icon: 'book' as const, title: 'Students', desc: 'Help so talented students can stay in education.', items: ['Fees, books and uniforms', 'Mentors and study spaces', 'Scholarship guidance'] },
    { icon: 'home' as const, title: 'Refugees', desc: 'A safe start for families who have fled conflict or hardship.', items: ['Shelter and food parcels', 'Legal and medical referrals', 'Language and job training'] },
    { icon: 'people' as const, title: 'Families in need', desc: 'Short-term help when a crisis hits a household.', items: ['Rent, utilities and groceries', 'Child and school support', 'A caseworker who stays in touch'] },
  ];
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Programs</p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold sm:text-5xl">Four programs, shaped by real needs</h1>
            <p className="mt-5 text-lg text-mu">Each program is designed with community input and focused on practical outcomes, dignity, and follow-through.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {programs.map((p) => (
              <article key={p.title} className="flex flex-col gap-4 rounded-[22px] border border-ln bg-sf p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="grid h-14 w-14 place-items-center rounded-[14px] bg-mist text-td"><Icon name={p.icon} className="h-7 w-7" /></div>
                <h2 className="font-heading text-2xl font-bold">{p.title}</h2>
                <p className="text-mu">{p.desc}</p>
                <ul className="flex-1 list-disc space-y-1 pl-5 text-mu">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <Link href="/get-help" className="font-semibold text-td underline-offset-2 hover:underline">Request support</Link>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-3xl bg-teal p-8 text-ot sm:p-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-heading text-2xl font-bold">Support a specific branch</h2><p className="mt-1 opacity-90">Choose Older people, Students, Refugees, or Families when you donate.</p></div>
            <Link href="/donate" className="rounded-full bg-sun px-7 py-3 font-semibold text-sk transition hover:-translate-y-0.5">Donate by branch</Link>
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}