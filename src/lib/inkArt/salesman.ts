/**
 * The GenClosers salesman: an ORIGINAL character drawn in a chunky comic-ink style
 * (style permission from the reference artist; his character, face and outfit are not used).
 *
 * Design: messy quiff, thick brows, big nose, wide grin; baggy white shirt with rolled sleeves and
 * a loose red tie; cuffed chinos; halftone socks; chunky white sneakers with a red heel tab.
 * Proportions: big head (HEAD_SCALE), chunky limbs, big hands (HAND_SCALE) and shoes.
 *
 * Every part is drawn in its bone's local frame (see inkRig2.ts):
 *   limbs   origin = proximal joint, +y runs along the bone, +x = facing side
 *   torso   origin = pelvis, up = -y, front = +x
 *   head    origin = where the neck meets the head, front = +x (drawn at 1x, scaled by HEAD_SCALE)
 *   shoe    origin = ankle, toe to +x
 */
import { inked, ink, taper, shade, q, c, WHITE, RED, LIGHT, INK } from "./pen";

export const HEAD_SCALE = 1.32;
export const HAND_SCALE = 1.45;

/* ---------------- body ---------------- */

/** Baggy white shirt: blouses over the waist, folds from the armpit, chest pocket, collar. */
export const TORSO =
  inked("M-38 10C-48 -30 -50 -88 -34 -120Q-6 -136 26 -128C46 -112 54 -72 47 -32C52 -16 52 0 47 10Q4 20 -38 10Z") +
  shade("M30 -112C44 -92 50 -64 44 -32C49 -16 49 -2 46 8Q30 14 14 15C34 -10 40 -60 30 -112Z") +
  shade("M-40 -6C-30 4 -6 10 20 10Q-2 18 -36 10Z") +
  taper(c([-30, -104], [-14, -84], [0, -70], [20, -62]), 3) + // armpit pull folds
  taper(c([-26, -88], [-12, -74], [2, -62], [16, -56]), 2.4) +
  taper(q([-24, -30], [-14, -16], [-20, 2]), 3) + // waist blouse folds
  taper(q([4, -26], [12, -12], [6, 6]), 3) +
  taper(q([30, -30], [38, -14], [32, 4]), 2.6) +
  inked("M18 -98H38L36 -78Q27 -74 19 -78Z", WHITE, 3.4) + // chest pocket
  taper(q([19, -92], [28, -90], [37, -92]), 2) +
  taper(c([-35, -20], [-42, -60], [-40, -96], [-28, -116]), 3.6, 0, 0, WHITE) + // rim light
  inked("M-30 -122Q-8 -136 22 -128L28 -138H0Z") + // collar band
  inked("M2 -134L-8 -112L-24 -126Z", WHITE, 4) + // back collar point
  inked("M2 -134L14 -110L30 -128Z", WHITE, 4); // front collar point

export const HIPS =
  inked("M-38 -6Q4 -16 48 -6L46 26Q4 36 -36 24Z", LIGHT) +
  shade("M32 -6Q42 -6 47 -5L45 24Q38 27 30 28C34 16 34 4 32 -6Z") +
  taper(q([-4, 8], [6, 16], [18, 14]), 2.6);

/** Loose red tie, a bit crooked, with a highlight. */
export const TIE =
  inked("M-6 0H6L4 9H-4Z", RED, 3.4) +
  inked("M-4 9H4L9 58L1 68L-7 57Z", RED, 3.4) +
  taper(q([-1, 14], [0, 36], [-2, 54]), 2, 0, 0, WHITE) +
  taper(q([3, 30], [5, 40], [4, 52]), 1.6);

export const NECK = inked("M-13 8V-16H15V8Z") + shade("M3 -16H15V4Q8 0 3 -6Z");

