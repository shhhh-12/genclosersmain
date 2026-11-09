/**
 * The hero's characters as hand-drawn frames (public/hero/cast/*.webp, listed in heroCast.json,
 * generated in the owner's reference style and cut out by .work/gen/*).
 *
 * A Sprite is a stack of <image> frames in the story's SVG world; exactly one is visible.
 * Frames are placed by an anchor (the feet, or the hands for pushing/pulling) on world x and
 * the floor, and mirrored when the character faces the other way. A soft halftone cast shadow
 * sits under the feet. Walks are picked by distance travelled, so reverse scroll walks back.
 */
import CAST from "./heroCast.json";

type Frame = { w: number; h: number; footX: number; left: number; right: number };
const M = CAST as Record<string, Frame>;
const NS = "http://www.w3.org/2000/svg";

/** Which way each drawing faces as drawn (+1 right, -1 left). */
function native(name: string): 1 | -1 {
  if (/^sales_acting_0[02345]/.test(name)) return -1;
  return 1;
}

export type Anchor = "foot" | "right" | "center";

export class Sprite {
  readonly g: SVGGElement;
  private imgs = new Map<string, SVGImageElement>();
  private shadow: SVGEllipseElement;
  private cur: string | null = null;

  constructor(parent: SVGGElement, names: string[], shadowFill = "url(#cast-shadow)") {
    this.g = document.createElementNS(NS, "g") as SVGGElement;
    this.shadow = document.createElementNS(NS, "ellipse") as SVGEllipseElement;
    this.shadow.setAttribute("fill", shadowFill);
    this.shadow.setAttribute("stroke", "none");
    this.g.appendChild(this.shadow);
    for (const n of names) {
      const m = M[n];
      if (!m) continue;
      const im = document.createElementNS(NS, "image") as SVGImageElement;
      im.setAttribute("href", `/hero/cast/${n}.webp`);
      im.setAttribute("width", String(m.w));
      im.setAttribute("height", String(m.h));
      im.setAttribute("preserveAspectRatio", "none");
      im.style.visibility = "hidden"; // hidden, not display:none, so every frame preloads
      this.g.appendChild(im);
      this.imgs.set(n, im);
    }
    parent.appendChild(this.g);
  }

  destroy() { this.g.remove(); }

  /** Show `name` with its anchor at world (x, footY), facing +1 right / -1 left. */
  show(name: string | null, x = 0, footY = 0, facing: 1 | -1 = 1, anchor: Anchor = "foot", shadow = true) {
    if (name && !this.imgs.has(name)) name = null; // unknown frame: show nothing rather than throw
    if (name !== this.cur) {
      if (this.cur) this.imgs.get(this.cur)!.style.visibility = "hidden";
      if (name) this.imgs.get(name)!.style.visibility = "visible";
      this.cur = name;
    }
    if (!name) {
      this.shadow.style.display = "none";
      return;
    }
    const m = M[name];
    const im = this.imgs.get(name)!;
    const ax = anchor === "foot" ? m.footX : anchor === "right" ? m.right : m.w / 2;
    im.setAttribute("x", (x - ax).toFixed(1));
    im.setAttribute("y", (footY - m.h).toFixed(1));
    // mirror around the anchor so the anchor stays put
    im.setAttribute("transform", facing === native(name) ? "" : `matrix(-1 0 0 1 ${(2 * x).toFixed(1)} 0)`);
    this.shadow.style.display = shadow ? "" : "none";
    if (shadow) {
      const cx = anchor === "foot" ? x : facing === native(name) ? x - ax + m.footX : x + ax - m.footX;
      this.shadow.setAttribute("cx", cx.toFixed(1));
      this.shadow.setAttribute("cy", (footY - 2).toFixed(1));
      this.shadow.setAttribute("rx", (m.w * 0.42).toFixed(1));
      this.shadow.setAttribute("ry", "11");
    }
  }
}

/** Walk-cycle frame from distance travelled (6 frames per `stride` world units). */
export const cycleFrame = (prefix: string, dist: number, from = 0, count = 6, stride = 170) => {
  const u = (((dist / stride) % 1) + 1) % 1;
  return `${prefix}${String(from + Math.floor(u * count) % count).padStart(2, "0")}`;
};

export const castFrames = (prefix: string) => Object.keys(M).filter((k) => k.startsWith(prefix));
