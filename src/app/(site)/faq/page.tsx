import { Newsletter } from "@/components/site/Newsletter";

export const metadata = { title: "FAQ | Help They Need Foundation" };

export default function FAQPage() {
  const faqs = [
    ['Who can ask for help?', 'Anyone facing hardship, including older people, students, refugees and families. You can also ask on behalf of someone else.'],
    ['Does it cost anything to get support?', 'No. Our services are free for the people we help.'],
    ['Is my information kept private?', 'Yes. We only share details with partners when you agree, and only to arrange your support.'],
    ['How is my donation used?', 'Most goes directly to programs. We publish an annual report showing every category of spending.'],
    ['Can I volunteer from home?', 'Yes. Phone calls, online tutoring and translation can all be done remotely.'],
    ['How are donations tracked?', 'Donations made through the site are processed securely online and tracked by program branch and status in our operations dashboard (subject to server-side verification).'],
  ];
  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">FAQ</p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold sm:text-5xl">Questions we often hear</h1>
            <p className="mt-5 text-lg text-mu">Answers about getting support, privacy, donations, and volunteering.</p>
          </div>
          <div className="max-w-3xl divide-y divide-ln rounded-3xl border border-ln bg-sf p-2 sm:p-4">
            {faqs.map(([q, a]) => (
              <details key={q} className="group px-4 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-bold marker:content-none">
                  <span>{q}</span>
                  <span className="text-2xl text-teal transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-mu">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}