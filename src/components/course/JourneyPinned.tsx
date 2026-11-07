"use client";

/**
 * Course page journey, built like the home hero:
 *  - Full-screen black stage, big spoke wheel with the 7 steps, heading top-left,
 *    step counter + description bottom-left.
 *  - Pinned; scrolling turns the wheel one step at a time (each step eases in like a wheel beat).
 *  - After "Get certified." (red), the other steps fade to black, the arrow shoots across and
 *    slices "Get certified." open; the halves peel away, a beat of pure black, then the logo +
 *    GENCLOSERS appears in the same spot (mark in the arrow slot, letters where the word
 *    started) and dolly-zooms in. The word and the lockup are never on screen together.
 *    Scrolling back reverses it.
 * About three mouse-wheel notches per step, no snapping.
 * Reduced motion: a plain, fully readable list with no pinning.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WheelScene } from "@/components/wheel/WheelScene";
import { BrandLockup } from "@/components/wheel/BrandLockup";
import { SliceStage } from "@/components/wheel/SliceStage";
import { sliceParts, layoutSlice, resetSlice, addSlice } from "@/lib/slice";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { renderWheel, centreOnCaps, wheelEase, WHEEL } from "@/lib/wheel";
import type { Card } from "@/content/types";

gsap.registerPlugin(ScrollTrigger);

const STEP_VH = 0.32; // scroll distance per step, as a fraction of the viewport height
const BRAND_STEPS = 3; // extra scroll (in steps) for the brand reveal and dolly zoom

export function JourneyPinned({ heading, steps }: { heading: string; steps: Card[] }) {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);
  const lock = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pinned = useMotionAllowed();
  const last = steps.length - 1;
  const titles = steps.map((s) => s.title);

  useEffect(() => {
    const frame = section.current;
    const lockEl = lock.current;
    const stageEl = stage.current;
    if (!pinned || !scene.current || !frame || !lockEl || !stageEl) return;
    const parts = sliceParts(stageEl);
    const els = Array.from(scene.current.querySelectorAll<HTMLElement>(".wheel-word"));
    const layer = scene.current.querySelector<HTMLElement>(".wheel-words");
    const anchor = scene.current.querySelector<HTMLElement>(".wheel-anchor");
    const proxy = { p: 0 };

    const render = (raw: number) => {
      const b = Math.floor(raw);
      const pos = Math.min(last, b + wheelEase(Math.min(1, (raw - b) / 0.75)));
      renderWheel(els, pos, steps.length, { wrap: false });
    };
    // Everything lines up on the active word: the slice copy sits on it, the cut goes through
    // its middle, the arrow flies from the arrow slot, and the lockup takes the same spot
    // (mark in the arrow slot, letters where the word starts). Rects are divided by k in case
    // an ancestor is scaled.
    const measure = () => {
      if (anchor && els[0]) centreOnCaps(anchor, els[0]);
      const f = frame.getBoundingClientRect();
      const k = f.height / (frame.offsetHeight || f.height) || 1;
      const w = els[last];
      const prevW = w.style.transform;
      w.style.transform = "none";
      const r = w.getBoundingClientRect();
      w.style.transform = prevW;
      const prevL = lockEl.style.transform;
      lockEl.style.transform = "none";
      const text = lockEl.querySelector<HTMLElement>(".brand-text");
      if (text) {
        text.style.marginLeft = "";
        const base = parseFloat(getComputedStyle(text).marginLeft) || 0;
        text.style.marginLeft = `${base + (r.left - text.getBoundingClientRect().left) / k}px`;
      }
      const markR = lockEl.querySelector<HTMLElement>(".brand-logo")?.getBoundingClientRect();
      lockEl.style.transform = prevL;
      const a = arrow.current?.getBoundingClientRect();
      const x = (r.left - f.left) / k;
      const cutY = (r.top - f.top + r.height / 2) / k;
      const markW = markR ? markR.width / k : 0;
      const slotX = a ? (a.left - f.left) / k : x - 60;
      layoutSlice(parts, { contentX: x, contentY: (r.top - f.top) / k, cutY, originX: slotX + markW / 2, bladeX: slotX });
      lockEl.style.transformOrigin = `${markW / 2}px 50%`;
    };
    measure();
    render(0);

    // Explicit start values everywhere, so scrubbing back and forth is exact
    gsap.set(layer, { "--others": 1 });
    gsap.set(els[last], { "--self": 1 });
    gsap.set(lockEl, { opacity: 0, scale: 1 });
    resetSlice(parts);
    gsap.set(stageEl, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: frame,
        start: "top top",
        end: () => `+=${window.innerHeight * STEP_VH * (last + BRAND_STEPS)}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.5,
        onRefresh: measure,
      },
    });
    tl.fromTo(
      proxy,
      { p: 0 },
      {
        p: last,
        duration: last,
        ease: "none",
        immediateRender: false,
        onUpdate: () => {
          render(proxy.p);
          setActive(Math.min(last, Math.round(proxy.p)));
        },
      }
    );

    // "Get certified." -> the arrow slices it open -> centred logo + GENCLOSERS underneath, dolly in
    tl.addLabel("brand", "+=0.25");
    tl.fromTo(layer, { "--others": 1 }, { "--others": 0, duration: 0.5, ease: "power1.in", immediateRender: false }, "brand");
    // Swap the wheel word + arrow for the identical slice copy
    tl.fromTo(stageEl, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, "brand+=0.55");
    tl.fromTo(els[last], { "--self": 1 }, { "--self": 0, duration: 0.01, immediateRender: false }, "brand+=0.55");
    tl.fromTo(arrow.current, { opacity: 1 }, { opacity: 0, duration: 0.01, immediateRender: false }, "brand+=0.55");
    tl.addLabel("cut", "brand+=0.6");
    addSlice(tl, parts, "cut", () => frame.clientWidth + 200);
    // The halves are gone at cut+1.97; a beat of pure black; then the lockup, then the dolly in
    tl.addLabel("lock", "cut+=2.35");
    tl.fromTo(lockEl, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out", immediateRender: false }, "lock");
    tl.fromTo(lockEl, { scale: 1 }, { scale: 1.12, duration: 1, ease: "power1.inOut", immediateRender: false }, "lock+=0.7");
    tl.to({}, { duration: 0.3 });
    if (process.env.NODE_ENV !== "production") (window as unknown as { __journeyTl: gsap.core.Timeline }).__journeyTl = tl;

    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [pinned, last, steps.length]);

  if (!pinned) {
    return (
      <section ref={section} className="section-pad">
        <div className="mx-auto max-w-(--container-page)">
          <h2 className="max-w-[16ch] font-display text-h2 font-semibold tracking-[-0.03em]">{heading}</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-soft border border-ink-line bg-ink-line md:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className={`bg-ink p-6 sm:p-8 ${i === last ? "text-signal" : ""}`}>
                <span className="font-mono text-small text-signal">0{i + 1}</span>
                <h3 className="mt-3 font-display text-h3 font-semibold">{s.title}</h3>
                <p className={`mt-2 ${i === last ? "text-signal/80" : "text-mute-dark"}`}>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden bg-black">
      {/* The wheel, full screen like the home hero */}
      <div aria-hidden className="journey-wheel-size absolute inset-0 leading-none">
        <WheelScene
          words={titles}
          sceneRef={scene}
          arrowRef={arrow}
          highlight={titles[last]}
          // Mark's left edge = the page column's left edge (same as the heading and counter):
          // gutter + centring margin of the 84rem column + the mark slot (WHEEL.arrowLeftEm)
          anchorClassName="left-[calc(var(--gutter)+max(0px,(100%-2*var(--gutter)-var(--container-page))/2)+1.0105em)]"
          fade
        >
          <BrandLockup lockRef={lock} />
        </WheelScene>
        <SliceStage stageRef={stage}>
          <span
            className="absolute block font-display leading-none font-bold tracking-[-0.02em] whitespace-nowrap"
            style={{ left: "var(--sx)", top: "var(--sy)", height: "1em", color: WHEEL.redHex }}
          >
            {titles[last]}
          </span>
        </SliceStage>
      </div>

      {/* Heading, top left */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-[linear-gradient(to_bottom,#000_0%,#000_62%,transparent_100%)] px-(--gutter) pt-24 pb-14 sm:pt-28">
        <div className="mx-auto max-w-(--container-page)">
          <h2 className="max-w-[18ch] font-display text-h3 font-semibold tracking-[-0.02em] sm:text-h2">{heading}</h2>
        </div>
      </div>

      {/* Counter + description, bottom left */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(to_top,#000_0%,#000_60%,transparent_100%)] px-(--gutter) pt-12 pb-8 sm:pb-10">
        <div className="mx-auto max-w-(--container-page)">
          <p className="font-mono text-h3 text-mute-dark tabular-nums">
            <span className="text-signal">0{active + 1}</span> / 0{steps.length}
          </p>
          <div className="mt-4 h-px w-full max-w-xs bg-ink-line">
            <div className="h-px bg-signal transition-[width] duration-450 ease-primary" style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
          </div>
          <div className="relative mt-4 min-h-[3.5rem] max-w-[38ch]" aria-live="polite">
            {steps.map((s, i) => (
              <p
                key={s.title}
                className={`absolute inset-0 transition-[opacity,transform] duration-450 ease-primary ${
                  i === active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                } ${i === last ? "text-signal" : "text-mute-dark"}`}
                aria-hidden={i !== active}
              >
                {s.body}
              </p>
            ))}
          </div>
        </div>
      </div>

      <ol className="sr-only">
        {steps.map((s) => (
          <li key={s.title}>
            {s.title} {s.body}
          </li>
        ))}
      </ol>
    </section>
  );
}
