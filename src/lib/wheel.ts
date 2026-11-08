// Flat 2D spoke wheel (home intro, home hero, course journey).
// Rebuilt from video/json videos/List-16-9 (1).json. Reference canvas 1920x1080, font-size 190px:
//   pivot P = (-826, 540); each word is a spoke starting R = 1362px right of P (active word's
//   left edge at x = 536); words are 7.5deg apart; the wheel turns -7.5deg per beat.
// Everything below is in em (relative to the wheel's font-size) so it scales with the screen.
// No 3D: words only rotate around the off-screen pivot. Dimming is opacity + blur only.

const REF_FONT = 190;

export const WHEEL = {
  /** Degrees between neighbouring words. */
  step: 7.5,
  /** Spoke radius: pivot to the word's left edge. */
  radiusEm: 1362 / REF_FONT,
  /** Arrow: left edge and width relative to the word's left edge. */
  arrowLeftEm: -(536 - 344) / REF_FONT,
  arrowWidthEm: (485 - 344) / REF_FONT,
  /** Beat: 30 frames of motion + 15 frames hold, at 60fps. */
  fps: 60,
  beatFrames: 45,
  moveFrames: 30,
  /** Home intro + hero: a longer hold (30 move + 38 hold) so each word's sketch can be read. */
  sketchBeatFrames: 68,
  /** Blur per slot away from the centre (px at the reference size), capped at 6 slots. */
  blurPerSlotPx: 5,
  /** The word drawn in red. */
  redHex: "#ff0000",
};

// cubic-bezier(0.5, 0, 0, 1)
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dsx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = sx(t) - x;
      const ds = dsx(t);
      if (Math.abs(d) < 1e-5 || Math.abs(ds) < 1e-6) break;
      t -= d / ds;
    }
    t = Math.min(1, Math.max(0, t));
    return sy(t);
  };
}
export const wheelEase = bezier(0.5, 0, 0, 1);

// Outward kick along the word's own spoke, from the file: [frame, px at reference size]
const KICK: [number, number][] = [
  [0, 0],
  [9, 38.6],
  [11.8, 43.1],
  [16.4, 17.6],
  [21, 4.8],
  [30, 0],
];
/** Kick offset in em, `f` frames after the kick starts. */
export function kickEm(f: number) {
  if (f <= 0 || f >= 30) return 0;
  for (let k = 1; k < KICK.length; k++) {
    const [f1, v1] = KICK[k];
    if (f <= f1) {
      const [f0, v0] = KICK[k - 1];
      const u = (f - f0) / (f1 - f0);
      const s = u * u * (3 - 2 * u); // smooth between keys
      return (v0 + (v1 - v0) * s) / REF_FONT;
    }
  }
  return 0;
}

/** Where the wheel is `frame` frames after it started on word `start`. */
export function beatState(frame: number, start: number, beat: number = WHEEL.beatFrames) {
  const b = Math.floor(frame / beat);
  const t = frame - b * beat;
  const e = wheelEase(Math.min(1, t / WHEEL.moveFrames));
  return {
    pos: start + b + e,
    arriving: start + b + 1,
    arrowKick: kickEm(t - 3), // the arrow kicks 3 frames into each beat
    wordKick: kickEm(t - 6), // the arriving word kicks 6 frames in
  };
}

type RenderOpts = {
  /** true = endless wheel (intro/hero). false = a list with a start and an end (journey). */
  wrap?: boolean;
  /** Outward kick (em) for the word with index `kickIndex`. */
  kick?: number;
  kickIndex?: number;
};

/** Place every word for wheel position `pos` (fractional index of the word on the centre line). */
export function renderWheel(els: HTMLElement[], pos: number, n: number, { wrap = true, kick = 0, kickIndex = -1 }: RenderOpts = {}) {
  const half = (n * WHEEL.step) / 2; // wrap angle: 45deg for 12 words
  const fontPx = els[0] ? parseFloat(getComputedStyle(els[0]).fontSize) || REF_FONT : REF_FONT;
  const blurScale = (WHEEL.blurPerSlotPx * fontPx) / REF_FONT;
  const ki = ((kickIndex % n) + n) % n;
  for (const el of els) {
    const i = Number(el.dataset.i);
    let s = i - pos; // slots from the centre
    if (wrap) {
      s = ((s % n) + n) % n;
      if (s * WHEEL.step >= half) s -= n; // past -45deg jumps to +45deg (off screen)
    }
    const a = Math.abs(s);
    const angle = s * WHEEL.step;
    // Active word 100%, every other word 50%
    let opacity = 0.5 + 0.5 * (1 - Math.min(a, 1));
    // Fade out just before the wrap point (only visible on tall phone screens)
    if (wrap) opacity *= Math.min(1, Math.max(0, (half - Math.abs(angle)) / (half * 0.3)));
    if (!wrap && a > 4) opacity = 0;
    const k = i === ki ? kick : 0;
    el.style.transform = `rotate(${angle}deg) translateX(${k}em)`;
    el.style.setProperty("--o", opacity.toFixed(3));
    el.style.filter = a < 0.02 ? "none" : `blur(${(Math.min(a, 6) * blurScale).toFixed(2)}px)`;
  }
}

/**
 * Move the wheel so the active word's capitals (not its line box) are centred on the
 * container's middle line, which is also where the intro slice runs.
 */
export function centreOnCaps(anchor: HTMLElement, sample: HTMLElement) {
  const cs = getComputedStyle(sample);
  const px = parseFloat(cs.fontSize);
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !px) return;
  ctx.font = `${cs.fontWeight} ${px}px ${cs.fontFamily}`;
  const m = ctx.measureText("Handle");
  const A = m.fontBoundingBoxAscent;
  const D = m.fontBoundingBoxDescent;
  const cap = ctx.measureText("H").actualBoundingBoxAscent;
  if (!A || !cap) return;
  const lineH = parseFloat(cs.lineHeight) || px;
  const baselineFromTop = (lineH - (A + D)) / 2 + A;
  const offset = baselineFromTop - cap / 2 - lineH / 2; // cap centre below box centre
  anchor.style.transform = `translateY(${(-offset).toFixed(2)}px)`;
  // The arrow (and any brand line) centres on the capitals too
  anchor.style.setProperty("--cap-off", `${offset.toFixed(2)}px`);
}
