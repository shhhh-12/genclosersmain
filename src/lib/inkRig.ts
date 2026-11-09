/**
 * Comic-ink character rig for the home story (side view, facing +x; flip with `facing: -1`).
 *
 * Style (reverse-engineered from the owner's reference): thick even ink outline, pure white skin,
 * one mid-grey garment with a small white pattern, flat light-grey trousers, halftone dots only on
 * accents (socks, hood), white sneakers, head about a fifth of the body, slim even-width limbs.
 * Characters are our own (a salesman and a customer), not copies of anyone's artwork.
 *
 * A skeleton (pelvis, torso, neck, head, two arms, two legs) is posed with joint angles; limbs are
 * drawn as ink tubes through the joints, so walking, pushing, sitting and the handshake are real
 * joint motion. Everything is a pure function of the pose, so scrubbing back plays the reverse.
 *
 * Angles are degrees. Limb angles are measured from straight down, + = towards the facing side.
 * Knee bend + = shin goes back. Elbow bend + = forearm swings forward/up. Torso + = leans forward.
 */

export const INK = "#151313";
export const WHITE = "#ffffff";
export const RED = "#e3101b";
const PANTS = "#d9d6d0";
const SOLE = "#b4b0aa";
const SW = 5; // outline

export const LEN = { torso: 118, neck: 14, ua: 68, fa: 62, hand: 15, th: 86, sh: 82, foot: 14 };
/** Pelvis height above the ground when standing straight. */
export const STAND_H = LEN.th + LEN.sh + LEN.foot;

export type Arm = { sh: number; el: number };
export type Leg = { hip: number; knee: number; foot: number };
export type Pose = { x: number; y: number; torso: number; head: number; arms: [Arm, Arm]; legs: [Leg, Leg] };
export type Kind = "salesman" | "customer";

const R = Math.PI / 180;
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const down = (a: number, l: number): [number, number] => [Math.sin(a * R) * l, Math.cos(a * R) * l];

/* ---------------- poses ---------------- */

export const STAND: Pose = {
  x: 0,
  y: -STAND_H,
  torso: 2,
  head: 0,
  arms: [
    { sh: -4, el: 12 },
    { sh: 6, el: 14 },
  ],
  legs: [
    { hip: -3, knee: 3, foot: 0 },
    { hip: 3, knee: 3, foot: 0 },
  ],
};

export const SEATED: Pose = {
  x: 0,
  y: 0,
  torso: 4,
  head: 4,
  arms: [
    { sh: 10, el: 60 },
    { sh: 16, el: 64 },
  ],
  legs: [
    { hip: 84, knee: 88, foot: 0 },
    { hip: 88, knee: 90, foot: 0 },
  ],
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    x: mix(a.x, b.x, t),
    y: mix(a.y, b.y, t),
    torso: mix(a.torso, b.torso, t),
    head: mix(a.head, b.head, t),
    arms: [0, 1].map((i) => ({ sh: mix(a.arms[i].sh, b.arms[i].sh, t), el: mix(a.arms[i].el, b.arms[i].el, t) })) as [Arm, Arm],
    legs: [0, 1].map((i) => ({
      hip: mix(a.legs[i].hip, b.legs[i].hip, t),
      knee: mix(a.legs[i].knee, b.legs[i].knee, t),
      foot: mix(a.legs[i].foot, b.legs[i].foot, t),
    })) as [Leg, Leg],
  };
}

/**
 * A walk cycle. `phase` in radians (2π = two steps); drive it from distance travelled so feet
 * don't slide. `lean` tilts the body (push +, pull -), `base` shifts both legs (push: legs behind).
 */
