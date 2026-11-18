import { GetHelpSection } from "@/components/site/GetHelpSection";
import { Newsletter } from "@/components/site/Newsletter";

export const metadata = { title: "Get Help | Help They Need Foundation" };

export default function GetHelpPage() {
  return (
    <>
      <section className="px-4 pt-16 sm:px-6 lg:pt-20">
        <div className="mx-auto max-w-6xl max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Get help</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold sm:text-5xl">Reach out for support, volunteering, or partnership</h1>
          <p className="mt-5 text-lg text-mu">Tell us what you need and our team will respond within two working days.</p>
        </div>
      </section>
      <GetHelpSection />
      <Newsletter />
    </>
  );
}