/** Upper arm = the baggy sleeve down to the rolled cuff (elbow at y = 68). */
export const UPPER_ARM =
  inked("M-18 -14C-20 10 -19 34 -16 54L16 54C19 34 20 10 18 -14Z") +
  shade("M8 -10C13 10 14 32 12 52L15 52C17 32 18 10 16 -10Z") +
  taper(q([-8, 8], [-2, 22], [-6, 38]), 2.6) +
  taper(q([6, 14], [10, 28], [7, 44]), 2.2);
/** Rolled cuff, drawn over the elbow. */
export const SLEEVE =
  `<g>${inked("M-17 46Q0 52 17 46L16 64Q0 70 -16 64Z")}${taper(q([-16, 55], [0, 60], [16, 55]), 2.4)}${taper([[-6, 49], [-5, 66]], 1.8)}${taper([[7, 49], [8, 66]], 1.8)}</g>`;
/** Forearm: chunky, tapering to the wrist; the hand hangs at (0, FOREARM_HAND). */
export const FOREARM =
  inked("M-12 0a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z") +
  inked("M-12 -2C-13 18 -11 40 -9 60L9 60C11 40 13 18 12 -2Z") +
  taper(q([4, 10], [8, 24], [5, 38]), 2.2) +
  taper(q([-6, 44], [-3, 50], [-4, 56]), 1.6);
export const FOREARM_HAND = 56;

/** Baggy chinos: rounded hip end, rounded knee end. */
export const THIGH =
  inked("M-21 0C-21 -15 21 -15 21 0C22 30 20 62 18 88C17 103 -17 103 -18 88C-20 62 -22 30 -21 0Z", LIGHT) +
  shade("M8 -6C14 26 15 60 11 94Q15 94 18 88C20 60 21 26 19 -6Z") +
  taper(q([2, 4], [8, 20], [4, 36]), 2.6) +
  taper(q([-14, 70], [-6, 80], [4, 80]), 2.8) +
  taper(q([-12, 82], [-4, 90], [6, 90]), 2.2);
/** Shin: knee cap, trouser leg, rolled hem, halftone sock to the ankle (y = 82). */
export const SHIN =
  inked("M-13 62L-12.5 86L12.5 86L13 62Z", "url(#ia-sock)") +
  taper(q([-12, 72], [0, 74], [12, 72]), 1.8) +
  inked("M-17 0a17 17 0 1 0 34 0a17 17 0 1 0 -34 0Z", LIGHT) +
  inked("M-18 0C-18 22 -17 42 -16 56L16 56C17 42 18 22 18 0Z", LIGHT) +
  shade("M6 -2C11 20 12 40 11 54L15 54C16 40 17 20 16 -2Z") +
  inked("M-18 52L18 52L18 66L-18 66Z", LIGHT) + // rolled hem
  taper(q([-17, 59], [0, 61], [17, 59]), 2.2) +
  taper(q([-8, 26], [-3, 36], [2, 38]), 2.4);
export const SHIN_ANKLE = 82;

/** Chunky sneaker, ankle at the origin. */
export const SHOE =
  `<g transform="scale(1.22)">` +
  inked("M-20 -6C-24 -20 -10 -26 4 -22L30 -12C48 -8 58 0 56 10L-22 10Z") +
  inked("M-24 10H58C59 14 58 18 54 20Q16 24 -24 20Z", "#c9c5bf", 5) +
  taper(q([-22, 15], [16, 18], [56, 15]), 1.6) +
  taper(q([36, -6], [43, 3], [38, 10]), 2.4) +
  taper(q([4, -20], [9, -13], [15, -11]), 2.6) +
  taper(q([12, -17], [17, -10], [23, -8]), 2.6) +
  inked("M-22 -8L-24 8H-14L-12 -10Z", RED, 4) +
  taper(c([-4, 2], [10, -6], [26, -2], [40, 2]), 2.8) +
  taper(q([-8, -16], [4, -22], [20, -16]), 2.4, 0, 0, WHITE) +
  `</g>`;

