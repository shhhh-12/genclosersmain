"use client";

/**
 * Closing band before the footer (owner 2026-11-19): the intro's flat spoke wheel (lib/wheel.ts)
 * turning through the steps of a sale, landing on red "Sales" and going round again. It plays only
 * while it is on screen; reduced motion = still on "Sales". Decorative (the words are the steps of
 * a sale, already on the course page), so it is hidden from screen readers.
 */

import { useEffect, useRef } from "react";
import { WheelScene } from "@/components/wheel/WheelScene";
import { WHEEL, beatState, renderWheel, centreOnCaps } from "@/lib/wheel";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

export function WheelBand({ words }: { words: readonly string[] }) {
  const scene = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);
  const motion = useMotionAllowed();

  useEffect(() => {
    const root = scene.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".wheel-word"));
    const n = els.length;
    const sales = Math.max(0, words.indexOf("Sales"));
    const align = () => {
      const anchor = root.querySelector<HTMLElement>(".wheel-anchor");
      if (anchor && els[0]) centreOnCaps(anchor, els[0]);
    };
    align();
    document.fonts?.ready.then(align).catch(() => {});
    window.addEventListener("resize", align);
    renderWheel(els, sales, n);
    if (!motion) return () => window.removeEventListener("resize", align);

    // starts on "Sales"; one beat = move + hold (lib/wheel.ts), so the full turn returns to "Sales"
    let f = 0;
    let raf = 0;
    let last = 0;
    const inner = arrow.current?.firstElementChild as HTMLElement | null;
    const frame = (now: number) => {
      f += (Math.min(48, now - last || 16) / 1000) * WHEEL.fps;
      last = now;
      const b = beatState(f, sales, WHEEL.sketchBeatFrames);
      renderWheel(els, b.pos, n, { kick: b.wordKick, kickIndex: b.arriving });
      if (inner) inner.style.transform = `translateX(${b.arrowKick}em)`;
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", align);
    };
  }, [motion, words]);

  return (
    <section aria-hidden className="wheel-size relative h-[62svh] min-h-[22rem] overflow-hidden bg-black leading-none">
      <WheelScene words={words} sceneRef={scene} arrowRef={arrow} fade />
    </section>
  );
}
