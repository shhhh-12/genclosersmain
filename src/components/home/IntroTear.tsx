"use client";

/**
 * Home intro: the flat spoke wheel with 6 words opens on red "Sales", turns one full circle
 * (Prospect, Connect, Pitch, Negotiate, Close) and lands on "Sales" again. Then the arrow
 * shoots across the screen and slices it horizontally; the top half lifts away, the bottom half
 * drops, a beat of black, then the hero (logo + GENCLOSERS, in the same spot as "Sales") zooms in. One slice per page load.
 *
 * - INTRO_EVERY_LOAD (lib/intro.ts) = play on every load while testing; otherwise once per visit.
 * - Any scroll, swipe, key or click skips straight to the slice.
 * - Never plays for prefers-reduced-motion (decided before first paint by introGateScript).
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { gsap } from "gsap";
import { WheelScene } from "@/components/wheel/WheelScene";
import { lockScroll } from "@/lib/scroll";
import { INTRO_KEY, INTRO_EVERY_LOAD } from "@/lib/intro";
import { renderWheel, beatState, centreOnCaps, WHEEL } from "@/lib/wheel";
import { site } from "@/content/site";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function IntroTear({ words, stageId }: { words: readonly string[]; stageId: string }) {
  const [state, setState] = useState<"pending" | "playing" | "done">("pending");
  const root = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const slit = useRef<HTMLDivElement>(null);
  const blade = useRef<HTMLDivElement>(null);
  const arrows = useRef<(HTMLSpanElement | null)[]>([]);
  const scenes = useRef<(HTMLDivElement | null)[]>([]);

  // Decide before paint (also covers client navigation back to home).
  useIsoLayoutEffect(() => {
    const d = document.documentElement;
    let seen = false;
    try {
      seen = !INTRO_EVERY_LOAD && sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const play = !(seen || reduce || (!INTRO_EVERY_LOAD && d.dataset.intro === "done"));
    d.dataset.intro = play ? "play" : "done";
    setState(play ? "playing" : "done");
  }, []);

  useEffect(() => {
    if (state !== "playing") return;
    const n = words.length;
    const sales = words.indexOf("Sales");
    const stage = document.getElementById(stageId);
    const wordEls = scenes.current.flatMap((s) => (s ? Array.from(s.querySelectorAll<HTMLElement>(".wheel-word")) : []));
    const arrowInner = arrows.current.map((a) => a?.firstElementChild as HTMLElement | null);
    const clock = { f: 0 };
    const render = () => {
      const b = beatState(clock.f, sales);
      renderWheel(wordEls, b.pos, n, { kick: b.wordKick, kickIndex: b.arriving });
      arrowInner.forEach((a) => a && (a.style.transform = `translateX(${b.arrowKick}em)`));
    };
    const align = () =>
      scenes.current.forEach((s) => {
        const anchor = s?.querySelector<HTMLElement>(".wheel-anchor");
        const sample = s?.querySelector<HTMLElement>(".wheel-word");
        if (anchor && sample) centreOnCaps(anchor, sample);
      });
    align();
    document.fonts?.ready.then(align);
    window.addEventListener("resize", align);

    lockScroll(true);
    render();
    // The hero lockup sits where the arrow is: zoom it in from that spot, starting from black
    // (both x and y, relative to the stage: the stage is taller than the screen, so "50%"
    // would make the lockup slide up while it zooms)
    const r = blade.current?.firstElementChild?.getBoundingClientRect(); // the visible arrow
    const s = stage?.getBoundingClientRect();
    const slot = r && s ? `${r.left + r.width / 2 - s.left}px ${r.top + r.height / 2 - s.top}px` : "30% 50vh";
    if (stage) gsap.set(stage, { scale: 0.92, opacity: 0, transformOrigin: slot });

    const frames = n * WHEEL.beatFrames; // one full turn: Sales back to Sales
    const tl = gsap.timeline({ delay: 0.8 }); // a moment on "Sales" first
    tl.to(clock, { f: frames, duration: frames / WHEEL.fps, ease: "none", onUpdate: render });

    // The slice: the arrow flies across along the centre line, the slit opens behind it.
    tl.addLabel("cut", ">+0.05");
    tl.set(arrows.current, { opacity: 0 }, "cut");
    tl.fromTo(blade.current, { x: 0, opacity: 1 }, { x: () => window.innerWidth * 1.15, duration: 0.62, ease: "power4.in", immediateRender: false }, "cut");
    tl.fromTo(slit.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.62, ease: "power4.in", immediateRender: false }, "cut");
    tl.to(top.current, { x: -8, duration: 0.16, ease: "power2.out" }, "cut+=0.6");
    tl.to(bottom.current, { x: 8, duration: 0.16, ease: "power2.out" }, "cut+=0.6");
    tl.addLabel("peel", "cut+=0.72");
    tl.to(slit.current, { opacity: 0, duration: 0.3 }, "peel");
    tl.to(top.current, { yPercent: -58, rotateX: 34, z: -140, duration: 1.2, ease: "power3.inOut" }, "peel");
    tl.to(bottom.current, { yPercent: 58, rotateX: -34, z: -140, duration: 1.2, ease: "power3.inOut" }, "peel");
    tl.to([top.current, bottom.current], { opacity: 0, duration: 0.45, ease: "power1.in" }, "peel+=0.8");
    // The halves are gone at peel+1.25; a beat of pure black, then the lockup zooms in
    if (stage) tl.to(stage, { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }, "peel+=1.6");

    if (process.env.NODE_ENV !== "production") (window as unknown as { __intro: unknown }).__intro = { clock, render, tl };

    const finish = () => {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      if (stage) gsap.set(stage, { clearProps: "transform,opacity,transformOrigin" });
      document.documentElement.dataset.intro = "done";
      lockScroll(false);
      setState("done");
    };
    tl.eventCallback("onComplete", finish);

    let skipped = false;
    const skip = () => {
      if (skipped) return;
      skipped = true;
      if (tl.time() < tl.labels.cut) {
        clock.f = frames;
        render();
        tl.seek("cut");
      }
      tl.timeScale(1.3);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["Tab", "Shift", "Alt", "Control", "Meta"].includes(e.key)) return;
      skip();
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", onKey);
    const el = root.current;
    el?.addEventListener("pointerdown", skip);

    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", align);
      el?.removeEventListener("pointerdown", skip);
      tl.kill();
      lockScroll(false);
      if (stage) gsap.set(stage, { clearProps: "transform,opacity,transformOrigin" });
    };
  }, [state, words, stageId]);

  if (state === "done") return null;

  return (
    <div id="gc-intro" ref={root} className="fixed inset-0 z-[60] cursor-pointer select-none [perspective:1400px]">
      <div aria-hidden className="wheel-size absolute inset-0 leading-none">
        <div ref={top} className="absolute inset-0 bg-black [clip-path:inset(0_0_50%_0)] [transform-origin:50%_0%] will-change-transform">
          <WheelScene words={words} sceneRef={(e) => void (scenes.current[0] = e)} arrowRef={(e) => void (arrows.current[0] = e)} />
        </div>
        <div ref={bottom} className="absolute inset-0 bg-black [clip-path:inset(50%_0_0_0)] [transform-origin:50%_100%] will-change-transform">
          <WheelScene words={words} sceneRef={(e) => void (scenes.current[1] = e)} arrowRef={(e) => void (arrows.current[1] = e)} />
        </div>

        {/* The slit the arrow leaves behind: white-hot core, red glow */}
        <div
          ref={slit}
          className="absolute top-1/2 left-0 h-[2px] w-full origin-left -translate-y-1/2 scale-x-0 bg-white shadow-[0_0_22px_3px_#ff0000,0_0_3px_1px_#fff]"
        />
        {/* The flying GenClosers mark (blade), starting exactly where the wheel mark sits */}
        <div
          ref={blade}
          className="pointer-events-none absolute top-1/2 left-[calc(var(--gutter)+1.1em-1.0105em)] opacity-0 sm:left-[calc(27.9vw-1.0105em)]"
          style={{ width: `${WHEEL.arrowWidthEm}em` }}
        >
          <span className="block -translate-y-1/2 drop-shadow-[0_0_14px_#ff0000]" style={{ color: WHEEL.redHex }}>
            <LogoMark className="block h-[0.72em] w-auto" title="" />
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          root.current?.dispatchEvent(new PointerEvent("pointerdown"));
        }}
        className="eyebrow absolute right-(--gutter) bottom-6 z-10 rounded-pill border border-ink-line px-4 py-2 text-mute-dark transition-colors hover:border-signal hover:text-paper"
      >
        {site.ui.skipIntro}
      </button>
    </div>
  );
}