/* ---------------- heads (drawn at 1x; the rig scales them by HEAD_SCALE) ---------------- */

export type View = "profile" | "threeQuarter" | "front";

// Messy quiff, profile: swept up and forward over the forehead, short at the back.
const QUIFF_PROFILE =
  ink("M-42 -46C-50 -72 -42 -98 -18 -108C-4 -114 14 -112 24 -106C34 -120 56 -122 70 -108C62 -106 58 -102 58 -98C66 -98 70 -92 68 -86C60 -90 52 -88 48 -82C42 -86 32 -86 26 -82C18 -86 6 -84 0 -78C-6 -72 -8 -64 -10 -54C-14 -48 -20 -42 -26 -38C-32 -40 -40 -44 -42 -46Z") +
  taper(q([54, -112], [66, -110], [72, -100]), 4, 1, 0) + // loose strands
  taper(q([60, -98], [70, -94], [72, -84]), 3.4, 1, 0) +
  taper(c([-30, -84], [-12, -106], [20, -110], [46, -106]), 6, 0, 0, WHITE) + // highlight
  taper(q([28, -112], [44, -118], [60, -112]), 3, 0, 0, WHITE) +
  taper(q([-24, -66], [-10, -88], [12, -94]), 2.2, 0, 0, WHITE);

export const HEADS: Record<View, string> = {
  profile:
    inked("M-8 -2C-30 -6 -44 -28 -42 -54C-40 -80 -18 -94 8 -94C30 -94 46 -82 48 -64L50 -54C54 -50 62 -44 64 -38C65 -34 60 -32 55 -32L54 -29C56 -27 56 -25 54 -24C56 -22 55 -18 52 -17C53 -11 50 -6 44 -4C34 0 18 2 6 0Z") +
    taper(q([52, -50], [60, -42], [62, -38]), 2) + // nose ridge
    taper(q([44, -42], [50, -38], [52, -34]), 2.4) + // nostril wing
    shade("M-36 -40C-34 -22 -22 -8 -6 -4C6 -2 4 -14 -6 -16C-20 -20 -30 -30 -36 -40Z") +
    inked("M-2 -52C-12 -58 -18 -46 -14 -40C-11 -34 -4 -35 -2 -40Z", WHITE, 4) + // ear
    taper(q([-5, -48], [-12, -47], [-8, -42]), 1.8) +
    ink("M-8 -58L-4 -40L2 -40L0 -60Z") + // sideburn
    QUIFF_PROFILE,

  threeQuarter:
    inked("M-10 -4C-32 -12 -42 -38 -38 -62C-32 -88 -8 -98 14 -96C38 -94 52 -78 52 -58L53 -50C58 -44 62 -38 58 -34C56 -32 54 -30 54 -28C52 -14 42 -2 24 0C10 2 2 0 -10 -4Z") +
    taper(c([38, -60], [46, -48], [52, -40], [44, -36]), 3, 0.4, 0) + // nose
    taper(q([36, -38], [40, -35], [44, -36]), 2) +
    shade("M-32 -36C-28 -20 -16 -8 0 -4C10 -2 8 -12 0 -14C-14 -18 -24 -26 -32 -36Z") +
    inked("M-26 -54C-36 -58 -40 -44 -35 -38C-31 -34 -26 -36 -24 -40Z", WHITE, 4) +
    taper(q([-28, -50], [-35, -46], [-30, -41]), 1.8) +
    ink("M-38 -48C-46 -74 -38 -100 -14 -110C2 -116 18 -112 26 -106C36 -120 58 -122 70 -108C62 -106 58 -102 58 -98C64 -96 66 -90 64 -84C56 -88 50 -86 46 -80C40 -84 30 -86 22 -80C14 -84 0 -82 -8 -74C-14 -66 -16 -58 -20 -48C-24 -42 -32 -42 -38 -48Z") +
    taper(q([56, -112], [66, -108], [70, -98]), 4, 1, 0) +
    taper(c([-26, -86], [-8, -108], [22, -110], [48, -106]), 6, 0, 0, WHITE) +
    taper(q([30, -112], [46, -118], [60, -112]), 3, 0, 0, WHITE),

  front:
    inked("M-38 -54C-46 -58 -48 -44 -42 -38C-38 -35 -35 -37 -34 -40Z", WHITE, 4) +
    inked("M48 -54C56 -58 58 -44 52 -38C48 -35 45 -37 44 -40Z", WHITE, 4) +
    inked("M-32 -20C-42 -40 -42 -76 -26 -90C-12 -100 20 -100 34 -90C50 -76 50 -40 40 -20C32 -6 18 2 5 2C-8 2 -24 -6 -32 -20Z") +
    taper(c([4, -52], [6, -44], [12, -38], [5, -34]), 3, 0.3, 0) + // nose
    taper(q([-2, -36], [2, -33], [6, -35]), 1.8) +
    shade("M26 -12C36 -22 42 -36 43 -52C46 -36 42 -18 32 -8C22 0 12 2 5 2C14 0 20 -6 26 -12Z") +
    ink("M-40 -50C-46 -84 -24 -110 2 -112C14 -122 40 -124 54 -110C48 -108 46 -104 48 -100C54 -96 54 -86 50 -76C44 -84 34 -86 26 -80C16 -86 -2 -84 -14 -76C-24 -70 -32 -62 -36 -48Z") +
    taper(q([40, -118], [52, -116], [58, -106]), 4, 1, 0) +
    taper(c([-26, -90], [-10, -108], [14, -114], [40, -110]), 6, 0, 0, WHITE) +
    taper(q([-32, -64], [-26, -82], [-12, -92]), 2.2, 0, 0, WHITE),
};

