"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/how-we-help", label: "How we help" },
  { href: "/stories", label: "Stories" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-ln/80 bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-extrabold text-ink" onClick={close}>
          <span className="relative inline-block h-8 w-8 rounded-[50%_50%_50%_8px] bg-teal">
            <span className="absolute inset-[0.55rem] rounded-full bg-sun" />
          </span>
          <span className="leading-none">Help They Need</span>
        </Link>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button type="button" className="inline-flex items-center justify-center rounded-xl border-2 border-ln p-2 text-ink" aria-expanded={open} aria-controls="site-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
        <nav id="site-nav" aria-label="Main" className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col items-start gap-2 border-b border-ln bg-bg px-4 pb-5 pt-3 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={close} className={`rounded-full px-3 py-1.5 font-medium transition ${active ? "bg-mist text-td" : "text-mu hover:text-ink"}`}>{item.label}</Link>
            );
          })}
          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row lg:mt-0 lg:w-auto lg:items-center">
            <Link href="/get-help" onClick={close} className="rounded-full border-2 border-teal px-5 py-2.5 text-center font-semibold text-td transition hover:-translate-y-0.5">Get help</Link>
            <Link href="/donate" onClick={close} className="rounded-full bg-sun px-5 py-2.5 text-center font-semibold text-sk transition hover:-translate-y-0.5">Donate</Link>
            <div className="hidden lg:block"><ThemeToggle /></div>
          </div>
        </nav>
      </div>
    </header>
  );
}