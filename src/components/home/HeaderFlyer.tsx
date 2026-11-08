"use client";

/**
 * Hero mark into header, as one clean hand-off (no copy left behind).
 *
 * At the top of the home page the header shows no logo: the hero has the big one. The first time
 * you scroll down, the hero art fades away and its red mark (the one element, taken from wherever
 * it is on screen right now) glides into the header logo slot, then the name fades in beside it.
 * Scroll back to the very top and it glides back to the hero's mark slot; the hero restarts on
 * the lockup. Time based (not scrubbed), so it always finishes cleanly. Transform + opacity only.
 *
 * Talks to HeroWheel through <html data-hero="live | docked | returning">.
 * Reduced motion: nothing moves; the header just shows its logo.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { LogoMark } from "@/components/brand/LogoMark";
import { WHEEL } from "@/lib/wheel";

const DOCK_AT = 40; // px scrolled before the mark leaves for the header
const UNDOCK_AT = 8; // back at the very top

type Box = { cx: number; cy: number; h: number };

const boxOf = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height };
};
const shown = (el: HTMLElement | null) => {
  for (let e = el; e && e !== document.body; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.5) return false;
  }
  return !!el;
};

export function HeaderFlyer() {
  const fly = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fly.current;
    const html = document.documentElement;
    const brand = document.querySelector<HTMLElement>("[data-header-brand]");
    const mark = document.querySelector<HTMLElement>("[data-header-mark]");
    const text = document.querySelector<HTMLElement>("[data-header-text]");
    const art = document.querySelector<HTMLElement>("#home-stage [data-hero-art]");
    if (!el || !brand || !mark || !text || !art) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lockupMark = () => art.querySelector<HTMLElement>(".slice-top .brand-logo");
    /** The hero's mark as it is on screen now (lockup copy, lockup, or the wheel arrow), else the arrow slot. */
    const visibleHeroMark = () => {
      const candidates = [lockupMark(), art.querySelector<HTMLElement>(".brand-lock .brand-logo"), art.querySelector<HTMLElement>(".wheel-arrow svg")];
      const el = candidates.find((c) => shown(c)) ?? null;
      return { el, box: boxOf(el ?? candidates[2] ?? art) };
    };
    // The one hero mark that the flyer replaces; hidden at once so there is never a copy on screen
    let lifted: HTMLElement | null = null;
    const putBack = () => {
      if (lifted) gsap.set(lifted, { clearProps: "visibility" });
      lifted = null;
    };
    const headerMark = () => boxOf(mark.querySelector("svg") ?? mark);

    let tween: gsap.core.Timeline | null = null;
    let state: "live" | "docked" = window.scrollY > DOCK_AT ? "docked" : "live";

    // The flyer is drawn at the hero's size and only ever scaled down, so it stays sharp
    const place = (b: Box, base: number) => {
      gsap.set(el, { height: base, x: b.cx, y: b.cy, xPercent: -50, yPercent: -50, scale: b.h / base });
    };

    const settle = () => {
      tween?.kill();
      tween = null;
      gsap.set(el, { opacity: 0 });
      if (state === "docked") {
        html.dataset.hero = "docked";
        putBack(); // the art is faded out, the hero is paused
        gsap.set(art, { opacity: 0 });
        gsap.set([mark, text], { opacity: 1 });
        brand.style.pointerEvents = "";
      } else {
        html.dataset.hero = "live";
        gsap.set(art, { opacity: 1 });
        gsap.set([mark, text], { opacity: 0 });
        brand.style.pointerEvents = "none";
      }
    };

    const dock = () => {
      state = "docked";
      tween?.kill();
      const { el: src, box: from } = visibleHeroMark();
      const to = headerMark();
      html.dataset.hero = "docked"; // hero stops where it is
      place(from, from.h);
      if (src) {
        lifted = src;
        gsap.set(src, { visibility: "hidden" });
      }
      tween = gsap
        .timeline({ onComplete: settle })
        .set(el, { opacity: 1 })
        .to(art, { opacity: 0, duration: 0.25, ease: "power1.out" }, 0)
        .to(el, { x: to.cx, y: to.cy, scale: to.h / from.h, duration: 0.9, ease: "power3.inOut" }, 0)
        .to(text, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0.7)
        .set(mark, { opacity: 1 }, 0.9)
        .set(el, { opacity: 0 }, 0.9);
      brand.style.pointerEvents = "";
    };

    const undock = () => {
      state = "live";
      tween?.kill();
      putBack();
      const from = headerMark();
      html.dataset.hero = "returning"; // hero resets to the lockup so the slot is right
      // measure after HeroWheel has reset (its observer runs in the microtask queued just now)
      queueMicrotask(() => {
        if (state !== "live") return;
        const target = lockupMark();
        const to = target ? boxOf(target) : visibleHeroMark().box;
        place(from, to.h);
        tween = gsap
        .timeline({ onComplete: settle })
        .set(el, { opacity: 1 })
        .set(mark, { opacity: 0 }, 0)
        .to(text, { opacity: 0, duration: 0.25, ease: "power1.in" }, 0)
        .to(el, { x: to.cx, y: to.cy, scale: 1, duration: 0.9, ease: "power3.inOut" }, 0)
        .to(art, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0.75);
      });
      brand.style.pointerEvents = "none";
    };

    settle();

    const onScroll = () => {
      // wait for the intro to hand over first
      if (html.dataset.intro === "play") return;
      const y = window.scrollY;
      if (state === "live" && y > DOCK_AT) dock();
      else if (state === "docked" && y <= UNDOCK_AT) undock();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      tween?.kill();
      putBack();
      delete html.dataset.hero;
      gsap.set([mark, text, art], { clearProps: "opacity" });
      brand.style.pointerEvents = "";
    };
  }, []);

  return (
    <div
      ref={fly}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[45] opacity-0 will-change-transform"
      style={{ color: WHEEL.redHex }}
    >
      <LogoMark className="block h-full w-auto" title="" />
    </div>
  );
}
