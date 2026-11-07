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

gsap.registerPlugin(ScrollTrigger);

const WINDOW = 5; // letters lit red at once

export function ScrollRead({ text, settle = "ink", className }: { text: string; settle?: "ink" | "signal"; className?: string }) {
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

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      end: "bottom 50%",
      scrub: 0.4,
      onUpdate: (self) => paint(self.progress),
      onRefresh: (self) => paint(self.progress),
    });
    return () => st.kill();
  }, [motion, text]);

  if (!motion) return <span className={className}>{text}</span>;

  let idx = 0;
  return (
    <span ref={ref} className={`scroll-read ${settle === "signal" ? "settle-signal" : ""} ${className ?? ""}`} aria-label={text} role="text">
      {text.split(" ").map((word, w, all) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {word.split("").map((ch) => (
            <span key={idx} data-c={idx++} data-s="0">
              {ch}
            </span>
          ))}
          {w < all.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
