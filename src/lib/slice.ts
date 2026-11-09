// Arrow-slice helpers for components/wheel/SliceStage.tsx.
// The arrow flies across a horizontal cut line and leaves a glowing slit; the top half then
// lifts away and the bottom half drops, revealing whatever is underneath.

import { gsap } from "gsap";

export type SliceParts = {
  stage: HTMLElement;
  dolly: HTMLElement;
  top: HTMLElement;
  bottom: HTMLElement;
  slit: HTMLElement;
  blade: HTMLElement;
};

export function sliceParts(stage: HTMLElement): SliceParts {
  const q = (s: string) => stage.querySelector<HTMLElement>(s)!;
  return { stage, dolly: q(".slice-dolly"), top: q(".slice-top"), bottom: q(".slice-bottom"), slit: q(".slice-slit"), blade: q(".slice-blade") };
}

/**
 * Place the sliced content and the cut, in px relative to the stage.
 * content: where the content's top-left goes. cutY: the cut line. originX: dolly zoom centre.
 * bladeX: where the arrow starts.
 */
export function layoutSlice(p: SliceParts, o: { contentX: number; contentY: number; cutY: number; originX: number; bladeX: number }) {
  p.stage.style.setProperty("--sx", `${o.contentX}px`);
  p.stage.style.setProperty("--sy", `${o.contentY}px`);
  const h = p.stage.clientHeight;
  p.top.style.clipPath = `inset(0 0 ${Math.max(0, h - o.cutY)}px 0)`;
  p.bottom.style.clipPath = `inset(${o.cutY}px 0 0 0)`;
  p.top.style.transformOrigin = `50% ${o.cutY}px`;
  p.bottom.style.transformOrigin = `50% ${o.cutY}px`;
  p.dolly.style.transformOrigin = `${o.originX}px ${o.cutY}px`;
  p.slit.style.top = `${o.cutY}px`;
  p.blade.style.top = `${o.cutY}px`;
  p.blade.style.left = `${o.bladeX}px`;
}

/** Back to whole and unsliced (stage visible). */
export function resetSlice(p: SliceParts) {
  gsap.set(p.stage, { opacity: 1 });
  gsap.set([p.top, p.bottom], { x: 0, yPercent: 0, rotateX: 0, z: 0, opacity: 1 });
  gsap.set(p.slit, { scaleX: 0, opacity: 1 });
  gsap.set(p.blade, { x: 0, opacity: 0 });
  gsap.set(p.dolly, { scale: 1 });
}

/**
 * Add the slice to a timeline at `at`, exactly like the home intro: the arrow flies across,
 * the slit opens, the halves slip, then peel away in 3D (top lifts, bottom drops) while the
 * content underneath (`reveal`) dolly-zooms in from slightly back (scale 0.92, dim) to full.
 * Works on time-based and scroll-scrubbed timelines (every tween has explicit start values).
 * Returns the label where the halves start to peel.
 */
export function addSlice(
  tl: gsap.core.Timeline,
  p: SliceParts,
  at: string,
  travel: () => number,
  reveal?: { el: HTMLElement | null; from?: number; to?: number },
  /** When (after the peel starts) and how fast the halves fade. Defaults match the intro. */
  fade: { at?: number; duration?: number } = {}
) {
  tl.fromTo(p.blade, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, at);
  tl.fromTo(p.blade, { x: 0 }, { x: travel, duration: 0.62, ease: "power4.in", immediateRender: false }, at);
  tl.fromTo(p.slit, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.62, ease: "power4.in", immediateRender: false }, at);
  tl.fromTo(p.top, { x: 0 }, { x: -8, duration: 0.16, ease: "power2.out", immediateRender: false }, `${at}+=0.6`);
  tl.fromTo(p.bottom, { x: 0 }, { x: 8, duration: 0.16, ease: "power2.out", immediateRender: false }, `${at}+=0.6`);
  const peel = `${at}+=0.72`;
  tl.fromTo(p.slit, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, peel);
  tl.fromTo(p.top, { yPercent: 0, rotateX: 0, z: 0 }, { yPercent: -58, rotateX: 34, z: -140, duration: 1.2, ease: "power3.inOut", immediateRender: false }, peel);
  tl.fromTo(p.bottom, { yPercent: 0, rotateX: 0, z: 0 }, { yPercent: 58, rotateX: -34, z: -140, duration: 1.2, ease: "power3.inOut", immediateRender: false }, peel);
  tl.fromTo([p.top, p.bottom], { opacity: 1 }, { opacity: 0, duration: fade.duration ?? 0.45, ease: "power1.in", immediateRender: false }, `${peel}+=${fade.at ?? 0.8}`);
  if (reveal?.el) {
    const from = reveal.from ?? 0.92;
    const to = reveal.to ?? 1;
    tl.fromTo(reveal.el, { scale: from, opacity: 0.3, transformOrigin: "50% 50%" }, { scale: to, opacity: 1, duration: 1.2, ease: "power3.inOut", immediateRender: false }, `${peel}+=0.05`);
  }
  return peel;
}
