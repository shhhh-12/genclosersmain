"use client";

/**
 * "At GenClosers" (owner 2026-11-19, second version). The statement first ("Sales is not a talent.
 * It's a system anyone can learn."), then the three ways to work together as big clicky tabs: Train ·
 * Consult · Done for you. The red knob springs to the tab you click and stretches on the way (its
 * leading edge moves first). Under the tabs the chosen way is split in two, side by side: what You do
 * and what GenClosers does ("You make the calls. We make you a closer."); the words roll up like a
 * counter when you switch, GenClosers a beat after You. GenClosers is always on it, no percentages.
 * It steps through the three by itself (a thin line in the knob fills up first) until someone clicks,
 * and holds while the pointer or keyboard focus is on it. Everything is stacked in one cell, so the
 * panel never changes size. Reduced motion: no autoplay, no movement.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow, WhatsApp } from "@/components/ui/Icons";
import { LogoMark } from "@/components/brand/LogoMark";
import { ScrollRead } from "@/components/motion/ScrollRead";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

type Item = { label: string; title: string; body: string; you: string; us: string; line: string; link: string; href: string; external: boolean };

const AUTO_S = 5; // seconds on each way while it plays by itself

/** One ink line drawing per way, in the order of the tabs (viewBox 48): Train = a target hit dead
 * centre (we make you a closer), Consult = three parts wired into one system, Done for you = sales
 * rising without you on the call. Stroke = currentColor. */
const ART = [
  <g key="train">
    <circle cx="22" cy="26" r="16" />
    <circle cx="22" cy="26" r="9" />
    <circle cx="22" cy="26" r="2.5" fill="currentColor" />
    <path d="M22 26L40 8" />
    <path d="M34 8h6v6" />
  </g>,
  <g key="consult">
    <rect x="5" y="7" width="13" height="10" rx="2.5" />
    <rect x="30" y="7" width="13" height="10" rx="2.5" />
    <rect x="17.5" y="31" width="13" height="10" rx="2.5" />
    <path d="M18 12h12" />
    <path d="M11.5 17v6.5H24V31M36.5 17v6.5H24" />
  </g>,
  <g key="done">
    <path d="M5 42h38" />
    <path d="M11 42V32M21 42V26M31 42V20M41 42V12" />
    <path d="M6 26l9-8 6 5 15-13" />
    <path d="M30 10h6v6" />
  </g>,
];
const Art = ({ i, className = "" }: { i: number; className?: string }) => (
  <svg viewBox="0 0 48 48" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {ART[i % ART.length]}
  </svg>
);

/** -1 before the active one, 0 the active one, 1 after it: the words roll up going forward */
const place = (i: number, active: number) => (i < active ? "-translate-y-[105%] opacity-0" : i > active ? "translate-y-[105%] opacity-0" : "translate-y-0 opacity-100");

