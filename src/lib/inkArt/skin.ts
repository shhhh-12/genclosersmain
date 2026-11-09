/**
 * Continuous limbs, drawn fresh every frame like an artist would draw them (no rigid segments,
 * no joint caps): one shape from shoulder to wrist (or hip to ankle) that follows the joints,
 * bulges where muscles are, rounds the elbow/knee, and creases on the inside of a bend.
 *
 * Ink is a brush line: an outer band whose thickness varies along the limb and is heavier on the
 * shadow side (light from the top-left), with a slight hand-drawn swell. Clothing (sleeves,
 * trouser legs, cuffs, socks) is drawn over the limb from the same spine, so it wraps the bend.
 * Pure function of the joints, so scrubbing backwards draws the exact reverse.
 */
import { taperD } from "./pen";

type P = [number, number];
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

/** Width profile: [t, width] keys along the limb (t 0..1 by length), smoothly interpolated. */
export type Profile = readonly (readonly [number, number])[];
const sm = (u: number) => u * u * (3 - 2 * u);
function widthAt(pr: Profile, t: number) {
  if (t <= pr[0][0]) return pr[0][1];
  for (let i = 1; i < pr.length; i++) {
    if (t <= pr[i][0]) {
      const [t0, w0] = pr[i - 1];
      const [t1, w1] = pr[i];
      return w0 + (w1 - w0) * sm((t - t0) / (t1 - t0 || 1));
    }
  }
  return pr[pr.length - 1][1];
}

/** The limb's centre line: two bones with the joint rounded off (no kink, no overshoot). */
export function spineOf(a: P, j: P, b: P, n = 30) {
  const la = Math.hypot(j[0] - a[0], j[1] - a[1]) || 1;
  const lb = Math.hypot(b[0] - j[0], b[1] - j[1]) || 1;
  const ua: P = [(j[0] - a[0]) / la, (j[1] - a[1]) / la];
  const ub: P = [(b[0] - j[0]) / lb, (b[1] - j[1]) / lb];
  const r = Math.min(la, lb) * 0.32;
  const p1: P = [j[0] - ua[0] * r, j[1] - ua[1] * r];
  const p2: P = [j[0] + ub[0] * r, j[1] + ub[1] * r];
  const pts: P[] = [];
  const total = la - r + r * 1.6 + lb - r; // rough length for even spacing
  const nA = Math.max(3, Math.round((n * (la - r)) / total));
  const nJ = Math.max(4, Math.round((n * r * 1.6) / total));
  const nB = Math.max(3, n - nA - nJ);
  for (let i = 0; i < nA; i++) pts.push([a[0] + (p1[0] - a[0]) * (i / nA), a[1] + (p1[1] - a[1]) * (i / nA)]);
  for (let i = 0; i < nJ; i++) {
    const t = i / nJ, u = 1 - t;
    pts.push([u * u * p1[0] + 2 * u * t * j[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * j[1] + t * t * p2[1]]);
  }
  for (let i = 0; i <= nB; i++) pts.push([p2[0] + (b[0] - p2[0]) * (i / nB), p2[1] + (b[1] - p2[1]) * (i / nB)]);
  // arc-length parameter
  const ts = [0];
  for (let i = 1; i < pts.length; i++) ts.push(ts[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = ts[ts.length - 1] || 1;
  // where the joint sits along the limb, and how much it bends (+ = bends toward the left normal)
  const cross = ua[0] * ub[1] - ua[1] * ub[0];
  const bend = Math.asin(Math.max(-1, Math.min(1, cross)));
  return { pts, t: ts.map((x) => x / L), tJoint: (la - r * 0.2) / L, bend, len: L };
}
export type Spine = ReturnType<typeof spineOf>;

function normals(pts: P[]) {
  return pts.map((_, i) => {
    const p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)];
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l] as P; // left normal
  });
}

