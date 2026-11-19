"use client";

/**
 * A photo that develops like a polaroid when it scrolls into view (About page, owner 2026-11-19):
 * it starts pale and soft, then the contrast comes up over about 1.6 s (CSS `.develop`). Once only.
 * Reduced motion: shown developed straight away.
 */

import { useEffect, useRef, type ReactNode } from "react";

export function Develop({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.developed = "";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.developed = "";
        io.disconnect();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`develop ${className}`}>
      {children}
    </div>
  );
}