export function walk(phase: number, o: { lean?: number; base?: number; amp?: number; arms?: number; knee?: number; crouch?: number } = {}): Pose {
  const { lean = 3, base = 0, amp = 24, arms = 22, knee = 52, crouch = 0 } = o;
  const leg = (ph: number): Leg => {
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    // swing phase (leg moving forward): the knee lifts; stance: nearly straight
    const swing = Math.max(0, c);
    return { hip: base + crouch * 0.55 + amp * s + 8 * swing, knee: 4 + crouch + knee * swing * swing + 6 * Math.max(0, -s), foot: -14 * Math.max(0, -s) * (1 - swing) + 8 * swing };
  };
  const a = (ph: number): Arm => ({ sh: -arms * Math.sin(ph), el: 18 + 10 * Math.max(0, -Math.sin(ph)) });
  return {
    x: 0,
    y: -STAND_H + 6 * Math.abs(Math.sin(phase)) - 4,
    torso: lean + 1.5 * Math.cos(phase * 2),
    head: -lean * 0.55,
    arms: [a(phase), a(phase + Math.PI)],
    legs: [leg(phase + Math.PI), leg(phase)],
  };
}

/** Two-bone IK: the arm angles that put the hand on (tx, ty) from the shoulder (sx, sy). */
export function reach(sx: number, sy: number, tx: number, ty: number): Arm {
  const dx = tx - sx;
  const dy = ty - sy;
  const a = LEN.ua;
  const b = LEN.fa + LEN.hand * 0.5;
  const d = Math.min(a + b - 0.5, Math.max(Math.abs(a - b) + 1, Math.hypot(dx, dy)));
  const base = Math.atan2(dx, dy) / R;
  const alpha = Math.acos((a * a + d * d - b * b) / (2 * a * d)) / R;
  const sh = base - alpha; // elbow points down/back: natural
  const [ex, ey] = down(sh, a);
  const fa = Math.atan2(tx - (sx + ex), ty - (sy + ey)) / R;
  return { sh, el: fa - sh };
}

/* ---------------- joints ---------------- */

export function joints(p: Pose) {
  const [tx, ty] = [Math.sin(p.torso * R), -Math.cos(p.torso * R)];
  const P: [number, number] = [p.x, p.y];
  const S: [number, number] = [P[0] + tx * LEN.torso, P[1] + ty * LEN.torso];
  const N: [number, number] = [S[0] + tx * LEN.neck, S[1] + ty * LEN.neck];
  const arm = (i: number) => {
    const sh: [number, number] = [S[0] + (i ? 2 : -6), S[1] + (i ? 4 : 0)];
    const [ux, uy] = down(p.arms[i].sh, LEN.ua);
    const E: [number, number] = [sh[0] + ux, sh[1] + uy];
    const fa = p.arms[i].sh + p.arms[i].el;
    const [fx, fy] = down(fa, LEN.fa);
    const W: [number, number] = [E[0] + fx, E[1] + fy];
    const [hx, hy] = down(fa, LEN.hand);
    return { S: sh, E, W, H: [W[0] + hx, W[1] + hy] as [number, number], ang: fa };
  };
  const leg = (i: number) => {
    const hip: [number, number] = [P[0] + (i ? 4 : -6), P[1]];
    const [kx, ky] = down(p.legs[i].hip, LEN.th);
    const K: [number, number] = [hip[0] + kx, hip[1] + ky];
    const [ax, ay] = down(p.legs[i].hip - p.legs[i].knee, LEN.sh);
    const A: [number, number] = [K[0] + ax, K[1] + ay];
    return { hip, K, A, foot: p.legs[i].foot };
  };
  return { P, S, N, arms: [arm(0), arm(1)], legs: [leg(0), leg(1)] };
}

/** Lowest point of the feet relative to the pelvis (for keeping a walking figure on the ground). */
export function feetDrop(p: Pose) {
  const j = joints({ ...p, x: 0, y: 0 });
  return Math.max(j.legs[0].A[1], j.legs[1].A[1]) + LEN.foot;
}

/* ---------------- art ---------------- */

const tube = (pts: [number, number][]) => pts.map((q, i) => `${i ? "L" : "M"}${f1(q[0])} ${f1(q[1])}`).join("");

