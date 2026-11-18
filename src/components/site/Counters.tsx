"use client";

import { useEffect } from "react";

export function useCounters() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    if (!els.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const n = Number(el.dataset.count || "0");
          if (reduce) { el.textContent = `${n.toLocaleString("en-US")}+`; return; }
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min((t - t0) / 1200, 1);
            const val = Math.round(n * (1 - Math.pow(1 - p, 3)));
            el.textContent = `${val.toLocaleString("en-US")}${p < 1 ? "" : "+"}`;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}