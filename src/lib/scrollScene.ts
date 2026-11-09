// Scroll scenes: a tall section with a CSS `position: sticky` stage inside, driven by ONE progress
// number (0..1). The number is damped: each frame it eases toward the real scroll position,
// frame-rate independent (p += (target - p) * (1 - e^(-dt / tau))). Mouse-wheel steps and direction
// changes come out smooth, and since every visual is a pure function of p, scrolling back plays the
// exact reverse. The rAF loop only runs while p is catching up.
//
// Pinning is native sticky (no JS pin, no pin-spacer), so nothing jumps.

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** 0..1 position of p inside [a, b]. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Options = {
  /** Damping time constant in ms (higher = softer). */
  tau?: number;
  /** Called when the layout may have changed (resize, fonts). Measure here. */
  onMeasure?: () => void;
};

/**
 * Start a scene on `section` (its height minus one viewport is the scroll range).
 * `render(p)` is called with the damped progress. Returns a cleanup function.
 */
export function createScrollScene(section: HTMLElement, render: (p: number) => void, { tau = 110, onMeasure }: Options = {}) {
  let target = 0;
  let p = 0;
  let raf = 0;
  let last = 0;

  const read = () => {
    const r = section.getBoundingClientRect();
    const range = Math.max(1, section.offsetHeight - window.innerHeight);
    return clamp01(-r.top / range);
  };

  const frame = (now: number) => {
    const dt = Math.min(48, now - last || 16);
    last = now;
    p += (target - p) * (1 - Math.exp(-dt / tau));
    if (Math.abs(target - p) < 2e-4) p = target;
    render(p);
    raf = p === target ? 0 : requestAnimationFrame(frame);
  };

  const onScroll = () => {
    target = read();
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const remeasure = () => {
    onMeasure?.();
    target = p = read(); // jump straight to the right state after a layout change
    render(p);
  };

  remeasure();
  const ro = new ResizeObserver(remeasure);
  ro.observe(section);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", remeasure);
  document.fonts?.ready.then(remeasure).catch(() => {});

  return {
    remeasure,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
    },
  };
}
