"use client";

/**
 * Heading that "reads itself" as you scroll: a short red highlight travels through the
 * letters in reading order. Unread letters are dimmed, read letters settle to the normal colour
 * (or stay red with settle="signal").
 * Screen readers get the plain text. Reduced motion: plain text, no effect.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { emphasis } from "@/content/emphasis";

gsap.registerPlugin(ScrollTrigger);

const WINDOW = 5; // letters lit red at once

export function ScrollRead({
  text,
  settle = "ink",
  className,
  auto = false,
  keep,
}: {
  text: string;
  settle?: "ink" | "signal";
  className?: string;
  /** Read once on load instead of with the scroll (for headlines already on screen at the top). */
  auto?: boolean;
  /** A phrase whose letters stay red once the highlight has passed. */
  keep?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motion = useMotionAllowed();

  useEffect(() => {
    const el = ref.current;
    if (!motion || !el) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>("[data-c]"));
    const n = chars.length;
    const states = new Array<number>(n).fill(-1);

    const paint = (progress: number) => {
      const front = progress * (n + WINDOW);
      for (let i = 0; i < n; i++) {
        const s = i < front - WINDOW ? 2 : i < front ? 1 : 0; // 0 unread, 1 reading, 2 read
        if (s !== states[i]) {
          states[i] = s;
          chars[i].dataset.s = String(s);
        }
      }
    };
    paint(0);

    if (auto) {
      const o = { p: 0 };
      const tw = gsap.to(o, { p: 1, duration: Math.max(1.2, n * 0.05), delay: 0.35, ease: "none", onUpdate: () => paint(o.p) });
      return () => {
        tw.kill();
      };
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      end: "bottom 50%",
      scrub: 0.4,
      onUpdate: (self) => paint(self.progress),
      onRefresh: (self) => paint(self.progress),
    });
    return () => st.kill();
  }, [motion, text, auto]);

  // Thick and thin: the emphasised phrase is heavy, the rest light (content/emphasis.ts)
  const strong = emphasis[text];
  const sAt = strong ? text.indexOf(strong) : -1;
  const words = text.split(" ");
  const starts = words.map((_, w) => words.slice(0, w).reduce((n, x) => n + x.length + 1, 0));
  const weight = (w: number) => (sAt < 0 ? undefined : starts[w] < sAt + strong!.length && starts[w] + words[w].length > sAt ? "font-bold" : "font-light");

  if (!motion)
    return (
      <span className={className}>
        {words.map((word, w) => (
          <span key={w} className={weight(w)}>
            {word}
            {w < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    );

  let idx = 0;
  const kAt = keep ? text.indexOf(keep) : -1;
  const kept = (at: number) => kAt >= 0 && at >= kAt && at < kAt + keep!.length;
  return (
    <span ref={ref} className={`scroll-read ${settle === "signal" ? "settle-signal" : ""} ${className ?? ""}`} aria-label={text} role="text">
      {words.map((word, w, all) => (
        <span key={w} aria-hidden className={`inline-block whitespace-nowrap ${weight(w) ?? ""}`}>
          {word.split("").map((ch, ci) => (
            <span key={idx} data-c={idx++} data-s="0" data-keep={kept(starts[w] + ci) ? "" : undefined}>
              {ch}
            </span>
          ))}
          {w < all.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