/* ---------------- faces ---------------- */

type Eye = { x: number; y: number; s: number };
export type Anchors = { eyes: Eye[]; nose: number; mouth: [number, number]; top: [number, number]; cheek: [number, number] };

export const ANCHORS: Record<View, Anchors> = {
  profile: { eyes: [{ x: 33, y: -56, s: 1 }], nose: 70, mouth: [47, -24], top: [14, -116], cheek: [26, -38] },
  threeQuarter: { eyes: [{ x: 14, y: -56, s: 1 }, { x: 38, y: -56, s: 0.82 }], nose: 30, mouth: [32, -20], top: [12, -118], cheek: [8, -38] },
  front: { eyes: [{ x: -11, y: -56, s: 1 }, { x: 20, y: -56, s: 1 }], nose: 5, mouth: [5, -20], top: [6, -120], cheek: [-20, -38] },
};

type EyeKind = "open" | "wide" | "closed" | "happy" | "squeeze" | "side";
type BrowKind = "soft" | "raised" | "angry" | "worried";
type MouthKind = "smile" | "flat" | "grin" | "open" | "o" | "puff" | "wobble" | "talk" | "grit";
type Extra = "sparkle" | "sweat" | "shock" | "blush" | "puffs" | "effort" | "vein" | "stress";
export type FaceDef = { eye: EyeKind; brow: BrowKind; mouth: MouthKind; extras?: Extra[] };

/** Expressions. Names match the ones FriendStory already passes. */
export const FACE_DEFS: Record<string, FaceDef> = {
  gentle: { eye: "open", brow: "soft", mouth: "smile" },
  neutral: { eye: "open", brow: "soft", mouth: "flat" },
  focus: { eye: "open", brow: "angry", mouth: "flat" },
  talk: { eye: "open", brow: "soft", mouth: "talk" },
  ask: { eye: "open", brow: "raised", mouth: "o" },
  listen: { eye: "happy", brow: "soft", mouth: "smile" },
  happy: { eye: "happy", brow: "raised", mouth: "open", extras: ["blush"] },
  pushy: { eye: "wide", brow: "raised", mouth: "grin", extras: ["sparkle"] },
  strain: { eye: "squeeze", brow: "angry", mouth: "puff", extras: ["sweat", "puffs", "effort"] },
  take: { eye: "wide", brow: "raised", mouth: "o", extras: ["shock"] },
  guilty: { eye: "side", brow: "worried", mouth: "wobble", extras: ["sweat"] },
  shy: { eye: "side", brow: "worried", mouth: "smile", extras: ["blush", "sweat"] },
  startle: { eye: "wide", brow: "raised", mouth: "o", extras: ["shock"] },
  angry: { eye: "open", brow: "angry", mouth: "grit", extras: ["vein", "stress"] },
};
const OPEN_EYES: EyeKind[] = ["open", "side", "wide"];

