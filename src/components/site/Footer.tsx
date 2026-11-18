import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#25403E] bg-deep px-4 py-10 text-[#A5BDBA] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-extrabold text-[#EAF4F2]">
              <span className="relative inline-block h-8 w-8 rounded-[50%_50%_50%_8px] bg-teal"><span className="absolute inset-[0.55rem] rounded-full bg-sun" /></span>
              Help They Need
            </Link>
            <p className="mt-3 max-w-sm">A registered foundation supporting people who need it most, with dignity and respect.</p>
          </div>
          <div><h3 className="mb-3 font-heading text-lg font-bold text-[#EAF4F2]">Our work</h3><ul className="space-y-2"><li><Link href="/programs" className="hover:text-white">Programs</Link></li><li><Link href="/how-we-help" className="hover:text-white">How we help</Link></li><li><Link href="/stories" className="hover:text-white">Stories</Link></li></ul></div>
          <div><h3 className="mb-3 font-heading text-lg font-bold text-[#EAF4F2]">Get involved</h3><ul className="space-y-2"><li><Link href="/donate" className="hover:text-white">Donate</Link></li><li><Link href="/get-help" className="hover:text-white">Volunteer</Link></li><li><Link href="/get-help" className="hover:text-white">Partner with us</Link></li><li><Link href="/admin" className="hover:text-white">Admin dashboard</Link></li></ul></div>
          <div><h3 className="mb-3 font-heading text-lg font-bold text-[#EAF4F2]">About</h3><ul className="space-y-2"><li><Link href="/about" className="hover:text-white">Our mission</Link></li><li><Link href="/faq" className="hover:text-white">FAQ</Link></li><li><Link href="/get-help" className="hover:text-white">Contact</Link></li></ul></div>
        </div>
        <p className="mt-8 border-t border-[#25403E] pt-5 text-sm">© 2026 Help They Need Foundation. All rights reserved. Registered charity no. 000000.</p>
      </div>
    </footer>
  );
}