"use client";

/**
 * A big bold number that counts up once when it comes into view (expo out, 1.6 s), e.g. 0 → 20.
 * Tabular figures so the width doesn't jump while it counts. Reduced motion: the final number.
 * Screen readers get the final text at once.
 */

import { useEffect, useRef } from "react";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { sceneProgress, scenePinned } from "@/lib/sceneProgress";
import { seg, easeOut } from "@/lib/scrollScene";

const DURATION = 1600;
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function CountUp({ to, suffix = "", className, scene }: { to: number; suffix?: string; className?: string; /** count with the India scene's scroll over this part of it (desktop, while it holds) */ scene?: readonly [number, number] }) {
  const num = useRef<HTMLSpanElement>(null);
  const motion = useMotionAllowed();

  useEffect(() => {
    const el = num.current;
    if (!el) return;
    if (!motion) {
      el.textContent = String(to);
      return;
    }
    el.textContent = "0";
    if (scene && scenePinned()) {
      return sceneProgress.on((p) => {
        el.textContent = String(Math.round(to * easeOut(seg(p, scene[0], scene[1]))));
      });
    }
    let raf = 0;
    const html = document.documentElement;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / DURATION);
        el.textContent = String(Math.round(to * expoOut(u)));
        if (u < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    // on screen under the intro: wait until the intro has opened onto the page
    const mo = new MutationObserver(() => {
      if (html.dataset.intro === "play") return;
      mo.disconnect();
      run();
    });
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (html.dataset.intro === "play") mo.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
        else run();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, motion, scene]);

  return (
    <span className={className}>
      <span className="sr-only">
        {to}
        {suffix}
      </span>
      <span aria-hidden>
        <span ref={num} className="tabular-nums">
          {to}
        </span>
        {suffix}
      </span>
    </span>
  );
}