function eyeArt(k: EyeKind, e: Eye, dir: number): string {
  const { x, y, s } = e;
  switch (k) {
    case "open":
      return ink(`M${x - 4.4 * s} ${y}a${4.4 * s} ${6 * s} 0 1 0 ${8.8 * s} 0a${4.4 * s} ${6 * s} 0 1 0 ${-8.8 * s} 0Z`) +
        ink(`M${x + 0.6 * s} ${y - 2.8 * s}a${1.5 * s} ${1.5 * s} 0 1 0 ${3 * s} 0a${1.5 * s} ${1.5 * s} 0 1 0 ${-3 * s} 0Z`, WHITE) +
        taper(q([x - 6 * s, y - 7 * s], [x, y - 9 * s], [x + 6 * s, y - 7 * s]), 2.2); // lid
    case "side":
      return ink(`M${x - 3.8 * s + dir * 2.6} ${y + 1}a${3.8 * s} ${5.2 * s} 0 1 0 ${7.6 * s} 0a${3.8 * s} ${5.2 * s} 0 1 0 ${-7.6 * s} 0Z`) +
        taper(q([x - 6.5 * s, y - 5.5 * s], [x, y - 8 * s], [x + 6.5 * s, y - 5.5 * s]), 3);
    case "wide":
      return inked(`M${x - 8.5 * s} ${y}a${8.5 * s} ${9 * s} 0 1 0 ${17 * s} 0a${8.5 * s} ${9 * s} 0 1 0 ${-17 * s} 0Z`, WHITE, 2.8) +
        ink(`M${x + dir * 3.4 - 3.4 * s} ${y + 1}a${3.4 * s} ${3.4 * s} 0 1 0 ${6.8 * s} 0a${3.4 * s} ${3.4 * s} 0 1 0 ${-6.8 * s} 0Z`);
    case "closed":
      return taper(q([x - 7 * s, y], [x, y + 4.5 * s], [x + 7 * s, y]), 3.8);
    case "happy":
      return taper(q([x - 7 * s, y + 2], [x, y - 7 * s], [x + 7 * s, y + 2]), 4.6);
    case "squeeze":
      return taper(q([x - 8 * s, y - 2], [x, y + 4], [x + 8 * s, y - 3]), 4.8) +
        taper(q([x - 4 * s, y + 2], [x - 5 * s, y + 5], [x - 6 * s, y + 8]), 2) +
        taper(q([x, y + 3], [x, y + 6], [x + 0.5, y + 9]), 2) +
        taper(q([x + 4 * s, y + 1], [x + 5 * s, y + 4], [x + 6.5 * s, y + 7]), 2);
  }
}

// Thick, expressive brows are part of his design.
function browArt(k: BrowKind, e: Eye, dir: number): string {
  const { x, y, s } = e;
  const by = y - 14 * s;
  const inX = x + dir * 10 * s, outX = x - dir * 9 * s;
  const w = 8 * s;
  switch (k) {
    case "soft":
      return taper(q([outX, by + 1], [x, by - 4], [inX, by]), w, 0.35, 0.8);
    case "raised":
      return taper(q([outX, by - 3], [x, by - 11], [inX, by - 5]), w, 0.35, 0.8);
    case "angry":
      return taper(q([outX, by - 5], [x, by - 3], [inX, by + 6]), w * 1.1, 0.3, 1);
    case "worried":
      return taper(q([outX, by + 4], [x, by - 1], [inX, by - 7]), w, 0.3, 0.8);
  }
}

