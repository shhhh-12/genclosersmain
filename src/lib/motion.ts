// One motion language for the whole site. Mirrors the CSS tokens in globals.css.

export const ease = {
  primary: [0.16, 1, 0.3, 1] as const,
  inout: [0.65, 0, 0.35, 1] as const,
  cut: [0.83, 0, 0.17, 1] as const,
};

// GSAP accepts CSS cubic-bezier strings via CustomEase, but these named eases are close matches
// and need no plugin.
export const gsapEase = {
  primary: "expo.out",
  inout: "power3.inOut",
  cut: "power4.inOut",
};

export const dur = {
  fast: 0.2,
  base: 0.45,
  slow: 0.8,
  reveal: 1.1,
};

export const stagger = 0.07;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
