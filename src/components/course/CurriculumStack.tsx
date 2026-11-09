"use client";

/**
 * Curriculum as a pile of cards: each part/section is a card that sticks a little lower than the
 * one before, so they stack up as you scroll. On the left a big counter climbs (05 / 21) as
 * modules pass the middle of the screen. Ink-outlined cards with a hard ink shadow, the same
 * comic-ink language as the home story. Reduced motion: no stacking, counter stays static.
 */

import { useEffect, useRef, useState } from "react";
import { AccordionItem } from "@/components/ui/Accordion";
import { Arrow } from "@/components/ui/Icons";
import { ScrollRead } from "@/components/motion/ScrollRead";
import type { Course } from "@/content/types";

const n2 = (i: number) => String(i).padStart(2, "0");

export function CurriculumStack({ course }: { course: Course }) {
  const c = course.curriculum;
  const total = c.groups.reduce((n, g) => n + g.modules.length, 0);
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(0);
  const [label, setLabel] = useState(c.groups[0]?.part ?? "");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-mod]"));
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = window.innerHeight * 0.55;
      let n = 0;
      let part = c.groups[0]?.part ?? "";
      rows.forEach((r) => {
        if (r.getBoundingClientRect().top < mid) {
          n = Math.max(n, Number(r.dataset.mod));
          part = r.dataset.part ?? part;
        }
      });
      setSeen(n);
      setLabel(part);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Sticky tops for the pile, on every screen size. A card taller than the screen scrolls until its
    // bottom is in view and only then sticks, so all its modules can be read before the next card
    // slides over it (phones: most cards are taller than the screen).
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".cur-card"));
    const place = () => {
      const vh = window.innerHeight;
      const base = window.innerWidth >= 1024 ? 96 : 76;
      cards.forEach((el, gi) => {
        const want = base + gi * 14;
        el.style.top = `${Math.min(want, vh - el.offsetHeight - 16)}px`;
      });
    };
    place();
    const ro = new ResizeObserver(place); // accordions opening change the card height
    cards.forEach((el) => ro.observe(el));
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", place);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [c.groups]);

  // running module position across groups (1-based), precomputed
  const firstIdx = c.groups.map((_, gi) => c.groups.slice(0, gi).reduce((n, g) => n + g.modules.length, 0));
  return (
    <section id="curriculum" className="on-paper section-pad">
      <div ref={ref} className="mx-auto grid max-w-(--container-page) gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] text-balance">
              <ScrollRead text={c.heading} />
            </h2>
            {/* the counter climbs as modules pass */}
            <div className="mt-10 hidden lg:block" aria-hidden>
              <p className="font-mono text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-[-0.04em] text-ink tabular-nums">
                {n2(seen)}
                <span className="text-mute-light"> / {n2(total)}</span>
              </p>
              <p className="eyebrow mt-4 text-signal">{label}</p>
              <div className="mt-5 h-[3px] w-full max-w-[18rem] bg-paper-line">
                <div className="h-full origin-left bg-signal transition-transform duration-450 ease-primary" style={{ transform: `scaleX(${seen / Math.max(1, total)})` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          {c.groups.map((g, gi) => {
            const top = 96 + gi * 14; // replaced on load by place()
            return (
              <article
                key={`${g.part}-${g.section ?? ""}`}
                className="cur-card relative mb-8 rounded-[14px] border-[2.5px] border-ink bg-white p-6 shadow-[7px_8px_0_0_var(--color-ink)] last:mb-0 sm:p-8 sticky motion-reduce:static"
                style={{ top }}
              >
                <div className="flex items-baseline justify-between gap-6 border-b-2 border-ink pb-3">
                  <p className="eyebrow text-ink">{g.part}</p>
                  <p className="font-mono text-small text-mute-light">{n2(gi + 1)}</p>
                </div>
                {g.section && <p className="mt-5 font-display text-[1.125rem] font-semibold text-signal-deep">{g.section}</p>}
                <div className={g.section ? "mt-1" : "mt-2"}>
                  {g.modules.map((m, mi) => {
                    const idx = firstIdx[gi] + mi + 1;
                    return (
                      <div key={m.number} data-mod={idx} data-part={g.part}>
                        <AccordionItem
                          head={
                            <span className="flex items-baseline gap-5">
                              <span className="w-10 shrink-0 font-mono text-small text-mute-light transition-colors group-hover:text-signal">M{n2(m.number)}</span>
                              <span className="font-display text-[1.25rem] font-semibold tracking-[-0.01em] transition-colors group-hover:text-signal-deep sm:text-h3">{m.title}</span>
                            </span>
                          }
                        >
                          <ul className="space-y-3 pl-[3.75rem]">
                            {m.points.map((p) => (
                              <li key={p} className="flex gap-3 text-mute-light">
                                <span className="mt-[0.2em] text-signal">
                                  <Arrow />
                                </span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionItem>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
          {/* room for the last card to settle on the pile */}
          <div className="h-[20vh] motion-reduce:hidden" aria-hidden />
        </div>
      </div>
    </section>
  );
}