function mouthArt(k: MouthKind, [x, y]: [number, number]): string {
  switch (k) {
    case "smile": // a wide easy grin line with a dimple
      return taper(q([x - 9, y - 4], [x - 1, y + 4], [x + 6, y - 3]), 3.6) + taper(q([x - 10, y - 6], [x - 11, y - 3], [x - 9, y - 1]), 1.8);
    case "flat":
      return taper(q([x - 6, y], [x, y + 1], [x + 6, y]), 3.4);
    case "talk":
      return inked(`M${x - 6} ${y - 3}Q${x} ${y + 9} ${x + 6} ${y - 3}Z`, INK, 1.4);
    case "o":
      return inked(`M${x - 3.5} ${y}a3.5 4.5 0 1 0 7 0a3.5 4.5 0 1 0 -7 0Z`, INK, 1.4);
    case "open":
      return inked(`M${x - 10} ${y - 7}Q${x} ${y + 14} ${x + 9} ${y - 7}Z`, INK, 1.8) +
        ink(`M${x - 6} ${y - 5}Q${x} ${y - 3} ${x + 6} ${y - 5}L${x + 5} ${y - 2}Q${x} ${y} ${x - 5} ${y - 2}Z`, WHITE) +
        ink(`M${x - 5} ${y + 3}Q${x} ${y - 1} ${x + 4} ${y + 3}Q${x} ${y + 6} ${x - 5} ${y + 3}Z`, RED);
    case "grin": // the signature: huge toothy grin
      return inked(`M${x - 13} ${y - 9}Q${x} ${y + 18} ${x + 12} ${y - 9}Q${x} ${y - 4} ${x - 13} ${y - 9}Z`, WHITE, 2.8) +
        taper(q([x - 12, y - 2], [x, y + 3], [x + 12, y - 2]), 2) +
        taper([[x - 5, y - 7], [x - 5, y + 6]], 1.8) + taper([[x + 2, y - 6], [x + 2, y + 7]], 1.8) + taper([[x + 8, y - 7], [x + 8, y + 4]], 1.8);
    case "puff":
      return inked(`M${x - 3} ${y - 8}C${x + 6} ${y - 10} ${x + 10} ${y - 5} ${x + 8} ${y - 1}C${x + 11} ${y + 2} ${x + 7} ${y + 8} ${x} ${y + 6}Z`, WHITE, 3);
    case "grit": // clenched teeth
      return inked(`M${x - 9} ${y - 6}H${x + 9}Q${x + 10} ${y + 4} ${x + 8} ${y + 5}H${x - 8}Q${x - 10} ${y + 4} ${x - 9} ${y - 6}Z`, WHITE, 2.6) +
        taper([[x - 9, y], [x + 9, y]], 1.6) + taper([[x - 3, y - 6], [x - 3, y + 5]], 1.5) + taper([[x + 3, y - 6], [x + 3, y + 5]], 1.5);
    case "wobble":
      return taper([[x - 7, y + 1], [x - 3.5, y - 1.5], [x, y + 1], [x + 3.5, y - 1.5], [x + 7, y + 1]], 3);
  }
}

