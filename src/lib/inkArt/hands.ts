/**
 * Hand drawings, drawn as one silhouette each (like a cartoonist's hand), with the finger
 * separations, knuckles and nails as tapered brush lines inside.
 * Local frame: wrist at (0,0), +y runs out of the wrist along the forearm, +x = the side the
 * character faces (the thumb side when the arm hangs).
 */
import { inked, taper, q, c, WHITE } from "./pen";

const HW = 3.6; // hand outline weight (a touch lighter than the body)
const line = (pts: [number, number][], w = 2.2, a = 0, b = 0) => taper(pts, w, a, b);
const cuffShadow = taper(q([-8, 3], [0, 5], [8, 3]), 1.6);

export const HANDS: Record<string, string> = {
  // hanging: soft fingers curling forward, thumb resting in front
  relaxed:
    inked("M-8 -1C-10 7 -11 17 -9 25C-8 32 -4 38 2 38C6 38 9 35 9 31C9 28 7 27 7 25C10 22 11 16 10 10C9 5 9 2 8 -1Z", WHITE, HW) +
    inked("M5 6C11 7 15 12 15 18C15 23 11 24 9 21C8 17 7 13 4 11Z", WHITE, HW) +
    line(c([-5, 22], [-3, 27], [0, 31], [4, 33]), 2.2) +
    line(c([-7, 15], [-5, 20], [-3, 24], [1, 26]), 1.8) +
    line(q([7, 25], [4, 26], [2, 29]), 1.6) +
    cuffShadow,

  fist:
    inked("M-9 -1C-11 8 -11 17 -8 23C-5 28 2 29 7 26C11 23 12 17 11 11C10 6 9 2 8 -1Z", WHITE, HW) +
    inked("M4 7C10 7 14 11 13 16C12 19 8 20 6 17C5 14 4 11 3 9Z", WHITE, HW) +
    line(q([-9, 11], [-4, 12], [0, 11]), 2) +
    line(q([-9, 17], [-4, 18], [1, 17]), 2) +
    line(q([-7, 22], [-3, 24], [2, 23]), 1.8) +
    cuffShadow,

  // index finger straight out, the others curled under, thumb on top
  point:
    inked("M-9 -1C-11 8 -11 15 -8 20C-5 24 1 25 4 23L5 40C5 44 10 44 10 40L10 20C12 15 12 8 10 2C9 0 9 -1 8 -1Z", WHITE, HW) +
    inked("M4 6C10 6 14 10 13 15C12 18 8 19 6 16C5 13 4 10 3 8Z", WHITE, HW) +
    line(q([-9, 12], [-5, 13], [-1, 12]), 2) +
    line(q([-8, 18], [-4, 19], [1, 18]), 1.8) +
    line(q([6, 36], [7.5, 38], [9, 36]), 1.4) + // nail
    cuffShadow,

  // pushing: wrist bent back, palm on the surface, fingers spread up (+x)
  pushFlat:
    inked("M-8 -1C-10 6 -9 14 -6 19C-4 22 0 24 4 23C10 26 20 27 30 25C33 24 33 20 30 19L20 18C24 17 31 16 33 13C35 10 32 8 29 9L19 11C23 9 29 7 31 4C33 1 30 -1 27 0L17 4C20 1 24 -2 25 -5C26 -8 23 -9 21 -7L11 1C10 0 9 -1 8 -1Z", WHITE, HW) +
    inked("M-2 20C-4 26 -2 31 2 32C5 33 7 30 6 27L4 22Z", WHITE, HW) + // thumb tucked under
    line(q([8, 4], [14, 7], [18, 10]), 1.6) +
    line(q([8, 11], [14, 13], [19, 15]), 1.6) +
    line(q([7, 17], [14, 19], [20, 20]), 1.6) +
    cuffShadow,

  // handshake: thumb up, fingers wrapping forward
  grip:
    inked("M-8 -1C-10 7 -10 16 -7 22C-4 27 3 29 9 28C14 28 18 26 18 22C18 19 15 18 13 18C16 16 17 12 15 9C13 6 11 5 9 5L8 -1Z", WHITE, HW) +
    inked("M6 4C11 1 16 -3 19 -2C22 -1 21 3 18 5C15 8 12 10 9 11Z", WHITE, HW) + // thumb up
    line(c([-2, 13], [3, 15], [9, 16], [14, 15]), 2) +
    line(c([-4, 19], [2, 22], [8, 23], [14, 22]), 1.8) +
    cuffShadow,

  // pinching a flyer or a cup handle
  hold:
    inked("M-9 -1C-11 8 -11 16 -8 21C-5 25 2 26 7 24C11 22 12 17 11 11C10 6 9 2 8 -1Z", WHITE, HW) +
    inked("M5 6C12 5 17 9 17 14C17 18 13 19 11 16C9 13 7 11 4 10Z", WHITE, HW) +
    line(q([-9, 11], [-4, 12], [1, 11]), 2) +
    line(q([-8, 17], [-3, 18], [2, 17]), 1.8) +
    cuffShadow,

  // open wave: fingers spread along the arm
  wave:
    inked("M-8 -1C-10 6 -11 14 -10 20L-14 34C-15 38 -10 39 -9 35L-6 25L-6 40C-6 44 -1 44 -1 40L0 26L3 40C4 44 9 43 8 39L6 25L10 34C12 38 16 36 15 32L10 18C11 12 10 5 8 -1Z", WHITE, HW) +
    inked("M6 6C12 5 17 9 17 14C17 18 13 18 11 16C9 13 7 11 5 10Z", WHITE, HW) +
    line(q([-6, 14], [-2, 16], [3, 15]), 1.6) +
    cuffShadow,

  peace:
    inked("M-9 -1C-11 8 -11 15 -8 20C-6 22 -4 23 -3 23L-6 40C-7 44 -2 45 -1 41L2 24L4 24L7 41C8 45 13 44 12 40L9 22C12 17 12 8 10 2L8 -1Z", WHITE, HW) +
    inked("M4 7C10 6 14 10 13 15C12 18 8 19 6 16C5 13 4 10 3 9Z", WHITE, HW) +
    line(q([-9, 12], [-5, 13], [-1, 12]), 2) +
    cuffShadow,
};

export type HandName = keyof typeof HANDS;
