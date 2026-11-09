"use client";

/**
 * The three beliefs, "strike and correct": each title is split at its comma. The first part is
 * the belief (heavy); the second part is the old idea it replaces, which gets a red line struck
 * through it as the row reaches the middle of the screen (and unstruck if you scroll back up).
 * Uses only the existing copy (content/home.ts beliefs).
 */

import { useEffect, useRef } from "react";
import type { Card } from "@/content/types";

export function BeliefStrike({ items }: { items: readonly Card[] }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const rows = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-belief]") ?? []);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("is-struck", e.isIntersecting || e.boundingClientRect.top < 0)),
      { rootMargin: "0px 0px -45% 0px", threshold: 0 }
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={ref} className="border-t border-ink">
      {items.map((b, i) => {
        const cut = b.title.indexOf(", ");
        const keep = cut < 0 ? b.title : b.title.slice(0, cut + 1);
        const old = cut < 0 ? "" : b.title.slice(cut + 2);
        return (
          <li key={b.title} data-belief className="group relative grid gap-3 border-b border-paper-line py-8 transition-colors duration-450 hover:bg-paper-2 md:grid-cols-12 md:items-baseline md:py-10">
            <span className="font-mono text-small text-signal md:col-span-1">0{i + 1}</span>
            <h2 className="font-display text-h2 tracking-[-0.03em] md:col-span-6">
              <span className="font-bold">{keep}</span>{" "}
              {old && (
                <span className="belief-old relative inline-block font-light text-mute-light">
                  {old}
                  <span aria-hidden className="belief-strike absolute top-[55%] -right-1 -left-1 h-[0.09em] origin-left bg-signal" />
                </span>
              )}
            </h2>
            <p className="max-w-[34ch] text-lead text-mute-light md:col-span-4 md:col-start-9">{b.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