function extraArt(k: Extra, a: Anchors): string {
  const [tx, ty] = a.top, [cx, cy] = a.cheek, [mx, my] = a.mouth;
  switch (k) {
    case "sparkle": {
      const x = mx + 20, y = my - 14;
      return ink(`M${x} ${y - 10}L${x + 3} ${y - 3}L${x + 10} ${y}L${x + 3} ${y + 3}L${x} ${y + 10}L${x - 3} ${y + 3}L${x - 10} ${y}L${x - 3} ${y - 3}Z`);
    }
    case "sweat":
      return inked(`M${tx - 22} ${ty + 34}q-9 13 0 19q9 -6 0 -19z`, WHITE, 2.8);
    case "shock":
      return taper([[tx - 22, ty + 4], [tx - 30, ty - 12]], 4, 1, 0) + taper([[tx, ty - 2], [tx, ty - 18]], 4, 1, 0) + taper([[tx + 22, ty + 4], [tx + 30, ty - 12]], 4, 1, 0);
    case "blush":
      return [0, 7, 14].map((d) => taper([[cx - 5 + d, cy + 3], [cx - 1 + d, cy - 5]], 2.8, 1, 0.4, RED)).join("");
    case "puffs":
      return taper(q([mx + 16, my - 12], [mx + 23, my - 7], [mx + 16, my - 2]), 2.8) +
        taper(q([mx + 23, my - 2], [mx + 30, my + 3], [mx + 23, my + 8]), 2.8);
    case "vein": { // the red anger mark at the temple
      const x = tx - 30, y = ty + 30;
      return [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => taper(q([x + sx * 11, y + sy * 3], [x + sx * 4, y + sy * 4], [x + sx * 3, y + sy * 11]), 3.6, 0.5, 0.5, RED)).join("");
    }
    case "stress":
      return [0, 7, 14].map((d) => taper([[tx - 8 + d, ty + 26], [tx - 8 + d, ty + 38]], 2.2)).join("");
    case "effort":
      return [-1, 0, 1].map((i) => taper([[tx + i * 12 - 4, ty + 34 - Math.abs(i) * 5], [tx + i * 17 - 6, ty + 20 - Math.abs(i) * 7]], 3.4, 1, 0)).join("");
  }
}

/** Builds a face function for a head set: `brow` scales brow weight, `lashes` adds lashes. */
export function makeFaceArt(anchors: Record<View, Anchors>, style: { brow?: number; lashes?: boolean; fallback?: string } = {}) {
  const { brow = 1, lashes = false, fallback = "gentle" } = style;
  return (name: string, view: View, blink = false): string => {
    const def = FACE_DEFS[name] ?? FACE_DEFS[fallback];
    const a = anchors[view];
    let out = "";
    for (const e of a.eyes) {
      const dir = Math.sign(a.nose - e.x) || 1;
      const k: EyeKind = blink && OPEN_EYES.includes(def.eye) ? "closed" : def.eye;
      const b = browArt(def.brow, { ...e, s: e.s }, dir);
      out += eyeArt(k, e, dir) + (brow === 1 ? b : `<g transform="translate(${e.x} ${e.y - 14 * e.s}) scale(1 ${brow}) translate(${-e.x} ${-(e.y - 14 * e.s)})">${b}</g>`);
      if (lashes && OPEN_EYES.includes(k)) out += taper(q([e.x + dir * 4 * e.s, e.y - 6 * e.s], [e.x + dir * 8 * e.s, e.y - 8 * e.s], [e.x + dir * 11 * e.s, e.y - 12 * e.s]), 2.6, 1, 0);
    }
    out += mouthArt(def.mouth, a.mouth);
    for (const x of def.extras ?? []) out += extraArt(x, a);
    return out;
  };
}

/** Face art for a head view. `blink` swaps open eyes for closed ones. */
export const faceArt = makeFaceArt(ANCHORS);

/** The flyer he waves around (in the back hand's frame, before HAND_SCALE). */
export const FLYER = `<g transform="translate(-4 22) rotate(-102) scale(0.75)">${inked("M-10 -74H70V-12H-10Z", WHITE, 5)}${inked("M30 -64l5 10l11 1.5l-8 7.5l2 11l-10 -5l-10 5l2 -11l-8 -7.5l11 -1.5z", RED, 2.4)}${taper([[2, -24], [48, -24]], 3)}${taper([[2, -18], [32, -18]], 3)}</g>`;
