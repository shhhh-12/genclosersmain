"use client";

/**
 * India drawn as a grid of dots (official boundary, lib/indiaDots.ts). As the map scrolls through
 * the screen, the dots flip from grey to red like coins, in a wave that spreads out from Tamil Nadu
 * ("Born in Tamil Nadu. Built for India."). All grey until you scroll; Tamil Nadu's dots flip first.
 *
 * One damped progress number (same formula as lib/scrollScene.ts); every dot is a pure function of
 * it, so scrolling back flips them back. Drawn on one canvas; the loop only runs while catching up.
 * Reduced motion: all red, no flipping.
 */

import { useEffect, useRef } from "react";
import { INDIA_DOTS, INDIA_GRID, INDIA_ORIGIN } from "@/lib/indiaDots";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { clamp01 } from "@/lib/scrollScene";
import { sceneProgress, scenePinned } from "@/lib/sceneProgress";

const FLIP = 0.09; // how much of the scroll one dot's flip takes
const TAU = 110; // damping, ms

type Dot = { x: number; y: number; t: number };

function buildDots(): Dot[] {
  const out: Dot[] = [];
  let far = 0;
  for (let i = 0; i < INDIA_DOTS.length; i += 2) {
    const x = INDIA_DOTS[i];
    const y = INDIA_DOTS[i + 1];
    const d = Math.hypot(x - INDIA_ORIGIN.col, y - INDIA_ORIGIN.row);
    far = Math.max(far, d);
    out.push({ x, y, t: d });
  }
  for (const dot of out) {
    // small fixed wobble so the wave edge looks hand made, not a perfect circle
    const h = Math.sin(dot.x * 12.9898 + dot.y * 78.233) * 43758.5453;
    const jitter = h - Math.floor(h);
    dot.t = (dot.t / far) * 0.88 + jitter * 0.12;
  }
  return out;
}

export function IndiaDots({ label, className }: { label: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const motion = useMotionAllowed();

  useEffect(() => {
    const box = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!box || !cv || !ctx) return;

    const dots = buildDots();
    const css = getComputedStyle(document.documentElement);
    const red = css.getPropertyValue("--color-signal").trim() || "#e3101b";
    const grey = "rgb(163 157 149 / 0.28)"; // mute-dark, faint on ink

    let w = 0;
    let cell = 0;
    let p = motion ? 0 : 1;
    let target = p;
    let raf = 0;
    let last = 0;

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, cell * INDIA_GRID.rows);
      const r = cell * 0.32;
      const span = 1 + FLIP;
      for (const d of dots) {
        // 0 = grey face up, 1 = red face up; in between the coin turns on its vertical axis
        const k = clamp01((p * span - d.t) / FLIP);
        const turn = Math.abs(Math.cos(k * Math.PI));
        const cx = (d.x + 0.5) * cell;
        const cy = (d.y + 0.5) * cell;
        ctx.fillStyle = k >= 0.5 ? red : grey;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(0.35, r * turn), r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      sceneProgress.emit(p); // the hero text and the numbers move with it
    };

    const size = () => {
      w = box.clientWidth;
      cell = w / INDIA_GRID.cols;
      const h = cell * INDIA_GRID.rows;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.height = `${h}px`;
      draw();
    };

    // 0 when the map's top enters the lower part of the screen (or, if it is already on screen when the
    // page opens, at the top of the page), 1 when its bottom is just above the middle of the screen
    // Inside a pinned scene ([data-dots-scene], desktop): the scroll through that scene drives it.
    const scene = box.closest<HTMLElement>("[data-dots-scene]");
    const read = () => {
      const vh = window.innerHeight;
      if (scene && scenePinned()) {
        const sr = scene.getBoundingClientRect();
        return clamp01(-sr.top / Math.max(1, (scene.offsetHeight - vh) * 0.9));
      }
      const rect = box.getBoundingClientRect();
      const start = Math.min(vh * 0.85, rect.top + window.scrollY);
      const end = vh * 0.2 - rect.height;
      return clamp01((start - rect.top) / Math.max(1, start - end));
    };

    const frame = (now: number) => {
      const dt = Math.min(48, now - last || 16);
      last = now;
      p += (target - p) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(target - p) < 2e-4) p = target;
      draw();
      scene?.toggleAttribute("data-dots-done", p > 0.9);
      raf = p === target ? 0 : requestAnimationFrame(frame);
    };

    const onScroll = () => {
      if (!motion) return;
      target = read();
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    size();
    if (motion) {
      target = p = read();
      draw();
    }
    const ro = new ResizeObserver(size);
    ro.observe(box);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [motion]);

  return (
    <div ref={wrap} className={className}>
      <canvas ref={canvas} role="img" aria-label={label} className="block w-full" />
    </div>
  );
}
