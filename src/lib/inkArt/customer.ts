/**
 * The GenClosers customer: an ORIGINAL character in the same chunky comic-ink style as the
 * salesman (lib/inkArt/salesman.ts; same bone frames, same face parts).
 *
 * Design: hair in a high bun with a fringe, a red ear stud; an oversized light hoodie (hood,
 * drawstrings, kangaroo pocket, ribbed cuffs and hem); cuffed joggers; halftone socks; chunky
 * white sneakers with an ink heel tab.
 */
import { inked, ink, taper, shade, q, c, WHITE, RED, INK } from "./pen";
import { THIGH as S_THIGH, SHIN as S_SHIN, SHIN_ANKLE as S_ANKLE, SHOE as S_SHOE, ANCHORS as S_ANCHORS, makeFaceArt, type View, type Anchors } from "./salesman";

export const HEAD_SCALE = 1.3;
export const HAND_SCALE = 1.35;
const HOOD = "#e9e6e0";

/* ---------------- body ---------------- */

/** Oversized hoodie: drops below the waist, kangaroo pocket, drawstrings, ribbed hem. */
export const TORSO =
  inked("M-42 14C-52 -30 -54 -88 -38 -120Q-6 -136 28 -128C50 -112 58 -72 52 -30C56 -14 56 2 52 14Q4 24 -42 14Z", HOOD) +
  shade("M32 -114C46 -94 54 -66 48 -30C52 -14 52 0 50 10Q34 16 18 16C38 -10 44 -62 32 -114Z") +
  inked("M-8 -36Q22 -42 48 -36L50 -6Q22 -2 -6 -8Z", HOOD, 3.6) + // pocket
  taper(q([-6, -26], [-2, -18], [-6, -10]), 2.2) +
  taper(c([-32, -104], [-16, -84], [0, -72], [22, -64]), 2.8) + // pull folds
  taper(q([-26, -60], [-16, -50], [-20, -40]), 2.6) +
  inked("M-42 2Q4 12 52 2L52 14Q4 24 -42 14Z", HOOD, 4) + // ribbed hem
  [-30, -16, -2, 12, 26, 40].map((x) => taper([[x, 6], [x, 17]], 1.6)).join("") +
  taper(c([-38, -20], [-46, -60], [-44, -96], [-30, -116]), 3.6, 0, 0, WHITE) + // rim light
  // the hood bunched behind the neck, and the drawstrings
  inked("M-36 -116C-56 -122 -52 -152 -22 -148L6 -130C-8 -120 -20 -114 -36 -116Z", HOOD, 5) +
  taper(q([-40, -128], [-30, -140], [-14, -142]), 2.4) +
  inked("M-20 -124Q4 -138 30 -128L26 -118Q4 -126 -16 -114Z", HOOD, 4) +
  taper(q([18, -120], [22, -104], [20, -86]), 2.6, 0.7, 0.7) +
  taper(q([27, -122], [31, -106], [30, -88]), 2.6, 0.7, 0.7) +
  inked("M17 -88h6v8h-6Z", WHITE, 2) +
  inked("M27 -90h6v8h-6Z", WHITE, 2);

export const HIPS =
  inked("M-40 -6Q4 -16 50 -6L48 26Q4 36 -38 24Z", "#d9d6d0") +
  shade("M34 -6Q44 -6 49 -5L47 24Q40 27 32 28C36 16 36 4 34 -6Z");

export const TIE = ""; // no tie

export const NECK = inked("M-12 8V-16H14V8Z") + shade("M3 -16H14V4Q8 0 3 -6Z");

/** Hoodie sleeve, shoulder to elbow. */
export const UPPER_ARM =
  inked("M-20 -14C-22 10 -21 34 -18 56L18 56C21 34 22 10 20 -14Z", HOOD) +
  shade("M9 -10C14 10 15 32 13 54L16 54C18 32 19 10 17 -10Z") +
  taper(q([-9, 8], [-3, 22], [-7, 38]), 2.6) +
  taper(q([7, 16], [11, 30], [8, 44]), 2.2);
/** The sleeve bunched at the elbow, drawn over it. */
export const SLEEVE = `<g>${inked("M-19 48Q0 56 19 48L18 66Q0 72 -18 66Z", HOOD)}${taper(q([-17, 56], [0, 62], [17, 56]), 2.4)}${taper(q([-12, 62], [-2, 66], [8, 63]), 1.8)}</g>`;
/** Forearm in the sleeve, down to a ribbed cuff; the hand hangs at (0, FOREARM_HAND). */
export const FOREARM =
  inked("M-14 0a14 14 0 1 0 28 0a14 14 0 1 0 -28 0Z", HOOD) +
  inked("M-15 -2C-16 18 -14 38 -12 48L12 48C14 38 16 18 15 -2Z", HOOD) +
  taper(q([4, 10], [9, 24], [5, 38]), 2.2) +
  inked("M-12 44H12L11 56H-11Z", HOOD, 3.6) +
  [-6, 0, 6].map((x) => taper([[x, 46], [x, 55]], 1.4)).join("");
export const FOREARM_HAND = 56;

export const THIGH = S_THIGH;
export const SHIN = S_SHIN;
export const SHIN_ANKLE = S_ANKLE;
/** Same sneaker, ink heel tab instead of red. */
export const SHOE = S_SHOE.replace(`fill="${RED}"`, `fill="${INK}"`);

