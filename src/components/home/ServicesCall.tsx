"use client";

/**
 * "At GenClosers" as a live call you can tune (owner 2026-11-19). A three-stop switch, Train ·
 * Consult · Done for you: click a stop, use the arrow keys, or drag the red knob. Each stop says who
 * does what on the call ("You make the calls. We make you a closer."), the two voice lanes (You and
 * GenClosers) morph between the stops while you drag, and the offer's words and button swap with it.
 * No percentages (the owner felt they made the offers look smaller). It steps through the three by
 * itself until someone touches it, and holds still while the pointer or keyboard focus is on it, so it
 * never switches under someone who is reading. Reduced motion: no autoplay, still bars.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow, WhatsApp } from "@/components/ui/Icons";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

type Item = { label: string; title: string; body: string; you: string; us: string; line: string; link: string; href: string; external: boolean };

const BARS = 48;
// how much each voice is heard at each stop (Train, Consult, Done for you); GenClosers is always on the call
const YOU = [1, 0.75, 0.28];
const US = [0.6, 0.85, 1];
const AUTO_MS = 4200;
const at = (vals: number[], t: number) => {
  const i = Math.min(vals.length - 2, Math.floor(t));
  const f = t - i;
  return vals[i] + (vals[i + 1] - vals[i]) * f;
};
// fixed pseudo-random bar shapes (same on server and client)
const SHAPE = Array.from({ length: BARS }, (_, i) => {
  const r = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  const u = r - Math.floor(r);
  return { h: 0.28 + 0.72 * Math.abs(Math.sin(i * 0.55 + u * 2)), d: (u * 1.2).toFixed(2), s: (0.85 + u * 0.6).toFixed(2) };
});

export function ServicesCall({ heading, ask, lanes, live, items }: { heading: string; ask: string; lanes: { you: string; us: string }; live: string; items: Item[] }) {
  const motion = useMotionAllowed();
  const [t, setT] = useState(0); // 0..2, continuous while dragging
  const target = useRef(0);
  const cur = useRef(0);
  const raf = useRef(0);
  const touched = useRef(false);
  const dragging = useRef(false);
  const paused = useRef(false); // pointer over it, or keyboard focus inside it
  const track = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const n = items.length;
  const active = Math.round(t);

  // ease t toward its target (frame-rate independent)
  const go = (to: number, instant = false) => {
    target.current = Math.max(0, Math.min(n - 1, to));
    cancelAnimationFrame(raf.current);
    if (instant || !motion) {
      cur.current = target.current;
      setT(cur.current);
      return;
    }
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      cur.current += (target.current - cur.current) * (1 - Math.exp(-dt / 90));
      if (Math.abs(target.current - cur.current) < 0.002) cur.current = target.current;
      setT(cur.current);
      if (cur.current !== target.current) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  // it steps through the three by itself while on screen, until someone touches it
  useEffect(() => {
    if (!motion) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
    if (root.current) io.observe(root.current);
    const id = window.setInterval(() => {
      if (touched.current || !visible || dragging.current || paused.current) return;
      go((Math.round(target.current) + 1) % n);
    }, AUTO_MS);
    return () => {
      io.disconnect();
      window.clearInterval(id);
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion, n]);

  const fromPointer = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r) return 0;
    return ((clientX - r.left) / r.width) * n - 0.5;
  };
  const onDown = (e: React.PointerEvent) => {
    touched.current = true;
    dragging.current = true;
    track.current?.setPointerCapture(e.pointerId);
    go(fromPointer(e.clientX), true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) go(fromPointer(e.clientX), true);
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    go(Math.round(cur.current));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    touched.current = true;
    go(Math.round(target.current) + (e.key === "ArrowRight" ? 1 : -1));
  };

  const it = items[active];
  const voices = [
    { name: lanes.you, role: it.you, amp: at(YOU, t), red: false },
    { name: lanes.us, role: it.us, amp: at(US, t), red: true },
  ];

  return (
    <section
      ref={root}
      className="section-pad"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) paused.current = false;
      }}
    >
      <div className="mx-auto grid max-w-(--container-page) gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-5">
          <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">{heading}</h2>
          <p className="mt-6 text-lead text-mute-dark">{ask}</p>

          {/* the switch: click, arrow keys, or drag the red knob */}
          <div
            ref={track}
            role="tablist"
            aria-label={ask}
            onKeyDown={onKey}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="relative mt-5 grid touch-none grid-cols-3 rounded-pill border border-ink-line bg-ink-2 p-1 select-none"
          >
            <span
              aria-hidden
              className="absolute top-1 bottom-1 rounded-pill bg-signal shadow-[0_10px_30px_-10px_rgb(227_16_27/0.8)]"
              style={{ width: `calc((100% - 0.5rem) / ${n})`, left: `calc(0.25rem + (100% - 0.5rem) * ${(t / n).toFixed(4)})` }}
            />
            {items.map((x, i) => (
              <button
                key={x.label}
                type="button"
                role="tab"
                id={`svc-tab-${i}`}
                aria-selected={active === i}
                aria-controls={`svc-panel-${i}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => {
                  touched.current = true;
                  go(i);
                }}
                className={`relative z-10 cursor-pointer rounded-pill px-1 py-3 font-display text-[0.84rem] font-semibold whitespace-nowrap transition-colors duration-200 sm:px-2 sm:text-[1.05rem] ${active === i ? "text-signal-ink" : "text-mute-dark hover:text-paper"}`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {/* the chosen offer */}
          <div className="mt-10 grid">
            {items.map((x, i) => {
              const on = active === i;
              const cls = "group/link inline-flex items-center gap-2.5 font-display text-[1.0625rem] font-semibold text-paper transition-colors hover:text-signal";
              const inner = (
                <>
                  {x.external && <WhatsApp className="h-4 w-4" />}
                  <span className="border-b border-paper/30 pb-0.5 transition-colors group-hover/link:border-signal">{x.link}</span>
                  <span className="text-signal transition-transform duration-450 ease-primary group-hover/link:translate-x-1">
                    <Arrow />
                  </span>
                </>
              );
              return (
                <div
                  key={x.label}
                  id={`svc-panel-${i}`}
                  role="tabpanel"
                  aria-labelledby={`svc-tab-${i}`}
                  inert={!on}
                  className={`col-start-1 row-start-1 transition-[opacity,transform] ease-primary ${on ? "opacity-100 duration-450 delay-150" : "pointer-events-none translate-y-2 opacity-0 duration-150"}`}
                >
                  <span className="font-mono text-small text-signal">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-h3 font-semibold tracking-[-0.02em]">{x.title}</h3>
                  <p className="mt-3 max-w-[40ch] text-lead text-mute-dark">{x.body}</p>
                  <div className="mt-7">
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

        {/* the call: who does what, and both voices on it */}
        <div className="min-w-0 lg:col-span-7">
          <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-ink-line bg-ink-2 p-6 sm:p-9">
            <div aria-hidden className="flex items-center gap-3 font-mono text-label tracking-[0.18em] text-mute-dark uppercase">
              <span className="svc-live size-2.5 rounded-full bg-signal" />
              {live}
            </div>
            {voices.map((v) => (
              <div key={v.name} className="mt-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className={`shrink-0 font-display text-h3 font-semibold tracking-[-0.02em] ${v.red ? "text-signal" : ""}`}>{v.name}</span>
                  <span className="min-w-0 truncate text-small text-paper/80">{v.role}</span>
                </div>
                <div aria-hidden className="mt-4 flex h-20 items-center justify-between sm:h-24" style={{ ["--amp" as string]: v.amp.toFixed(3) }}>
                  {SHAPE.map((b, i) => (
                    <span
                      key={i}
                      className={`svc-bar h-full w-[3px] shrink-0 rounded-full sm:w-1 ${v.red ? "bg-signal" : "bg-paper"}`}
                      style={{ ["--h" as string]: b.h.toFixed(3), animationDelay: `-${b.d}s`, animationDuration: `${b.s}s` }}
                    />
                  ))}
                </div>
              </div>
            ))}
            {/* every stop's line is in the same cell, so the panel keeps the height of the longest one */}
            <div className="mt-9 grid border-t border-ink-line pt-6">
              {items.map((x, i) => (
                <p key={x.label} aria-hidden={i !== active} className={`col-start-1 row-start-1 font-display text-h3 leading-tight font-semibold tracking-[-0.02em] text-paper transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-0"}`}>
                  {x.line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
