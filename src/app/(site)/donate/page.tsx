import { DonateSection } from "@/components/site/DonateSection";
import { Newsletter } from "@/components/site/Newsletter";

export const metadata = { title: "Donate | Help They Need Foundation" };

export default function DonatePage() {
  return (
    <>
      <section className="px-4 pt-16 sm:px-6 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Donate</p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-extrabold sm:text-5xl">Support a branch. Track impact in real time.</h1>
          <p className="mt-5 max-w-2xl text-lg text-mu">Choose Older people, Students, Refugees, or Families and complete your donation securely through PayChangu inline payment.</p>
        </div>
      </section>
      <DonateSection />
      <Newsletter />
    </>
  );
}