/** Pattern fills used by the rig. Put once inside the <svg>. */
export const RIG_DEFS = `
<pattern id="rig-ht" stroke="none" width="6.5" height="6.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6.5" height="6.5" fill="#ffffff"/><circle cx="3.25" cy="3.25" r="1.45" fill="#8e8a85"/></pattern>
<pattern id="rig-ht-hood" stroke="none" width="6.5" height="6.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6.5" height="6.5" fill="#e9e6e0"/><circle cx="3.25" cy="3.25" r="1.5" fill="#7d7973"/></pattern>
<pattern id="rig-shirt" stroke="none" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="34" height="34" fill="#7f7c78"/><path d="M8 6l1.6 3.4 3.7.5-2.7 2.6.7 3.7L8 14.4l-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="#fff"/><path d="M25 22l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="#fff"/></pattern>`;

// Head art, facing +x. Origin = where the neck meets the head; skull centre about (6, -46).
const SALES_HEAD = `
<path d="M-6 -4C-30 -6 -44 -30 -42 -54C-40 -80 -16 -94 10 -92C34 -90 48 -76 49 -58L50 -50L58 -38Q61 -33 53 -32Q51 -28 52 -25Q53 -21 49 -19Q51 -12 45 -8C38 -1 22 1 10 -2Z" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-6 -48c-12 -6 -14 14 -1 14" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-8 -44c-4 2 -3 6 1 6" stroke="${INK}" stroke-width="2.5" fill="none"/>
<path d="M-40 -42C-50 -74 -30 -100 4 -102C30 -106 58 -96 60 -76C62 -66 56 -60 50 -60C46 -70 34 -74 22 -70C14 -74 4 -72 -2 -66C-8 -60 -10 -52 -12 -44C-16 -40 -22 -36 -26 -30C-32 -32 -38 -36 -40 -42Z" fill="${INK}" stroke="${INK}" stroke-width="2"/>
<path d="M10 -96q22 -6 40 6" stroke="#fff" stroke-width="3" fill="none"/>`;

const CUSTOMER_HEAD = `
<circle cx="-30" cy="-84" r="19" fill="${INK}"/>
<path d="M-18 -98q-8 12 -2 26" stroke="#fff" stroke-width="3" fill="none"/>
<path d="M-6 -4C-30 -6 -44 -30 -42 -54C-40 -80 -16 -94 10 -92C34 -90 47 -76 48 -58L49 -50L56 -39Q59 -34 51 -33Q50 -29 51 -26Q52 -22 48 -20Q50 -13 44 -9C37 -2 22 1 10 -2Z" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-6 -48c-12 -6 -14 14 -1 14" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-8 -44c-4 2 -3 6 1 6" stroke="${INK}" stroke-width="2.5" fill="none"/>
<path d="M-42 -46C-50 -80 -24 -100 8 -100C36 -100 54 -86 52 -66C44 -70 36 -72 28 -70C30 -62 26 -58 20 -60C18 -66 12 -70 4 -68C-4 -64 -10 -56 -12 -46C-14 -36 -18 -26 -22 -14C-32 -16 -42 -26 -42 -46Z" fill="${INK}" stroke="${INK}" stroke-width="2"/>
<path d="M2 -94q20 -4 34 6" stroke="#fff" stroke-width="3" fill="none"/>`;

// Expressions: eye near (31, -52), brow above it, mouth at the front edge (50, -24).
const eyeOpen = (dx = 0, dy = 0) => `<ellipse cx="${31 + dx}" cy="${-52 + dy}" rx="3.4" ry="4.8" fill="${INK}"/>`;
const blush = `<path d="M14 -34l4 -7M21 -34l4 -7M28 -34l4 -7" stroke="${RED}" stroke-width="2.6"/>`;
const sweat = (x: number, y: number) => `<path d="M${x} ${y}q-8 12 0 17q8 -5 0 -17z" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
const anger = (x: number, y: number) =>
  `<path d="M${x - 10} ${y - 10}q5 6 10 6q5 0 10 -6M${x - 10} ${y + 10}q5 -6 10 -6q5 0 10 6M${x - 10} ${y - 10}q6 5 6 10q0 5 -6 10M${x + 10} ${y - 10}q-6 5 -6 10q0 5 6 10" stroke="${RED}" stroke-width="3.6" fill="none"/>`;
const grit = `<rect x="38" y="-31" width="13" height="10" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.8"/><path d="M38 -26h13M42.5 -31v10M47 -31v10" stroke="${INK}" stroke-width="1.8"/>`;

