/**
 * How each character's arms and legs are dressed. Every function returns the shapes to draw
 * (back to front) for one limb this frame, built on lib/inkArt/skin.ts.
 */
import { band, creases, across, fold, type Spine, type Profile } from "./skin";
import { INK, WHITE, LIGHT } from "./pen";

export type Shape = { d: string; fill: string };
type Kind = "salesman" | "customer";
const HOOD = "#e9e6e0";
const BODY_INK = 5.4;
const CLOTH_INK = 4.6;

function push(out: Shape[], b: { fill: string; ink: string; shade: string }, fill: string, shade = true) {
  if (!b.fill) return;
  out.push({ d: b.ink, fill: INK }, { d: b.fill, fill });
  if (shade) out.push({ d: b.shade, fill: "url(#ia-dots)" });
}
const lines = (d: string): Shape => ({ d, fill: INK });

/* ---------------- arms: shoulder → elbow → wrist ---------------- */

const SALES_ARM: Profile = [[0, 23], [0.22, 24], [0.46, 19], [0.62, 21], [0.82, 18], [1, 14]];
const SALES_SLEEVE: Profile = [[0, 38], [0.22, 36], [0.44, 32], [0.5, 31]];
const SALES_CUFF: Profile = [[0.38, 34], [0.5, 33]];
const CUST_ARM: Profile = [[0, 33], [0.25, 31], [0.5, 27], [0.72, 26], [0.9, 24]];
const CUST_CUFF: Profile = [[0.85, 23], [0.98, 22]];

export function armShapes(kind: Kind, sp: Spine, facing: 1 | -1, seed: number): Shape[] {
  const out: Shape[] = [];
  const ink = (w: number) => ({ w, facing, seed });
  if (kind === "salesman") {
    // the bare forearm and the arm under the sleeve
    push(out, band(sp, 0, 1, SALES_ARM, ink(BODY_INK)), WHITE);
    out.push(lines(creases(sp, SALES_ARM, 2.6)));
    // the baggy rolled sleeve over the upper arm
    push(out, band(sp, 0, 0.5, SALES_SLEEVE, ink(CLOTH_INK), [true, false]), WHITE);
    push(out, band(sp, 0.38, 0.5, SALES_CUFF, ink(CLOTH_INK * 0.85), [false, false]), WHITE, false);
    out.push(lines(across(sp, 0.39, SALES_CUFF, 2.6, 2) + across(sp, 0.5, SALES_CUFF, 3.2, 3)));
    out.push(lines(fold(sp, 0.05, 0.3, SALES_SLEEVE, 1, 0.38, 2.6) + fold(sp, 0.12, 0.34, SALES_SLEEVE, -1, 0.3, 2.2)));
  } else {
    // the hoodie sleeve is the whole arm; a ribbed cuff at the wrist
    push(out, band(sp, 0, 0.92, CUST_ARM, ink(CLOTH_INK)), HOOD);
    out.push(lines(creases(sp, CUST_ARM, 2.6)));
    out.push(lines(fold(sp, 0.08, 0.32, CUST_ARM, 1, 0.34, 2.4) + fold(sp, 0.6, 0.8, CUST_ARM, -1, 0.3, 2)));
    push(out, band(sp, 0.85, 0.98, CUST_CUFF, ink(CLOTH_INK * 0.85)), HOOD, false);
    out.push(lines(across(sp, 0.86, CUST_CUFF, 2.4, 1.5)));
  }
  return out.filter((s) => s.d);
}

/* ---------------- legs: hip → knee → ankle ---------------- */

const SALES_LEG: Profile = [[0, 46], [0.25, 41], [0.5, 35], [0.75, 33], [0.94, 32]];
const SALES_HEM: Profile = [[0.84, 36], [0.95, 36]];
const CUST_LEG: Profile = [[0, 46], [0.3, 39], [0.5, 33], [0.8, 30], [0.92, 27]];
const CUST_HEM: Profile = [[0.86, 25], [0.96, 25]];
const SOCK: Profile = [[0.9, 25], [1, 23]];

export function legShapes(kind: Kind, sp: Spine, facing: 1 | -1, seed: number): Shape[] {
  const out: Shape[] = [];
  const ink = (w: number) => ({ w, facing, seed });
  push(out, band(sp, 0.9, 1, SOCK, ink(CLOTH_INK * 0.8), [false, true]), "url(#ia-sock)", false);
  if (kind === "salesman") {
    push(out, band(sp, 0, 0.95, SALES_LEG, ink(CLOTH_INK)), LIGHT);
    out.push(lines(creases(sp, SALES_LEG, 2.8)));
    out.push(lines(fold(sp, 0.06, 0.32, SALES_LEG, 1, 0.3, 2.6) + fold(sp, 0.58, 0.8, SALES_LEG, -1, 0.34, 2.2)));
    push(out, band(sp, 0.84, 0.95, SALES_HEM, ink(CLOTH_INK * 0.85), [false, false]), LIGHT, false);
    out.push(lines(across(sp, 0.85, SALES_HEM, 2.4, 2)));
  } else {
    push(out, band(sp, 0, 0.94, CUST_LEG, ink(CLOTH_INK)), LIGHT);
    out.push(lines(creases(sp, CUST_LEG, 2.8)));
    out.push(lines(fold(sp, 0.08, 0.34, CUST_LEG, 1, 0.3, 2.4)));
    push(out, band(sp, 0.86, 0.96, CUST_HEM, ink(CLOTH_INK * 0.85)), LIGHT, false);
    out.push(lines(across(sp, 0.87, CUST_HEM, 2, 1.5) + across(sp, 0.95, CUST_HEM, 2, 1.5)));
  }
  return out.filter((s) => s.d);
}
