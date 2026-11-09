/**
 * Drawing helpers for the comic-ink art (see .claude/skills/comic-ink-style/SKILL.md).
 *
 * - `inked(d, fill)`: a filled shape with a thick outline that grows OUTWARD only
 *   (outline copy behind, fill on top), so overlapping parts read as clean overlap lines.
 * - `taper(pts, w)`: a brush line: a filled shape, thick in the middle, pointed at the ends.
 *   Used for every interior detail (folds, fingers, brows, mouths) instead of round-capped strokes.
 */

export const INK = "#151313";
export const WHITE = "#ffffff";
export const RED = "#e3101b";
export const LIGHT = "#d9d6d0"; // trousers
export const MID = "#8e8a85"; // halftone dots, soles
export const SW = 6; // silhouette weight (rig units)

type P = [number, number];
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

/** Filled shape with an outward ink outline of weight `w`. */
export const inked = (d: string, fill: string = WHITE, w: number = SW) =>
  `<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="${w * 2}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`;

/** Plain ink fill (hair masses, pupils). */
export const ink = (d: string, fill: string = INK) => `<path d="${d}" fill="${fill}"/>`;

/** Sample a quadratic bezier. */
export const q = (a: P, c: P, b: P, n = 12): P[] =>
  Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1), u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  });

/** Sample a cubic bezier. */
export const c = (a: P, c1: P, c2: P, b: P, n = 14): P[] =>
  Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1), u = 1 - t;
    return [
      u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0],
      u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1],
    ];
  });

/**
 * Brush line along `pts`, max width `w`. `a`/`b` = how much width survives at the start/end
 * (0 = sharp point, 1 = full width), so taper(pts, 4, 1, 0) is a "comma" stroke.
 */
export function taperD(pts: P[], w: number, a = 0, b = 0): string {
  const n = pts.length;
  const L: P[] = [], R: P[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(n - 1, i + 1)];
    let dx = next[0] - prev[0], dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const half = (w / 2) * Math.max(Math.pow(Math.sin(Math.PI * t), 0.55), a + (b - a) * t, 0.06);
    L.push([pts[i][0] - dy * half, pts[i][1] + dx * half]);
    R.push([pts[i][0] + dy * half, pts[i][1] - dx * half]);
  }
  const all = [...L, ...R.reverse()];
  return all.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join("") + "Z";
}
export const taper = (pts: P[], w: number, a = 0, b = 0, fill: string = INK) => `<path d="${taperD(pts, w, a, b)}" fill="${fill}"/>`;

/**
 * Capsule (rounded finger / sausage) path from (x, y), length `len`, width `w`, pointing at angle
 * `a` (degrees, measured from +y toward +x, like the rig's limb angles).
 */
export function capsule(x: number, y: number, len: number, w: number, a: number): string {
  const r = w / 2, R = Math.PI / 180;
  const dx = Math.sin(a * R), dy = Math.cos(a * R);
  const nx = dy * r, ny = -dx * r;
  const x1 = x + dx * len, y1 = y + dy * len;
  return `M${f1(x + nx)} ${f1(y + ny)}L${f1(x1 + nx)} ${f1(y1 + ny)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x1 - nx)} ${f1(y1 - ny)}L${f1(x - nx)} ${f1(y - ny)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x + nx)} ${f1(y + ny)}Z`;
}

/** Shadow area filled with halftone dots (put inside the shape it shades). */
export const shade = (d: string, id = "ia-dots") => `<path d="${d}" fill="url(#${id})"/>`;

/** Patterns used by the art. Insert once in the <svg> (FriendStory already injects RIG_DEFS). */
export const ART_DEFS = `
<pattern id="ia-dots" stroke="none" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3" cy="3" r="1.35" fill="${MID}"/></pattern>
<pattern id="ia-dots-dark" stroke="none" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3" cy="3" r="1.7" fill="${INK}" fill-opacity="0.55"/></pattern>
<pattern id="ia-shirt" stroke="none" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="36" height="36" fill="#868380"/><path d="M9 5l1.7 3.6 3.9.5-2.9 2.7.8 3.9L9 13.8l-3.5 1.9.8-3.9-2.9-2.7 3.9-.5z" fill="#fff"/><path d="M27 22l1.7 3.6 3.9.5-2.9 2.7.8 3.9-3.5-1.9-3.5 1.9.8-3.9-2.9-2.7 3.9-.5z" fill="#fff"/></pattern>
<pattern id="ia-sock" stroke="none" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><circle cx="2.5" cy="2.5" r="1.25" fill="${MID}"/></pattern>`;