export const FACES: Record<string, string> = {
  focus: `${eyeOpen(1, 3)}<path d="M23 -63l16 2" stroke="${INK}" stroke-width="3.6"/><path d="M45 -23q3 0 6 -1" stroke="${INK}" stroke-width="3"/>`,
  neutral: `${eyeOpen(2)}<path d="M23 -64q8 -3 16 0" stroke="${INK}" stroke-width="3.6"/><path d="M45 -24q3 1 6 0" stroke="${INK}" stroke-width="3"/>`,
  startle: `<circle cx="31" cy="-53" r="7.5" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="34" cy="-53" r="2.9" fill="${INK}"/><path d="M21 -70q9 -7 19 -1" stroke="${INK}" stroke-width="3.6" fill="none"/><ellipse cx="49" cy="-23" rx="3" ry="4" fill="${INK}"/><path d="M6 -114l-4 -12M24 -117v-13M42 -112l6 -11" stroke="${INK}" stroke-width="3.6"/>`,
  angry: `<path d="M23 -52Q31 -59 39 -52Q31 -46 23 -52Z" fill="#fff" stroke="${INK}" stroke-width="2.8"/><circle cx="33" cy="-52" r="2.6" fill="${INK}"/><path d="M19 -67L41 -58" stroke="${INK}" stroke-width="5.2"/>${grit}<path d="M8 -74v8M14 -76v8M20 -74v8" stroke="${INK}" stroke-width="2.2"/>${anger(-14, -78)}`,
  talk: `${eyeOpen(2)}<path d="M23 -66q8 -3 16 0" stroke="${INK}" stroke-width="3.6"/><path d="M43 -27q5 11 10 0z" fill="${INK}" stroke="${INK}" stroke-width="2.6"/>`,
  happy: `<path d="M25 -51q6 -9 12 0" stroke="${INK}" stroke-width="4" fill="none"/><path d="M22 -66q8 -5 17 -1" stroke="${INK}" stroke-width="3.6" fill="none"/><path d="M40 -29Q47 -13 55 -28Z" fill="${INK}" stroke="${INK}" stroke-width="2.6"/><path d="M45 -20q4 -4 7 0" fill="${RED}"/>${blush}`,
  shy: `${eyeOpen(-1, 4)}<path d="M23 -61l16 -4" stroke="${INK}" stroke-width="3.6"/><path d="M44 -24q4 3 7 0" stroke="${INK}" stroke-width="3"/>${blush}${sweat(4, -80)}`,
  pushy: `<circle cx="31" cy="-53" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="35" cy="-53" r="3.2" fill="${INK}"/><path d="M19 -70q11 -11 23 -2" stroke="${INK}" stroke-width="5" fill="none"/><path d="M36 -33Q46 -8 58 -31Z" fill="#fff" stroke="${INK}" stroke-width="3.2"/><path d="M38 -29Q47 -25 56 -29M43 -32v8M50 -32v8" stroke="${INK}" stroke-width="1.8"/><path d="M64 -38l2.4 -6.4l2.4 6.4l6.4 2.4l-6.4 2.4l-2.4 6.4l-2.4 -6.4l-6.4 -2.4z" fill="${INK}"/>`,
  gentle: `<ellipse cx="32" cy="-51" rx="3.4" ry="4.4" fill="${INK}"/><path d="M26 -58q6 -3 12 0" stroke="${INK}" stroke-width="2.2" fill="none"/><path d="M23 -64q8 -3 16 0" stroke="${INK}" stroke-width="3.4" fill="none"/><path d="M42 -26q5 5 10 -1" stroke="${INK}" stroke-width="3" fill="none"/>`,
  ask: `<ellipse cx="32" cy="-52" rx="3.4" ry="4.8" fill="${INK}"/><path d="M22 -67q9 -5 17 -1" stroke="${INK}" stroke-width="3.4" fill="none"/><path d="M43 -28q5 10 9 0z" fill="${INK}" stroke="${INK}" stroke-width="2.6"/>`,
  listen: `<path d="M25 -53q6 6 12 0" stroke="${INK}" stroke-width="3.6" fill="none"/><path d="M23 -64q8 -3 16 0" stroke="${INK}" stroke-width="3.4" fill="none"/><path d="M42 -26q5 5 10 -1" stroke="${INK}" stroke-width="3" fill="none"/>`,
  // pushing hard: squeezed eye with lashes, brow down, puffed lips, effort puffs, a sweat drop
  strain: `<path d="M24 -55q8 5 15 -2" stroke="${INK}" stroke-width="3.6" fill="none"/><path d="M27 -52l-2 5M32 -50l0 5M37 -53l2 4" stroke="${INK}" stroke-width="2.2"/><path d="M21 -68L41 -60" stroke="${INK}" stroke-width="4.6"/><path d="M48 -28q7 -1 6 4q7 1 3 7" stroke="${INK}" stroke-width="3" fill="#fff"/><path d="M64 -34q6 2 0 6q6 2 0 6" stroke="${INK}" stroke-width="2.6" fill="none"/>${sweat(4, -78)}<path d="M12 -40q3 -3 6 0" stroke="${INK}" stroke-width="2.4" fill="none"/>`,
};
const OPEN_EYES = new Set(["focus", "neutral", "talk", "shy", "gentle", "ask"]);