/* ---------------- heads ---------------- */

const EAR_STUD = (x: number, y: number) => inked(`M${x - 3.2} ${y}a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z`, RED, 2);
const BUN = (x: number, y: number) =>
  ink(`M${x - 21} ${y}a21 19 0 1 0 42 0a21 19 0 1 0 -42 0Z`) +
  taper(q([x - 12, y - 8], [x - 2, y - 14], [x + 10, y - 10]), 4, 0, 0, WHITE) +
  inked(`M${x - 14} ${y + 14}Q${x} ${y + 22} ${x + 14} ${y + 14}L${x + 12} ${y + 20}Q${x} ${y + 27} ${x - 12} ${y + 20}Z`, RED, 2.4); // hair tie

export const HEADS: Record<View, string> = {
  profile:
    inked("M-8 -2C-30 -6 -44 -28 -42 -54C-40 -80 -18 -94 8 -94C30 -94 46 -82 48 -64L50 -54C53 -50 58 -45 59 -40C60 -36 56 -35 52 -35L52 -30C54 -28 54 -26 52 -25C54 -23 53 -19 50 -18C51 -12 47 -7 42 -5C32 -1 18 1 6 0Z") +
    taper(q([47, -44], [52, -40], [53, -36]), 2) +
    shade("M-36 -40C-34 -22 -22 -8 -6 -4C6 -2 4 -14 -6 -16C-20 -20 -30 -30 -36 -40Z") +
    BUN(-28, -100) +
    ink("M-46 -38C-54 -72 -38 -102 -6 -106C22 -110 46 -98 54 -78C56 -70 54 -64 50 -60C42 -72 30 -78 18 -76C12 -70 4 -66 -4 -66C-10 -58 -12 -48 -14 -38C-16 -26 -20 -16 -26 -8C-36 -14 -44 -26 -46 -38Z") +
    inked("M-2 -52C-12 -58 -18 -46 -14 -40C-11 -34 -4 -35 -2 -40Z", WHITE, 4) +
    taper(q([-5, -48], [-12, -47], [-8, -42]), 1.8) +
    EAR_STUD(-9, -36) +
    taper(c([-34, -80], [-14, -100], [16, -104], [42, -94]), 6, 0, 0, WHITE) +
    taper(q([30, -86], [40, -78], [46, -70]), 2.6, 0.5, 0), // fringe strand

  threeQuarter:
    inked("M-10 -4C-32 -12 -42 -38 -38 -62C-32 -88 -8 -98 14 -96C38 -94 52 -78 52 -58L53 -50C56 -46 58 -40 55 -37C53 -35 52 -33 52 -30C50 -16 40 -4 24 -1C10 1 2 0 -10 -4Z") +
    taper(c([36, -58], [42, -48], [46, -42], [40, -38]), 2.6, 0.4, 0) +
    shade("M-32 -36C-28 -20 -16 -8 0 -4C10 -2 8 -12 0 -14C-14 -18 -24 -26 -32 -36Z") +
    BUN(-20, -104) +
    ink("M-40 -42C-48 -76 -30 -104 2 -108C30 -112 54 -96 58 -72C52 -78 42 -82 32 -80C26 -72 16 -68 6 -70C-2 -62 -8 -54 -14 -44C-18 -34 -24 -26 -30 -20C-36 -26 -40 -34 -40 -42Z") +
    inked("M-26 -54C-36 -58 -40 -44 -35 -38C-31 -34 -26 -36 -24 -40Z", WHITE, 4) +
    EAR_STUD(-32, -34) +
    taper(c([-28, -84], [-8, -104], [22, -106], [48, -96]), 6, 0, 0, WHITE),

  front:
    inked("M-38 -54C-46 -58 -48 -44 -42 -38C-38 -35 -35 -37 -34 -40Z", WHITE, 4) +
    inked("M48 -54C56 -58 58 -44 52 -38C48 -35 45 -37 44 -40Z", WHITE, 4) +
    EAR_STUD(-41, -34) +
    EAR_STUD(51, -34) +
    BUN(4, -116) +
    inked("M-32 -20C-42 -40 -42 -76 -26 -90C-12 -100 20 -100 34 -90C50 -76 50 -40 40 -20C32 -6 18 2 5 2C-8 2 -24 -6 -32 -20Z") +
    taper(c([4, -50], [6, -44], [10, -40], [5, -37]), 2.6, 0.3, 0) +
    shade("M26 -12C36 -22 42 -36 43 -52C46 -36 42 -18 32 -8C22 0 12 2 5 2C14 0 20 -6 26 -12Z") +
    ink("M-42 -46C-48 -84 -24 -110 4 -110C34 -110 54 -86 50 -48C46 -62 38 -72 26 -76C14 -68 -4 -66 -18 -70C-28 -64 -34 -56 -38 -44Z") +
    taper(c([-28, -88], [-10, -104], [16, -106], [40, -96]), 6, 0, 0, WHITE),
};

const ANCHORS: Record<View, Anchors> = {
  profile: { ...S_ANCHORS.profile, mouth: [45, -24] },
  threeQuarter: { ...S_ANCHORS.threeQuarter, mouth: [30, -20] },
  front: S_ANCHORS.front,
};

/** Her faces: lighter brows than his, with lashes. */
export const faceArt = makeFaceArt(ANCHORS, { brow: 0.6, lashes: true, fallback: "neutral" });

export const FLYER = "";