export function ServicesCall({
  statement,
  keep,
  heading,
  ask,
  lanes,
  items,
}: {
  statement: string;
  keep: string;
  heading: string;
  ask: string;
  lanes: { you: string; us: string };
  items: Item[];
}) {
  const motion = useMotionAllowed();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [touched, setTouched] = useState(false);
  const [hold, setHold] = useState(false); // pointer over it or keyboard focus inside it
  const [visible, setVisible] = useState(false);
  const [round, setRound] = useState(0); // restarts the knob's line
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = items.length;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  const pick = (i: number, byHand = true) => {
    const to = (i + n) % n;
    if (byHand) setTouched(true);
    setDir(to >= active ? 1 : -1);
    setActive(to);
    setRound((r) => r + 1);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const to = e.key === "ArrowRight" ? active + 1 : e.key === "ArrowLeft" ? active - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (to === null) return;
    e.preventDefault();
    pick(to);
    tabs.current[(to + n) % n]?.focus();
  };

  const auto = motion && !touched;
  const it = items[active];
  const inset = "0.375rem";
  const slot = "col-start-1 row-start-1 transition-[translate,opacity] duration-[650ms] ease-kick motion-reduce:transition-none";

  return (
    <section
      ref={root}
      className="section-pad"
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      <div className="mx-auto max-w-(--container-page)">
        <h2 className="max-w-[17ch] font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
          <ScrollRead text={statement} keep={keep} />
        </h2>

        <div className="mt-16 border-t border-ink-line pt-12 lg:mt-24 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="min-w-0 lg:col-span-5">
              <h3 className="font-display text-h2 font-semibold tracking-[-0.03em]">{heading}</h3>
              <p className="mt-4 text-lead text-mute-dark">{ask}</p>
            </div>

            {/* the three ways: click, or arrow keys */}
            <div role="tablist" aria-label={heading} onKeyDown={onKey} className="relative grid grid-cols-3 rounded-pill border border-ink-line bg-ink-2 p-1.5 select-none lg:col-span-7">
              <span
                aria-hidden
                data-dir={dir}
                className="svc-knob absolute top-1.5 bottom-1.5 overflow-hidden rounded-pill bg-signal shadow-[0_12px_32px_-10px_rgb(227_16_27/0.8)]"
                style={{
                  left: `calc(${inset} + (100% - 2 * ${inset}) * ${active / n})`,
                  right: `calc(${inset} + (100% - 2 * ${inset}) * ${(n - 1 - active) / n})`,
                }}
              >
                {auto && (
                  <span
                    key={round}
                    className="svc-tick absolute inset-x-6 bottom-1.5 h-[2px] origin-left rounded-full bg-signal-ink/70"
                    style={{ animationDuration: `${AUTO_S}s`, animationPlayState: hold || !visible ? "paused" : "running" }}
                    onAnimationEnd={() => pick(active + 1, false)}
                  />
                )}
              </span>
              {items.map((x, i) => (
                <button
                  key={x.label}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`svc-tab-${i}`}
                  aria-selected={active === i}
                  aria-controls="svc-panel"
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => pick(i)}
                  className={`relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-pill px-1 py-4 font-display text-[length:max(0.875rem,calc(0.9rem*var(--type-scale)))] font-semibold whitespace-nowrap transition-[color,scale] duration-200 ease-primary active:scale-[0.93] sm:px-3 sm:text-[length:max(0.875rem,calc(1.2rem*var(--type-scale)))] ${active === i ? "text-signal-ink" : "text-mute-dark hover:text-paper"}`}
                >
                  <Art i={i} className={`hidden size-5 shrink-0 sm:block ${active === i ? "" : "opacity-70"}`} />
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          {/* the chosen way, split: what you do, what we do */}
          <div id="svc-panel" role="tabpanel" aria-labelledby={`svc-tab-${active}`} className="mt-6 overflow-hidden rounded-[1.75rem] border border-ink-line bg-ink-2">
            <p className="sr-only">{it.line}</p>
            <div aria-hidden className="grid lg:grid-cols-2">
              {[
                { name: lanes.you, roles: items.map((x) => x.you), red: false },
                { name: lanes.us, roles: items.map((x) => x.us), red: true },
              ].map((side, s) => (
                <div key={side.name} className={`p-7 sm:p-10 ${s ? "border-t border-ink-line bg-signal/[0.07] lg:border-t-0 lg:border-l" : ""}`}>
                  <div className={`flex items-center gap-2.5 font-display text-[length:max(0.875rem,calc(1.125rem*var(--type-scale)))] font-semibold ${side.red ? "text-signal" : "text-paper/70"}`}>
                    {side.red && <LogoMark className="h-[0.9em] w-auto" title="" />}
                    {side.name}
                  </div>
                  <div className="mt-5 grid overflow-hidden sm:mt-8">
                    {side.roles.map((r, i) => (
                      <p
                        key={i}
                        className={`${slot} font-display text-[length:max(0.875rem,calc(clamp(2rem,1.3rem+2.6vw,3.5rem)*var(--type-scale)))] leading-[1.1] font-semibold tracking-[-0.035em] ${side.red ? "text-signal" : "text-paper"} ${place(i, active)}`}
                        style={{ transitionDelay: s ? "70ms" : "0ms" }}
                      >
                        {r}.
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* the offer and its way in */}
            <div className="grid border-t border-ink-line">
              {items.map((x, i) => {
                const on = active === i;
                const cls = "group/link inline-flex items-center gap-2.5 rounded-pill bg-paper px-6 py-3 font-display text-[length:max(0.875rem,calc(1.0625rem*var(--type-scale)))] font-semibold text-ink transition-colors duration-450 hover:bg-signal hover:text-signal-ink";
                const inner = (
                  <>
                    {x.external && <WhatsApp className="h-4 w-4" />}
                    {x.link}
                    <span className="transition-transform duration-450 ease-primary group-hover/link:translate-x-1">
                      <Arrow />
                    </span>
                  </>
                );
                return (
                  <div
                    key={x.label}
                    inert={!on}
                    className={`col-start-1 row-start-1 flex flex-col gap-6 p-7 transition-[opacity,translate] ease-primary motion-reduce:transition-none sm:p-10 lg:flex-row lg:items-end lg:justify-between ${on ? "opacity-100 delay-150 duration-450" : "pointer-events-none translate-y-2 opacity-0 duration-150"}`}
                  >
                    <div className="flex min-w-0 items-start gap-5 sm:gap-6">
                      {/* the way's drawing: pops in with its tab */}
                      <span
                        aria-hidden
                        className={`grid size-16 shrink-0 place-items-center rounded-2xl border border-signal/30 bg-signal/10 text-signal transition-[scale,rotate] duration-[650ms] ease-kick motion-reduce:transition-none sm:size-20 ${on ? "scale-100 rotate-0" : "scale-75 -rotate-12"}`}
                      >
                        <Art i={i} className="size-9 sm:size-11" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-display text-h3 font-semibold tracking-[-0.02em]">{x.title}</h4>
                        <p className="mt-2 max-w-[52ch] text-mute-dark">{x.body}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {x.external ? (
                        <a href={x.href} target="_blank" rel="noopener noreferrer" className={cls}>
                          {inner}
                        </a>
                      ) : (
                        <Link href={x.href} className={cls}>
                          {inner}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
