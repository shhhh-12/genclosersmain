/**
 * Brand-partner character slot for the hero's opening push.
 *
 * Drop the partner's Lottie export at `public/brand/huy/push.json` (sent by the artist, with the
 * written OK). If the file is there, the hero's opening push uses it; if not, the hero keeps the
 * code-drawn salesman. No code change needed when the file lands.
 *
 * The Lottie is never played on its own clock: its frame comes from how far the curtain has been
 * pushed (like the artist's own loader), so the walk cycle stops when the curtain stops and
 * scrolling back plays it in reverse.
 *
 * Everything that depends on the actual artwork (where the hands and feet sit in the comp, size,
 * cycle length) lives in BRAND_PUSH below. Tune it once the file arrives: open
 * http://localhost:3000/?brandDebug=1 to see the anchor markers.
 */

export const BRAND_PUSH = {
  src: "/brand/huy/push.json",
  /** Where his pushing hands are, as a fraction of the comp (0..1, from top-left). */
  hand: [0.86, 0.46] as [number, number],
  /** Where his feet touch the floor, as a fraction of the comp height. */
  floor: 0.93,
  /** His height on screen in world units (the code salesman stands ~330 tall). */
  height: 420,
  /** Fraction of the comp height his body actually spans (top of head to soles). */
  bodySpan: 0.62,
  /** World units of curtain travel per full walk cycle (bigger = slower steps). */
  cycle: 520,
  /** Same multiplier the artist's loader uses on progress -> frame. */
  speed: 1.08,
};

type LottieAnim = {
  totalFrames: number;
  goToAndStop: (v: number, isFrame?: boolean) => void;
  destroy: () => void;
  addEventListener: (n: string, f: () => void) => void;
};
type AnimData = { w: number; h: number; ip: number; op: number };

export type BrandPuppet = {
  ready: boolean;
  /** Place him at the curtain edge (world x), feet on `floor` (world y), pushed `dist` so far. */
  update: (edgeX: number, floorY: number, dist: number) => void;
  show: (on: boolean) => void;
  destroy: () => void;
};

const NS = "http://www.w3.org/2000/svg";
const XHTML = "http://www.w3.org/1999/xhtml";

/** Loads the brand Lottie into `parent` (an SVG <g> in the hero's world). Resolves null if absent. */
export async function createBrandPuppet(parent: SVGGElement, debug = false): Promise<BrandPuppet | null> {
  // Off unless switched on (NEXT_PUBLIC_BRAND_PUSH=1), so visitors never request a missing file
  if (process.env.NEXT_PUBLIC_BRAND_PUSH !== "1" && !debug) return null;
  let data: AnimData;
  try {
    const res = await fetch(BRAND_PUSH.src, { cache: "no-cache" });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) return null;
    data = await res.json();
  } catch {
    return null;
  }
  const { default: lottie } = await import("lottie-web/build/player/lottie_light");

  const cfg = BRAND_PUSH;
  const scale = cfg.height / (data.h * cfg.bodySpan); // world units per comp px
  const w = data.w * scale, h = data.h * scale;

  const g = document.createElementNS(NS, "g") as SVGGElement;
  g.setAttribute("class", "brand-puppet");
  g.style.display = "none";
  const fo = document.createElementNS(NS, "foreignObject");
  fo.setAttribute("width", w.toFixed(1));
  fo.setAttribute("height", h.toFixed(1));
  fo.setAttribute("overflow", "visible");
  const box = document.createElementNS(XHTML, "div") as HTMLDivElement;
  box.style.cssText = "width:100%;height:100%;pointer-events:none";
  fo.appendChild(box);
  g.appendChild(fo);
  if (debug) {
    g.insertAdjacentHTML(
      "beforeend",
      `<rect width="${w}" height="${h}" fill="none" stroke="#e3101b" stroke-dasharray="8 6"/>` +
        `<circle cx="${cfg.hand[0] * w}" cy="${cfg.hand[1] * h}" r="10" fill="#e3101b"/>` +
        `<line x1="0" x2="${w}" y1="${cfg.floor * h}" y2="${cfg.floor * h}" stroke="#e3101b" stroke-width="3"/>`,
    );
  }
  parent.appendChild(g);

  const anim = lottie.loadAnimation({
    container: box,
    renderer: "svg",
    loop: false,
    autoplay: false,
    animationData: data,
    rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
  }) as unknown as LottieAnim;

  const n = Math.max(1, (data.op ?? 1) - (data.ip ?? 0));
  let lastF = -1;
  return {
    ready: true,
    update(edgeX, floorY, dist) {
      // hands on the curtain edge, feet on the floor
      const x = edgeX - cfg.hand[0] * w;
      const y = floorY - cfg.floor * h;
      g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      const f = ((((dist / cfg.cycle) * n * cfg.speed) % n) + n) % n;
      const fr = Math.round(f * 2) / 2;
      if (fr !== lastF) {
        anim.goToAndStop(fr, true);
        lastF = fr;
      }
    },
    show(on) {
      g.style.display = on ? "" : "none";
    },
    destroy() {
      anim.destroy();
      g.remove();
    },
  };
}