// Torso art in the torso frame: origin = pelvis, up = -y, front = +x.
const SALES_TORSO = `
<path d="M-26 -116Q-6 -128 16 -122L20 -132H2Z" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-30 6C-38 -40 -40 -92 -26 -118Q-4 -130 20 -122C36 -108 40 -68 36 -28L38 6Q4 14 -30 6Z" fill="url(#rig-shirt)" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-6 -126L10 -110L22 -124" fill="#fff" stroke="${INK}" stroke-width="3.6"/>
<path d="M-28 -10Q4 -2 36 -10" stroke="${INK}" stroke-width="3" fill="none"/>`;
const CUSTOMER_TORSO = `
<path d="M-34 8C-46 -36 -46 -96 -28 -120Q-4 -134 22 -124C42 -108 46 -62 42 -20L44 8Q4 16 -34 8Z" fill="url(#rig-ht-hood)" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-30 -112C-48 -122 -40 -146 -14 -140L6 -126C-6 -116 -18 -112 -30 -112Z" fill="url(#rig-ht-hood)" stroke="${INK}" stroke-width="${SW}"/>
<path d="M22 -116l5 34M28 -114l6 30" stroke="${INK}" stroke-width="2.6"/>
<path d="M0 -40Q24 -36 40 -42" stroke="${INK}" stroke-width="3" fill="none"/>
<path d="M-34 -2Q4 8 44 -2" stroke="${INK}" stroke-width="3" fill="none"/>`;
// The hips/top of the trousers (pelvis frame)
const HIPS = `<path d="M-34 -8Q4 -16 40 -8L38 24Q4 32 -32 22Z" fill="${PANTS}" stroke="${INK}" stroke-width="${SW}"/>`;
// Shoe in the foot frame: ankle at the origin, toe to +x, sole on y = 14
const shoe = (tab: string) => `
<path d="M-16 -4C-18 -14 -8 -18 2 -16L24 -8C38 -4 44 2 42 9L-18 9Z" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
<path d="M-19 9H43L42 15Q12 18 -19 15Z" fill="${SOLE}" stroke="${INK}" stroke-width="4"/>
<path d="M4 -14l6 9M11 -12l6 8" stroke="${INK}" stroke-width="2.4"/>
<path d="M-17 -6l-2 13h7l1 -14z" fill="${tab}" stroke="${INK}" stroke-width="2.4"/>`;
const TIE = `<path d="M-4 0H4L6 44L0 52L-6 44Z" fill="${RED}" stroke="${INK}" stroke-width="2.8"/><path d="M-5 0H5L3 7H-3Z" fill="${RED}" stroke="${INK}" stroke-width="2.4"/>`;
const FLYER = `<g transform="rotate(-12)"><rect x="-10" y="-74" width="80" height="62" rx="3" fill="#fff" stroke="${INK}" stroke-width="${SW}"/><path d="M30 -64l5 10l11 1.5l-8 7.5l2 11l-10 -5l-10 5l2 -11l-8 -7.5l11 -1.5z" fill="${RED}" stroke="${INK}" stroke-width="2.2"/><path d="M2 -22h46M2 -16h30" stroke="${INK}" stroke-width="2.6"/></g>`;

