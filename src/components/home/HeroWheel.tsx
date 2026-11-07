"use client";

/**
 * Home hero loop (picks up straight after the intro slice):
 *  1. Logo + GENCLOSERS, aligned exactly like "Sales" (the mark sits in the arrow's slot),
 *     dolly zoom in; 3 seconds on screen.
 *  2. Like the intro: the mark flies off as the arrow and slices the lockup; the black halves
 *     peel away, a beat of pure black, then "Sales" (with its arrow) zooms in.
 *  3. The other words fade in and the spoke wheel turns 12 beats, back to "Sales".
 *  4. Everything fades to black, a beat of black, then the lockup returns in the same spot. Repeat.
 *  The lockup and "Sales" are never on screen at the same time.
 *
 * Pauses when off screen and while the intro is playing. Reduced motion: still lockup.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { WheelScene } from "@/components/wheel/WheelScene";
import { BrandLockup, LockupInner } from "@/components/wheel/BrandLockup";
import { SliceStage } from "@/components/wheel/SliceStage";
import { renderWheel, beatState, centreOnCaps, WHEEL } from "@/lib/wheel";
import { sliceParts, layoutSlice, resetSlice, addSlice } from "@/lib/slice";

const DOLLY_IN = 1.12;
const GAP = 0.35; // seconds of pure black between "Sales" and the lockup

export function HeroWheel({ words, children }: { words: readonly string[]; children?: React.ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);
  const lock = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scene.current;
    const lockEl = lock.current;
    const stageEl = stage.current;
    if (!el || !lockEl || !stageEl || !section.current) return;
    const frame = section.current;
    const n = words.length;
    const sales = words.indexOf("Sales");
    const wordEls = Array.from(el.querySelectorAll<HTMLElement>(".wheel-word"));
    const layer = el.querySelector<HTMLElement>(".wheel-words");
    const salesEl = wordEls[sales];
    const anchor = el.querySelector<HTMLElement>(".wheel-anchor");
    const arrowInner = arrow.current?.firstElementChild as HTMLElement | null;
    const parts = sliceParts(stageEl);
    const stageLogos = Array.from(stageEl.querySelectorAll<HTMLElement>(".brand-logo"));
    const clock = { f: 0 };

    const render = () => {
      const b = beatState(clock.f, sales);
      renderWheel(wordEls, b.pos, n, { kick: b.wordKick, kickIndex: b.arriving });
      if (arrowInner) arrowInner.style.transform = `translateX(${b.arrowKick}em)`;
    };
    // The lockup stays in the wheel's position (mark in the arrow slot, letters where "Sales"
    // starts). The slice copies sit exactly on it, the arrow flies from the mark, and every
    // zoom is anchored on the arrow slot so nothing drifts sideways.
    const measure = () => {
      if (anchor && wordEls[0]) centreOnCaps(anchor, wordEls[0]);
      const prev = lockEl.style.transform;
      lockEl.style.transform = "none";
      // Letters start exactly where "Sales" starts (wheel at rest)
      const texts = [lockEl, stageEl].flatMap((e) => Array.from(e.querySelectorAll<HTMLElement>(".brand-text")));
      texts.forEach((t) => (t.style.marginLeft = ""));
      const t0 = texts[0];
      // Screen rects include any scale on the page (the intro zooms the whole page in from
      // 0.92 while this runs), so convert them back to unscaled px with k.
      const f = frame.getBoundingClientRect();
      const k = f.height / (frame.offsetHeight || f.height) || 1;
      if (t0 && salesEl) {
        const delta = (salesEl.getBoundingClientRect().left - t0.getBoundingClientRect().left) / k;
        const base = parseFloat(getComputedStyle(t0).marginLeft) || 0;
        texts.forEach((t) => (t.style.marginLeft = `${base + delta}px`));
      }
      const r = lockEl.getBoundingClientRect();
      lockEl.style.transform = prev;
      const mark = (lockEl.querySelector<HTMLElement>(".brand-logo")?.getBoundingClientRect().width ?? 0) / k;
      const x = (r.left - f.left) / k;
      const cutY = (r.top - f.top + r.height / 2) / k;
      layoutSlice(parts, { contentX: x, contentY: (r.top - f.top) / k, cutY, originX: x + mark / 2, bladeX: x });
      el.style.transformOrigin = `${x + mark / 2}px ${cutY}px`;
      lockEl.style.transformOrigin = `${mark / 2}px 50%`;
    };
    render(); // wheel at rest on "Sales" before measuring
    measure();

    // Start state (what the intro slice reveals): whole lockup in the centre, wheel black
    const startState = () => {
      resetSlice(parts);
      gsap.set(stageLogos, { opacity: 1 });
      gsap.set(layer, { "--others": 0 });
      gsap.set(salesEl, { "--self": 0 });
      gsap.set(arrow.current, { opacity: 0 });
      gsap.set(lockEl, { scale: 1, opacity: 0 });
    };
    startState();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const onResize = () => measure();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const frames = n * WHEEL.beatFrames;
    const tl = gsap.timeline({ repeat: -1, paused: true });

    // Re-measure at the start of every loop (fonts / layout may have settled since)
    tl.call(measure, [], 0);
    // 1. Dolly in on the lockup; 3s on screen
    tl.fromTo(parts.dolly, { scale: 1 }, { scale: DOLLY_IN, duration: 1.8, ease: "power1.inOut", immediateRender: false });
    tl.to({}, { duration: 1.2 });

    // 2. The mark flies off as the arrow and slices the lockup; the halves peel away to black
    tl.addLabel("cut");
    tl.fromTo(stageLogos, { opacity: 1 }, { opacity: 0, duration: 0.01, immediateRender: false }, "cut");
    addSlice(tl, parts, "cut", () => frame.clientWidth + 200);
    // The halves are gone at cut+1.97; a beat of black; then "Sales" + arrow zoom in
    tl.addLabel("sales", `cut+=${1.97 + GAP}`);
    tl.set(clock, { f: 0, onComplete: render }, "sales");
    tl.fromTo(salesEl, { "--self": 0 }, { "--self": 1, duration: 0.01, immediateRender: false }, "sales");
    tl.fromTo(arrow.current, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, "sales");
    tl.fromTo(el, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out", immediateRender: false }, "sales");
    tl.to({}, { duration: 0.4 });

    // 3. The other words fade in, the wheel turns once
    tl.to(layer, { "--others": 1, duration: 0.6, ease: "power1.out" });
    tl.to(clock, { f: frames, duration: frames / WHEEL.fps, ease: "none", onUpdate: render });

    // 4. The other words go, then "Sales" + arrow; a beat of black; the lockup returns in place
    tl.to(layer, { "--others": 0, duration: 0.6, ease: "power1.in" });
    tl.to(salesEl, { "--self": 0, duration: 0.35, ease: "power1.in" });
    tl.to(arrow.current, { opacity: 0, duration: 0.35, ease: "power1.in" }, "<");
    tl.addLabel("in", `>+${GAP}`);
    tl.fromTo(lockEl, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, "in");
    // Hand over to the (identical) whole slice copy for the next turn
    tl.call(() => {
      resetSlice(parts);
      gsap.set(stageLogos, { opacity: 1 });
      gsap.set(lockEl, { opacity: 0 });
    }, [], "in+=0.82");

    const onResize = () => {
      measure();
      tl.invalidate();
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize);

    if (process.env.NODE_ENV !== "production") (window as unknown as { __heroTl: gsap.core.Timeline }).__heroTl = tl;

    // Wait for the intro to finish, and only run while on screen
    let onScreen = true;
    const sync = () => {
      const introDone = document.documentElement.dataset.intro !== "play";
      if (introDone && onScreen) tl.play();
      else tl.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(frame);
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-intro"] });
    sync();

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      tl.kill();
    };
  }, [words]);

  return (
    <section ref={section} className="relative isolate h-[100svh] min-h-[34rem] overflow-hidden bg-black">
      <div aria-hidden className="wheel-size absolute inset-0 leading-none">
        <WheelScene words={words} sceneRef={scene} arrowRef={arrow}>
          <BrandLockup lockRef={lock} />
        </WheelScene>
        <SliceStage stageRef={stage}>
          <div
            className="absolute flex items-center font-display leading-none font-bold"
            style={{ left: "var(--sx)", top: "var(--sy)", color: WHEEL.redHex }}
          >
            <LockupInner />
          </div>
        </SliceStage>
      </div>
      <h1 className="sr-only">GenClosers. Sales is all you need.</h1>
      {children}
    </section>
  );
}