/** Smooth closed path through points (quadratic through midpoints). */
function smoothClosed(pts: P[]) {
  const n = pts.length;
  const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${f1(mid(pts[n - 1], pts[0])[0])} ${f1(mid(pts[n - 1], pts[0])[1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], m = mid(p, pts[(i + 1) % n]);
    d += `Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`;
  }
  return d + "Z";
}

export type InkStyle = { w: number; facing: 1 | -1; seed?: number };

/**
 * A band of the limb from t0 to t1 with a width profile (profile t is 0..1 over the whole limb).
 * Returns the fill outline, the brush ink around it, and the halftone shadow strip.
 */
export function band(sp: Spine, t0: number, t1: number, prof: Profile, ink: InkStyle, caps: [boolean, boolean] = [true, true]) {
  const idx = sp.t.map((t, i) => [t, i] as const).filter(([t]) => t >= t0 - 1e-6 && t <= t1 + 1e-6).map(([, i]) => i);
  if (idx.length < 2) return { fill: "", ink: "", shade: "" };
  const pts = idx.map((i) => sp.pts[i]);
  const ts = idx.map((i) => sp.t[i]);
  const nr = normals(pts);
  const seed = ink.seed ?? 0;
  // light from the top-left: the side whose outward normal points down/right gets the heavier line
  const shadowOf = (n: P) => Math.max(0, Math.min(1, (n[0] * ink.facing * 0.55 + n[1] * 0.83) * 0.5 + 0.5));
  const L: P[] = [], R: P[] = [], LI: P[] = [], RI: P[] = [], SH: P[] = [];
  pts.forEach((p, i) => {
    const t = ts[i];
    const w = widthAt(prof, t) / 2;
    const n = nr[i];
    const swell = 1 + 0.14 * Math.sin(t * 17 + seed) + 0.08 * Math.sin(t * 41 + seed * 2.3);
    const wl = ink.w * (0.55 + 0.85 * shadowOf(n)) * swell;
    const wr = ink.w * (0.55 + 0.85 * shadowOf([-n[0], -n[1]])) * swell;
    L.push([p[0] + n[0] * w, p[1] + n[1] * w]);
    R.push([p[0] - n[0] * w, p[1] - n[1] * w]);
    LI.push([p[0] + n[0] * (w + wl), p[1] + n[1] * (w + wl)]);
    RI.push([p[0] - n[0] * (w + wr), p[1] - n[1] * (w + wr)]);
    // shadow strip: the inner 40% on the darker side
    const darkLeft = shadowOf(n) > 0.5;
    const s = darkLeft ? 1 : -1;
    SH.push([p[0] + n[0] * s * w * 0.15, p[1] + n[1] * s * w * 0.15]);
  });
  const cap = (c: P, from: P, to: P, dir: P, out: P[]) => {
    // half circle from `from` to `to` bulging along `dir`
    for (let k = 1; k < 6; k++) {
      const a = (k / 6) * Math.PI;
      const ux = (from[0] - c[0]), uy = (from[1] - c[1]);
      const r = Math.hypot(ux, uy) || 1;
      out.push([c[0] + ux * Math.cos(a) + dir[0] * r * Math.sin(a), c[1] + uy * Math.cos(a) + dir[1] * r * Math.sin(a)]);
    }
    void to;
  };
  const tan = (i: number): P => {
    const p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [(q[0] - p[0]) / l, (q[1] - p[1]) / l];
  };
  const outline = (A: P[], B: P[]) => {
    const o: P[] = [...A];
    const e = pts.length - 1;
    if (caps[1]) cap(pts[e], A[e], B[e], tan(e), o);
    o.push(...[...B].reverse());
    if (caps[0]) { const t0v = tan(0); cap(pts[0], B[0], A[0], [-t0v[0], -t0v[1]], o); }
    return o;
  };
  const shadeSide = shadowOf(nr[Math.floor(nr.length / 2)]) > 0.5 ? L : R;
  return {
    fill: smoothClosed(outline(L, R)),
    ink: smoothClosed(outline(LI, RI)),
    shade: smoothClosed([...shadeSide, ...[...SH].reverse()]),
  };
}

/** Crease lines on the inside of a bent joint (more lines the harder it bends). */
export function creases(sp: Spine, prof: Profile, w: number) {
  const b = sp.bend;
  const amt = Math.min(1, Math.abs(b) / 1.2);
  if (amt < 0.12) return "";
  const i0 = sp.t.findIndex((t) => t >= sp.tJoint);
  if (i0 < 1) return "";
  const nr = normals(sp.pts);
  const s = Math.sign(b); // inner side = toward the left normal when bending left
  let d = "";
  const lines = amt > 0.55 ? 2 : 1;
  for (let k = 0; k < lines; k++) {
    const i = Math.min(sp.pts.length - 2, Math.max(1, i0 + (k ? 2 : -1)));
    const p = sp.pts[i], n = nr[i];
    const half = widthAt(prof, sp.t[i]) / 2;
    const depth = half * (0.35 + 0.45 * amt);
    const tx = -n[1], ty = n[0];
    const start: P = [p[0] + n[0] * s * half * 0.98, p[1] + n[1] * s * half * 0.98];
    const end: P = [p[0] + n[0] * s * (half - depth), p[1] + n[1] * s * (half - depth)];
    const ctrl: P = [(start[0] + end[0]) / 2 + tx * 4 * s, (start[1] + end[1]) / 2 + ty * 4 * s];
    const pts: P[] = Array.from({ length: 8 }, (_, j) => {
      const t = j / 7, u = 1 - t;
      return [u * u * start[0] + 2 * u * t * ctrl[0] + t * t * end[0], u * u * start[1] + 2 * u * t * ctrl[1] + t * t * end[1]];
    });
    d += taperD(pts, w * (k ? 0.8 : 1), 0.9, 0);
  }
  return d;
}

/** A tapered line across the limb at t (a hem, a cuff edge), slightly curved toward the end. */
export function across(sp: Spine, t: number, prof: Profile, w: number, sag = 3) {
  const i = Math.max(1, Math.min(sp.pts.length - 2, sp.t.findIndex((x) => x >= t)));
  const p = sp.pts[i];
  const nr = normals(sp.pts)[i];
  const half = widthAt(prof, sp.t[i]) / 2;
  const tx = -nr[1], ty = nr[0]; // along the limb (toward the end)
  const a: P = [p[0] + nr[0] * half, p[1] + nr[1] * half];
  const b: P = [p[0] - nr[0] * half, p[1] - nr[1] * half];
  const c: P = [p[0] - tx * sag, p[1] - ty * sag];
  const pts: P[] = Array.from({ length: 9 }, (_, j) => {
    const s = j / 8, u = 1 - s;
    return [u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]];
  });
  return taperD(pts, w, 0.5, 0.5);
}

/** A short fold line along the limb, on one side (side: +1 left, -1 right), from t0 to t1. */
export function fold(sp: Spine, t0: number, t1: number, prof: Profile, side: number, inset: number, w: number) {
  const nr = normals(sp.pts);
  const pts: P[] = [];
  sp.t.forEach((t, i) => {
    if (t < t0 || t > t1) return;
    const half = widthAt(prof, t) / 2;
    const k = (t - t0) / (t1 - t0 || 1);
    const o = half * (inset + 0.12 * Math.sin(k * Math.PI));
    pts.push([sp.pts[i][0] + nr[i][0] * side * o, sp.pts[i][1] + nr[i][1] * side * o]);
  });
  return pts.length > 2 ? taperD(pts, w, 0, 0) : "";
}