type El = SVGElement;
const NS = "http://www.w3.org/2000/svg";
function mk(parent: Element, tag: string, attrs: Record<string, string | number> = {}, html?: string) {
  const e = document.createElementNS(NS, tag) as El;
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (html) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}

export type Rig = {
  destroy: () => void;
  update: (p: Pose, o?: { face?: string; facing?: 1 | -1; blink?: boolean; flyer?: boolean; tieSwing?: number }) => void;
  root: SVGGElement;
  joints: ReturnType<typeof joints> | null;
};

/** Build a character inside `parent` (an SVG <g>). Call `update` every frame with a pose. */
export function createRig(parent: SVGGElement, kind: Kind): Rig {
  const sales = kind === "salesman";
  const root = mk(parent, "g", { class: `rig rig-${kind}`, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" }) as SVGGElement;
  const body = mk(root, "g");
  const sleeveFill = sales ? "url(#rig-shirt)" : "url(#rig-ht-hood)";

  // limb layers, back to front: back arm, back leg, hips, torso, front leg, head, front arm
  const limb = (w: number, fill: string) => {
    const g = mk(body, "g");
    const o = mk(g, "path", { stroke: INK, "stroke-width": w + SW * 2 });
    const i = mk(g, "path", { stroke: fill, "stroke-width": w });
    return { g, o, i };
  };
  const armLayer = () => {
    const g = mk(body, "g");
    const skin = limb(sales ? 22 : 25, sales ? WHITE : sleeveFill);
    g.appendChild(skin.g);
    const sleeve = sales ? limb(31, sleeveFill) : null;
    if (sleeve) g.appendChild(sleeve.g);
    const hand = mk(g, "path", { fill: WHITE, stroke: INK, "stroke-width": SW });
    const cuff = sales ? null : mk(g, "path", { stroke: INK, "stroke-width": 3 });
    return { g, skin, sleeve, hand, cuff };
  };
  const legLayer = () => {
    const g = mk(body, "g");
    const pant = limb(33, PANTS);
    g.appendChild(pant.g);
    const sock = limb(26, "url(#rig-ht)");
    g.appendChild(sock.g);
    const foot = mk(g, "g");
    mk(foot, "g", { transform: "translate(4 2) scale(1.32)" }, shoe(sales ? RED : INK));
    return { g, pant, sock, foot };
  };

  const backArm = armLayer();
  const flyer = sales ? mk(backArm.g, "g", {}, FLYER) : null;
  const backLeg = legLayer();
  const hips = mk(body, "g", {}, HIPS);
  const torso = mk(body, "g");
  mk(torso, "g", { transform: "scale(1.14 1)" }, sales ? SALES_TORSO : CUSTOMER_TORSO);
  const tie = sales ? mk(body, "g", {}, TIE) : null;
  const frontLeg = legLayer();
  const head = mk(body, "g");
  const neck = mk(head, "path", { d: "M-10 6V-14H12V6", fill: WHITE, stroke: INK, "stroke-width": SW });
  void neck;
  mk(head, "g", {}, sales ? SALES_HEAD : CUSTOMER_HEAD);
  const face = mk(head, "g");
  const lid = mk(head, "g", { style: "display:none" }, `<ellipse cx="31" cy="-52" rx="7" ry="7.5" fill="#fff"/><path d="M24 -51q7 4 14 0" stroke="${INK}" stroke-width="3.4" fill="none"/>`);
  const frontArm = armLayer();
  body.appendChild(frontArm.g);

  let curFace = "";
  const rig: Rig = { root, joints: null, update: () => {}, destroy: () => root.remove() };

  rig.update = (p, o = {}) => {
    const { face: fname = sales ? "gentle" : "focus", facing = 1, blink = false, flyer: showFlyer = false, tieSwing = 0 } = o;
    const j = joints(p);
    rig.joints = j;
    root.setAttribute("transform", facing === 1 ? "" : `scale(-1 1)`);

    const setLimb = (L: { o: El; i: El }, d: string) => {
      L.o.setAttribute("d", d);
      L.i.setAttribute("d", d);
    };
    const drawArm = (A: typeof backArm, a: (typeof j.arms)[0]) => {
      setLimb(A.skin, tube([a.S, a.E, a.W]));
      if (A.sleeve) setLimb(A.sleeve, tube([a.S, [a.S[0] + (a.E[0] - a.S[0]) * 0.5, a.S[1] + (a.E[1] - a.S[1]) * 0.5]]));
      // a round mitten hand at the end of the forearm
      const ang = a.ang;
      const hc = [a.W[0] + (a.H[0] - a.W[0]) * 0.55, a.W[1] + (a.H[1] - a.W[1]) * 0.55];
      A.hand.setAttribute("d", `M${f1(hc[0] - 11)} ${f1(hc[1])}a11 11 0 1 0 22 0a11 11 0 1 0 -22 0Z`);
      if (A.cuff) {
        const [cx, cy] = [a.W[0] - (a.H[0] - a.W[0]) * 0.1, a.W[1] - (a.H[1] - a.W[1]) * 0.1];
        const nx = Math.cos(ang * R) * 13;
        const ny = -Math.sin(ang * R) * 13;
        A.cuff.setAttribute("d", `M${f1(cx + nx)} ${f1(cy + ny)}L${f1(cx - nx)} ${f1(cy - ny)}`);
      }
    };
    const drawLeg = (Lg: typeof backLeg, l: (typeof j.legs)[0]) => {
      setLimb(Lg.pant, tube([l.hip, l.K, l.A]));
      const up: [number, number] = [l.A[0] + (l.K[0] - l.A[0]) * 0.2, l.A[1] + (l.K[1] - l.A[1]) * 0.2];
      setLimb(Lg.sock, tube([l.A, up]));
      Lg.foot.setAttribute("transform", `translate(${f1(l.A[0])} ${f1(l.A[1])}) rotate(${f1(-l.foot)})`);
    };

    drawArm(backArm, j.arms[0]);
    if (flyer) {
      flyer.setAttribute("style", showFlyer ? "" : "display:none");
      flyer.setAttribute("transform", `translate(${f1(j.arms[0].H[0])} ${f1(j.arms[0].H[1])})`);
    }
    drawLeg(backLeg, j.legs[0]);
    drawLeg(frontLeg, j.legs[1]);
    hips.setAttribute("transform", `translate(${f1(j.P[0])} ${f1(j.P[1])}) rotate(${f1(p.torso * 0.35)})`);
    torso.setAttribute("transform", `translate(${f1(j.P[0])} ${f1(j.P[1])}) rotate(${f1(p.torso)})`);
    if (tie) {
      // the tie hangs from the collar and swings back when he moves
      const [cx, cy] = [j.S[0] + Math.cos(p.torso * R) * 14, j.S[1] + Math.sin(p.torso * R) * 14 + 6];
      tie.setAttribute("transform", `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(tieSwing)})`);
    }
    head.setAttribute("transform", `translate(${f1(j.N[0])} ${f1(j.N[1])}) rotate(${f1(p.torso * 0.5 + p.head)})`);
    drawArm(frontArm, j.arms[1]);

    if (fname !== curFace) {
      curFace = fname;
      face.innerHTML = FACES[fname] ?? "";
    }
    lid.setAttribute("style", blink && OPEN_EYES.has(fname) ? "" : "display:none");
  };
  return rig;
}

/** Blink timing: closed for ~0.12 s every few seconds (deterministic in t). */
export const blinkAt = (t: number, seed = 0) => (t + seed * 1.37) % 3.7 < 0.12;
