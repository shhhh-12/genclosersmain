"use client";

/**
 * A quiet ink dot grid that leans toward the pointer; the dots near it turn red.
 * Fills its positioned parent. Draws only while the pointer moves or the dots settle.
 * Touch / reduced motion: a still, faint grid.
 */

import { useEffect, useRef } from "react";

const GAP = 24;
const RADIUS = 170; // px of influence

export function DotField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d")!;
    const live = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1;
    const ptr = { x: -9999, y: -9999, tx: -9999, ty: -9999, a: 0, ta: 0 };
    let raf = 0;

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = host.clientWidth;
      H = host.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      draw();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let y = GAP / 2; y < H; y += GAP) {
        for (let x = GAP / 2; x < W; x += GAP) {
          const dx = ptr.x - x;
          const dy = ptr.y - y;
          const d = Math.hypot(dx, dy);
          const k = ptr.a * Math.max(0, 1 - d / RADIUS);
          const e = k * k * (3 - 2 * k); // smoothstep
          const px = x + (d > 0 ? (dx / d) * e * 9 : 0);
          const py = y + (d > 0 ? (dy / d) * e * 9 : 0);
          ctx.fillStyle = e > 0.08 ? `rgba(227,16,27,${(0.25 + 0.75 * e).toFixed(3)})` : "rgba(21,19,19,0.16)";
          ctx.beginPath();
          ctx.arc(px, py, 1.3 + e * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const tick = () => {
      ptr.x += (ptr.tx - ptr.x) * 0.18;
      ptr.y += (ptr.ty - ptr.y) * 0.18;
      ptr.a += (ptr.ta - ptr.a) * 0.12;
      draw();
      const busy = Math.abs(ptr.tx - ptr.x) > 0.3 || Math.abs(ptr.ty - ptr.y) > 0.3 || Math.abs(ptr.ta - ptr.a) > 0.01;
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ptr.tx = e.clientX - r.left;
      ptr.ty = e.clientY - r.top;
      if (ptr.a < 0.01) {
        ptr.x = ptr.tx;
        ptr.y = ptr.ty;
      }
      ptr.ta = 1;
      kick();
    };
    const onLeave = () => {
      ptr.ta = 0;
      kick();
    };

    const ro = new ResizeObserver(size);
    ro.observe(host);
    size();
    if (live) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} />;
}
