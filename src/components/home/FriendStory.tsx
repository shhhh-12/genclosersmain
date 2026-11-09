"use client";

/**
 * Home hero: a short story about what sales really is (from the founder's workshop notes).
 * No course selling in the hero. Desktop only (phones get LogoScrollHero).
 *
 *  OPEN     the intro closes on ink; the salesman pushes the ink away like a curtain: the café.
 *  1 PUSH   a stranger barges in, points: "Buy my fat loss program!". She bristles: "I don't need
 *           anything from you."  → freeze: "That stranger is you."
 *  2 REWIND the take plays backwards. The same stranger asks "Can I sit here?", sits, listens.
 *  3 WHY    "I want to lose weight." → Why? → For my health. → Why does it matter? → a polaroid.
 *  4 FRIEND "When can I start?", a handshake; they leave together and he drags the ink curtain
 *           closed, which becomes the About section.
 *
 * Comic-ink style (lib/inkRig.ts): side-view characters on a skeleton, so walking, sitting,
 * nodding, crossing arms and the handshake are joint motion. One SVG world; the camera is the
 * viewBox. A tall section with a sticky stage; ONE damped progress number drives everything
 * (lib/scrollScene.ts), so scrolling back plays the exact reverse (the walk too).
 */

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "@/components/ui/Icons";
import { createScrollScene, seg, lerp, clamp01, easeOut, easeInOut } from "@/lib/scrollScene";
import { LockupInner } from "@/components/wheel/BrandLockup";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { TONES } from "@/lib/tones";
import { RIG2_DEFS } from "@/lib/inkRig2";
import { Sprite, cycleFrame, castFrames } from "@/lib/spriteCast";
import CAST from "@/lib/heroCast.json";
import { createBrandPuppet, type BrandPuppet } from "@/lib/brandPuppet";

type Line = { text: string; accent?: string };
type Bubbles = Record<"push" | "react" | "ask" | "listen" | "want" | "why" | "health" | "why2" | "kids" | "start", string>;

// ---------- palette ----------
const PAPER = "#f3f1ec";
const INK = "#151313";
const CURTAIN = "#0c0b0b"; // same as the page's ink, so the curtain becomes the About section
const WHITE = "#ffffff";
const RED = "#e3101b";
const SUN = TONES[0];
const mix = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, ${PAPER})`;

// ---------- the world ----------
const FLOOR = 1140;
const TABLE = 993; // table top (the drawn bistro table; hands rest on it)
const CUST_X = 640; // his chair
const CHAIR_X = 950; // the empty chair across the table
const BARGE_X = 1052; // where the stranger stops when he barges in
// the red ring sits on the stranger's face in the freeze frame (front view frame, face centre measured from the drawing)
const FREEZE = CAST.sales_acting_01;
const RING_X = BARGE_X - FREEZE.footX + FREEZE.w * 0.537;
const RING_Y = FLOOR - FREEZE.h * 0.86;

// ---------- camera ----------
type Key = readonly [c: number, x: number, y: number, z: number, r: number, move: "hold" | "whip"];
const KEYS: Key[] = [
  [0.0, 800, 830, 0.98, 0, "hold"], // the café (the opening push reveals it)
  [0.08, 800, 830, 1.0, 0, "hold"],
  [0.105, 850, 830, 1.02, 0, "whip"], // pan with the stranger barging in
  [0.13, 900, 690, 1.7, 0, "whip"], // the first words: crash zoom on the pushy line
  [0.155, 900, 690, 1.78, 0, "hold"],
  [0.18, 640, 860, 1.6, 0, "whip"], // crash zoom on her
  [0.2, 640, 860, 1.66, 0, "hold"],
  [0.222, 790, 800, 1.1, 0, "whip"], // pull back: both of them
  [0.245, 790, 800, 1.14, 0, "hold"],
  [0.265, 1050, 820, 2.4, 0, "whip"], // freeze frame: crash zoom on the stranger ("That stranger is you.")
  [0.29, 1050, 820, 2.5, 0, "hold"],
  [0.335, 800, 830, 1.0, 0, "whip"], // rewind: snap back
  [0.5, 800, 820, 1.1, 0, "hold"], // slow dolly while the gentle version plays
  [0.535, 800, 820, 1.12, 0, "hold"],
  [0.575, 650, 790, 2.0, 0, "whip"], // crash zoom into "I want to lose weight."
  [0.6, 650, 790, 2.08, 0, "hold"],
  [0.64, 800, 1620, 1.5, 0, "whip"], // whip down the chain of questions
  [0.75, 800, 2120, 1.5, 0, "hold"],
  [0.78, 800, 2460, 1.55, 0, "whip"], // to the photo
  [0.86, 800, 2460, 1.72, 0, "hold"],
  [0.895, 800, 820, 1.18, 0, "whip"], // whip back up: the café, warm now
  [0.95, 800, 820, 1.22, 0, "hold"], // "When can I start?", then the handshake
  [1.0, 800, 840, 1.02, 0, "whip"], // a gentle pull back for the curtain
];
const LINE_AT: readonly (readonly [number, number])[] = [
  [0.16, 0.245],
  [0.264, 0.298], // after the freeze has isolated the stranger
  [0.345, 0.43],
  [0.435, 0.535],
  [0.79, 0.865],
  [0.935, 0.982], // gone before the curtain reaches it
];
// The opening push, timed like the reference loader: three shoves with holds, then a run-off.
// [progress reached, move seconds, hold seconds]; progress 1 = the curtain's edge at the right of the screen.
const SHOVES: readonly [number, number, number][] = [
  [0.3, 0.65, 0.16],
  [0.6, 0.72, 0.2],
  [1.28, 1.46, 0],
];
// Café depth: halftone cast shadows, warm wall/floor tones, golden window light (owner, 2026-11-09)
const CAFE_DEFS = `
<pattern id="cast-shadow" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)" stroke="none"><circle cx="2.5" cy="2.5" r="1.5" fill="#151313" fill-opacity="0.55"/></pattern>
<linearGradient id="wall-tone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f1ec"/><stop offset="1" stop-color="#ebe5d9"/></linearGradient>
<linearGradient id="floor-tone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6dfd1"/><stop offset="1" stop-color="#f3f1ec"/></linearGradient>
<linearGradient id="lamp-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf73" stop-opacity="0.55"/><stop offset="0.55" stop-color="#ffcf73" stop-opacity="0.16"/><stop offset="1" stop-color="#ffcf73" stop-opacity="0"/></linearGradient>
<linearGradient id="cafe-under" x1="0" y1="0" x2="0" y2="1"><stop class="under-stop" offset="0" stop-opacity="0"/><stop class="under-stop" offset="1" stop-opacity="1"/></linearGradient>
<radialGradient id="lamp-bulb"><stop offset="0" stop-color="#fff3c4" stop-opacity="0.95"/><stop offset="0.35" stop-color="#ffcf73" stop-opacity="0.5"/><stop offset="1" stop-color="#ffcf73" stop-opacity="0"/></radialGradient>`;
// Hanging lamps in front of the scene. Each swings like a pendulum about its ceiling point;
// a cursor (or finger) passing through gives it a push. The light cone swings with it.
const LAMP_PIVOT = 160; // ceiling (above the view)
const LAMP_H = 236; // the drawn lamp, cord top to bulb
const LAMP_BOTTOM = 600;
const LAMP_RIM = LAMP_BOTTOM - LAMP_H * 0.13; // the shade's lower rim in the drawing
const LAMPS = [460, 700, 940]; // all three inside the opening frame, clear of the day/night switch
const BOOT_SECONDS = SHOVES.reduce((n, s) => n + s[1] + s[2], 0);
const power2InOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
/** Push progress after `sec` seconds, and whether he is holding (catching his breath). */
function shoveAt(sec: number) {
  let t = sec;
  let from = 0;
  for (let i = 0; i < SHOVES.length; i++) {
    const [to, move, hold] = SHOVES[i];
    if (t <= move) {
      const u = clamp01(t / move);
      const e = i === SHOVES.length - 1 ? u * u * u : power2InOut(u);
      return { p: lerp(from, to, e), hold: -1 };
    }
    t -= move;
    if (t <= hold) return { p: to, hold: t };
    t -= hold;
    from = to;
  }
  return { p: SHOVES[SHOVES.length - 1][0], hold: -1 };
}
/** Comic pop on twos (12 fps): small → overshoot → settle. */
const popStep = (sec: number) => {
  const st = Math.floor(sec * 12);
  return st <= 0 ? 0.55 : st === 1 ? 1.15 : 1;
};

const pop = (s: number) => easeOut(s);
const READ_WINDOW = 5; // letters lit red at once (same as ScrollRead)
const tri = (c: number, a: number, b: number) => Math.sin(Math.PI * seg(c, a, b));

function camAt(c: number) {
  let i = 0;
  while (i < KEYS.length - 2 && c > KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = clamp01((c - a[0]) / (b[0] - a[0]));
  const e = b[5] === "whip" ? easeInOut(t) : t;
  return { x: lerp(a[1], b[1], e), y: lerp(a[2], b[2], e), z: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), e)), r: lerp(a[4], b[4], e) };
}

/** A shield around her: round when calm, spiky when pushed. */
function shieldPath(cx: number, cy: number, rx: number, ry: number, spike: number, t: number) {
  const n = 48;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + spike * (i % 2 ? 0.3 : -0.07) + 0.015 * Math.sin(a * 3 + t);
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`;
  }
  return d + "Z";
}

/** A comic speech balloon with white hand-lettered words: red for the salesman, ink for the customer. */
function Bubble({ x, y, text, who = "person", tail = "d", cls, size = 26 }: { x: number; y: number; text: string; who?: "stranger" | "person"; tail?: "l" | "r" | "d"; cls?: string; size?: number }) {
  const w = Math.max(90, text.length * size * 0.56 + 48);
  const h = size + 32;
  const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2, r = 14;
  const tx = tail === "l" ? x0 + 34 : tail === "r" ? x1 - 34 : 0;
  const d = `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${tx + 11}L${tx + (tail === "l" ? -8 : tail === "r" ? 8 : 0)} ${y1 + 18}L${tx - 11} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
  // owner 2026-11-10: the salesman speaks in red, the customer in ink; white words for both (day and night)
  const card = who === "stranger" ? RED : INK;
  const ink = WHITE;
  return (
    <g className={`${cls ?? ""} who-${who}`} data-x={x} data-y={y} transform={`translate(${x} ${y}) scale(0.94)`} style={{ opacity: 0 }}>
      <path d={d} fill={card} stroke={INK} strokeWidth={4} />
      <text x="0" y={size * 0.38} textAnchor="middle" fontFamily="var(--font-hand)" fontSize={size * 1.18} fill={ink} stroke="none">
        {text}
      </text>
    </g>
  );
}

/** A story line as letters, so the page's red reading highlight can pass through it. */
function ReadLine({ line }: { line: Line }) {
  const a = line.accent ? line.text.indexOf(line.accent) : -1;
  const aEnd = a < 0 ? -1 : a + (line.accent?.length ?? 0);
  const words = line.text.split(" ");
  const starts = words.map((_, wi) => words.slice(0, wi).reduce((n, w) => n + w.length + 1, 0));
  return (
    <span className="scroll-read" aria-label={line.text} role="text">
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {word.split("").map((ch, ci) => {
              const at = starts[wi] + ci;
              const idx = at - wi;
              return (
                <span key={idx} data-c={idx} data-s="0" className={at >= a && at < aEnd ? "text-signal" : undefined}>
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

function Accent({ line }: { line: Line }) {
  if (!line.accent) return <>{line.text}</>;
  const i = line.text.indexOf(line.accent);
  if (i < 0) return <>{line.text}</>;
  return (
    <>
      {line.text.slice(0, i)}
      <span className="text-signal">{line.accent}</span>
      {line.text.slice(i + line.accent.length)}
    </>
  );
}

/** The About heading as letters (thick and thin like the page), so the red reading highlight can pass through. */
function AboutHeading({ text, heavy }: { text: string; heavy?: string }) {
  const at = heavy ? text.indexOf(heavy) : -1;
  const words = text.split(" ");
  const starts = words.map((_, w) => words.slice(0, w).reduce((n, x) => n + x.length + 1, 0));
  const weight = (w: number) => (at < 0 ? "" : starts[w] < at + heavy!.length && starts[w] + words[w].length > at ? "font-bold" : "font-light");
  let idx = 0;
  return (
    <span className="scroll-read fs-about-read" aria-label={text} role="text">
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden className={`inline-block whitespace-nowrap ${weight(w)}`}>
            {word.split("").map((ch) => (
              <span key={idx} data-c={idx++} data-s="0">
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

// the melted shield rises as sparkles over the head
const SPARKS = Array.from({ length: 10 }, (_, i) => ({ a: -Math.PI * 0.88 + (i / 9) * Math.PI * 0.76, r: 170 + (i % 2) * 30 }));

export function FriendStory({
  lines,
  bubbles,
  rewind,
  coffee,
  eyebrows,
  scrollHint,
  night: nightCopy,
  about,
}: {
  lines: readonly Line[];
  bubbles: Bubbles;
  rewind: string;
  coffee: string;
  eyebrows: readonly string[];
  scrollHint: { text: string; accent: string };
  night: { toNight: string; toDay: string; label: string };
  about: { heading: string; heavy?: string; body: string; link?: { href: string; label: string } };
}) {
  const section = useRef<HTMLElement>(null);
  const motion = useMotionAllowed();
  const [night, setNight] = useState(false);

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    const q = <T extends Element>(s: string) => sec.querySelector<T>(s)!;
    const qa = <T extends Element>(s: string) => Array.from(sec.querySelectorAll<T>(s));

    // ---- the cast: hand-drawn frames (lib/spriteCast.ts) ----
    const SALES_ALL = [...castFrames("sales_walk_push_"), ...castFrames("sales_acting_")];
    const sales = new Sprite(q<SVGGElement>(".slot-sales"), SALES_ALL);
    const hauler = new Sprite(q<SVGGElement>(".slot-top"), [...castFrames("sales_walk_push_"), ...castFrames("sales_pull_")]);
    const cust = new Sprite(q<SVGGElement>(".slot-customer"), castFrames("cust_"));
    const pair = new Sprite(q<SVGGElement>(".slot-sales"), castFrames("handshake_"));
    const sprites = [sales, hauler, cust, pair];

    if (!motion) {
      // Reduced motion: the warm ending, still
      pair.show("handshake_01", 800, FLOOR, 1, "center");
      return () => sprites.forEach((x) => x.destroy());
    }

    const stage = q<HTMLElement>(".fs-stage");
    const inner = q<HTMLElement>(".fs-inner");
    const svg = q<SVGSVGElement>(".fs-front");
    const svgBack = q<SVGSVGElement>(".fs-back");
    const svgTop = q<SVGSVGElement>(".fs-top");
    const aboutCard = q<HTMLElement>(".fs-about");
    const dayNight = q<HTMLElement>(".fs-daynight");
    const card = q<HTMLElement>(".fs-card");
    const aboutChars = qa<HTMLElement>(".fs-about-read [data-c]");
    const aboutState = aboutChars.map(() => -1);
    const lampEls = qa<SVGGElement>(".fs-lamp");
    const lamps = LAMPS.map(() => ({ a: 0, w: 0 }));
    const view = { l: 0, t: 0, w: 1, h: 1 };
    const shieldWrap = q<SVGGElement>(".p-shieldwrap");
    const cam = q<SVGGElement>(".fs-cam");
    const tape = q<HTMLElement>(".fs-rewind");
    const curtain = q<SVGRectElement>(".fs-curtain");
    const lineEls = qa<HTMLElement>(".fs-line");
    const set = (el: Element | null, tf: string) => el?.setAttribute("transform", tf);
    const showBubble = (el: SVGGElement, s: number, out = 1) => {
      const e = pop(s) * out;
      el.style.opacity = e.toFixed(3);
      set(el, `translate(${el.getAttribute("data-x")} ${el.getAttribute("data-y")}) scale(${((0.94 + 0.06 * e) * (narrow ? 0.9 : 1)).toFixed(4)})`);
    };
    const hint = q<HTMLElement>(".fs-hint");
    const effortFx = q<SVGGElement>(".fs-effort");
    let boot = 0;
    let bootStart = -1;
    const readChars = lineEls.map((el) => Array.from(el.querySelectorAll<HTMLElement>("[data-c]")));
    const readState = readChars.map((cs) => new Array<number>(cs.length).fill(-1));

    const person = q<SVGGElement>(".p-person");
    const shield = q<SVGPathElement>(".p-shield");
    const sparks = qa<SVGCircleElement>(".p-spark");
    const payoff = q<SVGGElement>(".cafe-payoff");
    const petals = qa<SVGPathElement>(".payoff-petal");
    const photo = q<SVGGElement>(".why-photo");
    const heart = q<SVGGElement>(".why-heart");
    const chain = q<SVGGElement>(".why-chain");
    const b = (k: string) => q<SVGGElement>(`.b-${k}`);
    const bPush = b("push"), bReact = b("react"), bAsk = b("ask"), bListen = b("listen"), bTalk = b("talk");
    const bWant = b("want"), bWhy = b("why"), bHealth = b("health"), bWhy2 = b("why2"), bStart = b("start");
    const youRing = q<SVGGElement>(".you-ring");

    let W = 1, H = 1, B = 1;
    let narrow = false;
    let coverAt = 0.85;
    let storyAt = 0.75; // the story ends here; the rest before coverAt is the About card reading itself
    let lastP = 0;
    let t = 0;
    const par = { x: 0, y: 0, tx: 0, ty: 0 };

    // Brand partner's pushing character (public/brand/huy/push.json). Absent -> the code salesman pushes.
    let brand: BrandPuppet | null = null;
    let dead = false;
    createBrandPuppet(q<SVGGElement>(".slot-top"), new URLSearchParams(window.location.search).has("brandDebug")).then((bp) => {
      if (dead) bp?.destroy();
      else brand = bp;
    });

    const measure = () => {
      W = Math.max(1, stage.clientWidth); // a hidden stage measures 0: never divide by it
      H = Math.max(1, stage.clientHeight);
      narrow = W < 768;
      // phones: a closer frame, the scene above the words (which sit at the bottom)
      B = narrow ? Math.min(W / 560, H / 700) : Math.min(W / 1200, H / 820);
      const vh = window.innerHeight;
      const range = Math.max(1, sec.offsetHeight - vh);
      coverAt = Math.max(0.5, (range - vh) / range);
      // the About card gets most of a screen of scroll to itself before the next section slides over it
      storyAt = coverAt - Math.min(0.14, (0.9 * vh) / range);
    };

    const render = (p: number) => {
      lastP = p;
      const c = clamp01(p / storyAt);

      // ---- camera: subject right of centre (the words live on the left) ----
      const k = camAt(c);
      const kz = narrow ? 0.75 + (k.z - 1) * 0.45 : k.z;
      const zs = kz * B;
      const vw = W / zs;
      const vhh = H / zs;
      const fx = narrow ? 0 : 0.25 * W; // the left part of the screen belongs to the words
      const fy = narrow ? 0.14 * H : 0.02 * H;
      const cx = k.x - fx / zs + (par.x * 26) / k.z;
      const cy = k.y + fy / zs + (par.y * 16) / k.z;
      const viewL = cx - vw / 2;
      const viewR = cx + vw / 2;
      const vb = `${viewL.toFixed(2)} ${(cy - vhh / 2).toFixed(2)} ${vw.toFixed(2)} ${vhh.toFixed(2)}`;
      svg.setAttribute("viewBox", vb);
      svgBack.setAttribute("viewBox", vb);
      svgTop.setAttribute("viewBox", vb);
      view.l = viewL;
      view.t = cy - vhh / 2;
      view.w = vw;
      view.h = vhh;
      set(cam, `rotate(${k.r.toFixed(3)} ${k.x.toFixed(1)} ${k.y.toFixed(1)})`);

      // ---- the ink curtain: pushed away at the start, dragged closed at the end ----
      let edge = viewR + 900; // off to the right: no curtain
      let haulKind: "push" | "pull" | null = null;
      let brandPushing = false;
      let effort = -1; // seconds into a hold (the effort marks pop), or -1
      if (boot < 1) {
        const sh = shoveAt(boot * BOOT_SECONDS);
        effort = sh.hold;
        // his steps are picked by how far the curtain has moved, so he freezes in the holds
        edge = viewL - 4 + sh.p * (viewR - viewL + 8);
        haulKind = "push";
        if (brand) {
          brandPushing = true;
          brand.update(edge, FLOOR, edge - (viewL - 4));
        }
      } else if (c > 0.972) {
        const e = easeInOut(seg(c, 0.972, 1));
        edge = lerp(viewR + 40, viewL - 4, e);
        haulKind = "pull";
      }
      // the opening card is paper with the lockup (HTML, moved in screen px); the ink curtain is only the ending
      curtain.setAttribute("x", haulKind === "push" ? "99999" : edge.toFixed(1));
      if (haulKind === "push") {
        card.style.display = "";
        card.style.transform = `translate3d(${(((edge - viewL) / vw) * W).toFixed(1)}px, 0, 0)`;
      } else card.style.display = "none";
      // closing at the end: the curtain is the About card (its words are revealed by the edge)
      if (haulKind === "pull" || c >= 1) {
        const sx = ((edge - viewL) / vw) * W;
        aboutCard.style.display = "";
        aboutCard.style.clipPath = `inset(0 0 0 ${Math.max(0, sx).toFixed(1)}px)`;
      } else aboutCard.style.display = "none";
      // its heading reads itself as you scroll on (the same red highlight as every heading on the page)
      {
        const rp = seg(p, storyAt, coverAt - (coverAt - storyAt) * 0.2);
        const front = rp * (aboutChars.length + READ_WINDOW);
        aboutChars.forEach((ch, i) => {
          const st = i < front - READ_WINDOW ? 2 : i < front ? 1 : 0;
          if (st !== aboutState[i]) {
            aboutState[i] = st;
            ch.dataset.s = String(st);
          }
        });
      }
      // the day/night switch belongs to the café: not during the opening push or on the About card
      const dnOn = boot >= 1 && c < 0.972;
      dayNight.style.opacity = dnOn ? "" : "0";
      dayNight.style.pointerEvents = dnOn ? "" : "none";
      // the hauler: hands on the curtain edge, drawn above it
      if (haulKind && !brandPushing) {
        const name = haulKind === "push" ? cycleFrame("sales_walk_push_", edge, 6, 6, 190) : cycleFrame("sales_pull_", -edge, 0, 6, 190);
        hauler.show(name, edge - 4, FLOOR, 1, "right");
      } else hauler.show(null);
      if (haulKind && effort >= 0) {
        effortFx.style.display = "";
        set(effortFx, `translate(${(edge - 120).toFixed(1)} ${(FLOOR - 430).toFixed(1)}) scale(${popStep(effort).toFixed(2)})`);
      } else effortFx.style.display = "none";

      // ---- rewind wash ----
      const tapeOn = tri(c, 0.285, 0.35);
      tape.style.opacity = tapeOn.toFixed(3);
      tape.classList.toggle("is-on", tapeOn > 0.02);

      // ---- the first screen: there is a story, scroll to play it ----
      const hinted = easeOut(seg(boot, 0.86, 1)) * (1 - seg(c, 0.012, 0.04));
      hint.style.opacity = hinted.toFixed(3);
      hint.style.transform = `translate3d(0, ${((1 - easeOut(seg(boot, 0.86, 1))) * 18 + seg(c, 0.012, 0.04) * -14).toFixed(1)}px, 0)`;

      // ---- lines ----
      lineEls.forEach((el, i) => {
        const [a, bb] = LINE_AT[i] ?? [2, 2];
        const inn = easeOut(seg(c, a, a + 0.018));
        const out = easeInOut(seg(c, bb - 0.012, bb));
        el.style.opacity = String(Math.min(inn, 1 - out));
        el.style.transform = `translate3d(0, ${((1 - inn) * 20 - out * 16).toFixed(1)}px, 0)`;
        const cs = readChars[i];
        const n = cs.length;
        const front = seg(c, a + 0.006, a + (bb - a) * 0.55) * (n + READ_WINDOW);
        for (let j = 0; j < n; j++) {
          const st = j < front - READ_WINDOW ? 2 : j < front ? 1 : 0;
          if (st !== readState[i][j]) {
            readState[i][j] = st;
            cs[j].dataset.s = String(st);
          }
        }
      });

      // ---- beats ----
      const barge = easeOut(seg(c, 0.085, 0.125)) * (1 - easeInOut(seg(c, 0.295, 0.33)));
      const spike = easeOut(seg(c, 0.172, 0.2)) * (1 - easeInOut(seg(c, 0.295, 0.33)));
      const swap = seg(c, 0.86, 0.865); // the ending is staged while the camera is down at the photo
      const isolate = seg(c, 0.25, 0.262) * (1 - seg(c, 0.29, 0.302));

      youRing.style.opacity = String(Math.min(seg(c, 0.258, 0.268), 1 - seg(c, 0.288, 0.296)));
      set(youRing, `translate(${RING_X.toFixed(1)} ${RING_Y.toFixed(1)}) scale(${pop(seg(c, 0.258, 0.272)).toFixed(3)}) rotate(${(c * 900).toFixed(1)})`);
      showBubble(bPush, seg(c, 0.105, 0.12), 1 - seg(c, 0.165, 0.178));
      showBubble(bReact, seg(c, 0.212, 0.228), 1 - seg(c, 0.248, 0.258));
      showBubble(bAsk, seg(c, 0.382, 0.395), 1 - seg(c, 0.422, 0.43));
      showBubble(bTalk, seg(c, 0.44, 0.452), 1 - seg(c, 0.5, 0.51));
      showBubble(bListen, seg(c, 0.458, 0.468), 1 - seg(c, 0.5, 0.51));
      showBubble(bWant, seg(c, 0.53, 0.545), 1 - seg(c, 0.62, 0.635));
      showBubble(bWhy, seg(c, 0.61, 0.63));
      showBubble(bHealth, seg(c, 0.665, 0.685));
      showBubble(bWhy2, seg(c, 0.715, 0.735));
      showBubble(bStart, seg(c, 0.905, 0.92), 1 - seg(c, 0.928, 0.936));

      // ---- the salesman (frames) ----
      let sName: string | null = null;
      let sx = 0;
      let sFacing: 1 | -1 = -1;
      let pairName: string | null = null;
      let cName: string | null = null;
      let cx2 = CUST_X + 64;
      const cFacing: 1 | -1 = 1;
      if (haulKind) {
        sName = null; // he is the hauler, drawn above the curtain
      } else if (c >= 0.865) {
        // the ending: standing, a handshake, then they leave together
        const shaking = c > 0.926 && c < 0.952;
        const out = easeInOut(seg(c, 0.955, 0.972));
        if (shaking) {
          const k = Math.floor(seg(c, 0.926, 0.952) * 9);
          pairName = `handshake_0${[1, 0, 1, 2, 1, 0, 1, 2, 1][Math.min(8, k)]}`;
        } else if (out > 0) {
          sx = lerp(905, 1760, out);
          sName = cycleFrame("sales_walk_push_", sx, 0);
          sFacing = 1;
          cx2 = lerp(700, 1500, out);
          cName = cycleFrame("cust_walk_stand_", cx2, 0);
        } else {
          sx = 905;
          sName = "sales_acting_05";
          cx2 = 700;
          cName = c > 0.905 && c < 0.922 ? "cust_walk_stand_07" : "cust_walk_stand_06";
        }
      } else if (c < 0.335) {
        // 1. barging in (the rewind walks him back out, so the walk plays backwards)
        sx = lerp(1700, BARGE_X, barge);
        const walking = barge > 0.001 && barge < 0.985;
        if (barge <= 0.001) sName = null;
        else if (walking) sName = cycleFrame("sales_walk_push_", sx, 0);
        else if (c > 0.252 && c < 0.296) { sName = "sales_acting_01"; sFacing = 1; } // freeze: caught out, front view
        else sName = "sales_acting_00"; // pointing with the fitness flyer
      } else {
        // 2. the same stranger, gently: walks in, asks, sits, listens
        const wIn = easeInOut(seg(c, 0.345, 0.395));
        const sit = easeInOut(seg(c, 0.405, 0.422));
        sx = lerp(1700, CHAIR_X + 60, wIn);
        if (c <= 0.344) sName = null;
        else if (sit > 0.5) { sx = CHAIR_X - 70; sName = c > 0.45 && c < 0.5 ? "sales_acting_03" : "sales_acting_04"; }
        else if (wIn < 0.985) sName = cycleFrame("sales_walk_push_", sx, 0);
        else sName = "sales_acting_02"; // "Can I sit here?"
      }
      // he goes above the curtain while hauling it, behind the table otherwise
      brand?.show(brandPushing);
      sales.show(sName, sx, FLOOR, sFacing);
      pair.show(pairName, 800, FLOOR, 1, "center");

      // ---- the customer (frames) ----
      if (c < 0.865) {
        const typing = c < 0.105 || (c > 0.345 && c < 0.395);
        cName =
          typing ? (Math.floor(t * 7) % 2 ? "cust_seated_01" : "cust_seated_00")
          : c < 0.172 ? "cust_seated_02"
          : c < 0.33 ? (spike > 0.4 ? "cust_seated_03" : "cust_seated_02")
          : c < 0.44 ? "cust_seated_04"
          : c < 0.5 ? "cust_seated_05"
          : c < 0.53 ? "cust_seated_06"
          : c < 0.62 ? "cust_seated_07"
          : "cust_seated_06";
        cx2 = CUST_X + 64;
      }
      if (pairName) cName = null;
      cust.show(cName, cx2, FLOOR, cFacing);

      // her shield: spikes when pushed, melts when listened to
      const melt = easeInOut(seg(c, 0.46, 0.52));
      shield.setAttribute("d", shieldPath(CUST_X + 18, 900, 128 + melt * 40, 190 + melt * 40, spike, t));
      const guard = Math.max(seg(c, 0.088, 0.115) * (1 - seg(c, 0.29, 0.32)), seg(c, 0.352, 0.385));
      shield.style.opacity = String(guard * (1 - melt) * (c < 0.86 ? 1 : 0));
      shield.style.fillOpacity = String(0.04 + 0.1 * spike);
      sparks.forEach((spk, i) => {
        const s = SPARKS[i];
        const d = easeOut(seg(c, 0.47, 0.53));
        spk.setAttribute("cx", (616 + Math.cos(s.a) * (s.r + d * 60)).toFixed(1));
        spk.setAttribute("cy", (880 + Math.sin(s.a) * (s.r + d * 60) - d * 80).toFixed(1));
        spk.style.opacity = String(seg(c, 0.465, 0.475) * (1 - seg(c, 0.52, 0.535)));
      });
      // the freeze isolates the stranger
      person.style.opacity = String(1 - 0.96 * isolate);
      shieldWrap.style.opacity = person.style.opacity;

      // ---- 3. the real why ----
      const ph = easeOut(seg(c, 0.765, 0.795));
      set(photo, `translate(800 2440) rotate(${lerp(-12, -3, ph).toFixed(2)}) scale(${pop(seg(c, 0.765, 0.795)).toFixed(3)})`);
      set(heart, `translate(935 2300) scale(${(pop(seg(c, 0.8, 0.82)) * (1 + 0.06 * Math.sin(t * 5))).toFixed(3)})`);
      chain.style.opacity = String(1 - swap);

      // ---- 4. the ending ----
      payoff.style.opacity = String(swap);
      petals.forEach((pt, i) => {
        const d = easeOut(seg(c, 0.936, 0.97));
        const a = (i / petals.length) * Math.PI * 2;
        const r = 120 + d * 120;
        set(pt, `translate(${(800 + Math.cos(a) * r).toFixed(1)} ${(820 + Math.sin(a) * r - d * 110).toFixed(1)}) rotate(${(a * 57 + d * 160).toFixed(1)})`);
        pt.style.opacity = String(seg(c, 0.936, 0.94) * (1 - seg(c, 0.962, 0.972)));
      });

      // ---- the rest of the page covers the stage ----
      const cv = easeInOut(seg(p, coverAt, 1));
      inner.style.transform = cv > 0 ? `scale(${(1 - 0.06 * cv).toFixed(4)})` : "";

    };

    const scene = createScrollScene(sec, render, { tau: 45, onMeasure: measure });
    if (lastP > 0.005) boot = 1; // opened mid-story: no opening push
    sec.classList.add("is-ready");

    // The life loop: time (blinks, typing, the opening push), pointer parallax
    let lraf = 0;
    let llast = 0;
    let visible = true;
    const life = (now: number) => {
      const dt = Math.min(48, now - llast || 16);
      llast = now;
      t += dt / 1000;
      // one extra beat on the logo card before he starts pushing (owner 2026-11-10)
      if (bootStart < 0 && document.documentElement.dataset.intro !== "play") bootStart = t + 1;
      if (boot < 1 && bootStart >= 0) {
        // scrolled during the push: let him finish it quickly (4x) so the curtain clears for the story
        if (lastP > 0.004) bootStart -= (dt / 1000) * 3;
        boot = clamp01((t - bootStart) / BOOT_SECONDS);
      }
      // lamps: damped pendulums (about 2 s a swing)
      const ds = dt / 1000;
      lamps.forEach((lp, i) => {
        lp.w += (-9 * lp.a - 0.55 * lp.w) * ds;
        lp.a += lp.w * ds;
        lampEls[i]?.setAttribute("transform", `rotate(${((lp.a * 180) / Math.PI).toFixed(2)} ${LAMPS[i]} ${LAMP_PIVOT})`);
      });
      par.x += (par.tx - par.x) * 0.08;
      par.y += (par.ty - par.y) * 0.08;
      render(lastP);
      lraf = visible ? requestAnimationFrame(life) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !lraf) {
        llast = performance.now();
        lraf = requestAnimationFrame(life);
      }
    });
    io.observe(stage);

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let lastWX = NaN;
    let lastMove = 0;
    const onMove = (e: PointerEvent) => {
      if (fine) {
        par.tx = (e.clientX / window.innerWidth) * 2 - 1;
        par.ty = (e.clientY / window.innerHeight) * 2 - 1;
      }
      // a lamp the pointer passes through gets pushed the way the pointer moves
      const r = stage.getBoundingClientRect();
      const wx = view.l + ((e.clientX - r.left) / r.width) * view.w;
      const wy = view.t + ((e.clientY - r.top) / r.height) * view.h;
      const now = performance.now();
      const vx = Number.isNaN(lastWX) ? 0 : (wx - lastWX) / Math.max(8, now - lastMove);
      lastWX = wx;
      lastMove = now;
      const len = LAMP_BOTTOM - LAMP_PIVOT;
      // only before the story starts; once it has, a swinging lamp just settles on its own
      if (lastP > 0.004) return;
      lamps.forEach((lp, i) => {
        // where the lamp hangs now: the cord, then the shade near its end
        const u = (wy - LAMP_PIVOT) / len;
        if (u < 0.45 || u > 1.05) return;
        const ax = LAMPS[i] + Math.sin(lp.a) * len * u;
        const reach = u > 0.75 ? 62 : 14;
        if (Math.abs(wx - ax) > reach) return;
        // a gentle nudge per move; a fast pass tops out around a 15 degree swing
        lp.w = Math.max(-0.8, Math.min(0.8, lp.w + Math.max(-0.22, Math.min(0.22, vx * 0.12))));
      });
    };
    stage.addEventListener("pointermove", onMove);

    // Tap her: the shield flinches
    let tapT = 0;
    const tap = () => {
      svg.classList.remove("is-poked");
      void svg.getBoundingClientRect();
      svg.classList.add("is-poked");
      window.clearTimeout(tapT);
      tapT = window.setTimeout(() => svg.classList.remove("is-poked"), 700);
    };
    const hit = q<SVGRectElement>(".p-hit");
    hit.addEventListener("click", tap);

    // Click her coffee: "Don't touch my coffee!". Click it fast (3 times in under a second): angry.
    const cupHit = q<SVGRectElement>(".cup-hit");
    let clicks: number[] = [];
    let cupT = 0;
    const onCup = () => {
      const now = performance.now();
      clicks = [...clicks.filter((x) => now - x < 900), now];
      const angry = clicks.length >= 3;
      svg.classList.remove("cup-said", "cup-angry");
      void svg.getBoundingClientRect();
      svg.classList.add("cup-said");
      if (angry) svg.classList.add("cup-angry");
      window.clearTimeout(cupT);
      cupT = window.setTimeout(() => svg.classList.remove("cup-said", "cup-angry"), angry ? 2200 : 1700);
    };
    cupHit.addEventListener("click", onCup);

    const html = document.documentElement;

    const mo = new MutationObserver(() => {
      if (html.dataset.intro !== "play") scene.remeasure();
    });
    mo.observe(html, { attributes: true, attributeFilter: ["data-intro"] });

    return () => {
      dead = true;
      brand?.destroy();
      mo.disconnect();
      io.disconnect();
      scene.destroy();
      cancelAnimationFrame(lraf);
      window.clearTimeout(tapT);
      stage.removeEventListener("pointermove", onMove);
      hit.removeEventListener("click", tap);
      cupHit.removeEventListener("click", onCup);
      window.clearTimeout(cupT);
      sec.classList.remove("is-ready");
      sprites.forEach((x) => x.destroy());
    };
  }, [motion]);

  return (
    <section ref={section} className={`friend-story relative h-[640svh] bg-paper motion-reduce:h-auto${night ? " is-night" : ""}`}>
      <h1 className="sr-only">{lines.map((l) => l.text).join(" ")}</h1>
      <div className="fs-stage sticky top-0 h-[100svh] overflow-hidden bg-paper motion-reduce:static">
        <div className="fs-inner absolute inset-0 origin-center">
          <svg
            aria-hidden
            className="fs-world fs-back absolute inset-0 h-full w-full"
            viewBox={motion ? "-200 380 1500 900" : "380 560 900 640"}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs dangerouslySetInnerHTML={{ __html: RIG2_DEFS + CAFE_DEFS }} />
            <g className="fs-cam">
              {/* ============ the café ============ */}
              <rect x="-2000" y="-400" width="6000" height={FLOOR + 400} fill="url(#wall-tone)" stroke="none" />
              <rect x="-2000" y={FLOOR} width="6000" height="1400" fill="url(#floor-tone)" stroke="none" />
              {/* the café itself, drawn in the same ink style and softened so the two in front read first:
                  glowing windows, the counter and a few customers at the back. The edges are mirrored so the
                  camera never runs off it. Night = the same room after dark (crossfades in). */}
              <image className="cafe-bg" href="/hero/cast/cafe_bg.webp" x="-860" y="37" width="3000" height="1586" preserveAspectRatio="none" />
              <image className="cafe-night" href="/hero/cast/cafe_night.webp" x="-860" y="37" width="3000" height="1586" preserveAspectRatio="none" />
              {/* depth: the room sits back behind a soft wash so the two in front read first */}
              <rect className="cafe-soft" x="-2000" y="-400" width="6000" height="3000" stroke="none" />
              {/* below the room (the why-chain): the drawing fades into one plain tone, no seam */}
              <rect x="-2000" y="1290" width="6000" height="334" fill="url(#cafe-under)" stroke="none" />
              <rect className="cafe-under" x="-2000" y="1622" width="6000" height="3000" stroke="none" />
              <ellipse cx="800" cy={FLOOR - 2} rx="150" ry="12" fill="url(#cast-shadow)" stroke="none" />
              {/* the two chairs (behind the sitters) */}
              <image href="/hero/cast/prop_chair_r.webp" x={CUST_X - 86} y={FLOOR - 178} width={112} height={178} preserveAspectRatio="none" />
              <image href="/hero/cast/prop_chair_l.webp" x={CHAIR_X - 46} y={FLOOR - 178} width={112} height={178} preserveAspectRatio="none" />

              {/* the salesman and the customer */}
              <g className="slot-sales" />
              <g className="p-person">
                <g className="slot-customer" />
              </g>
              {/* the table, his laptop and his coffee (in front of them) */}
              <image href="/hero/cast/prop_table.webp" x={714} y={TABLE - 13} width={172} height={FLOOR - TABLE + 13} preserveAspectRatio="none" />
              <image href="/hero/cast/prop_laptop.webp" x={CUST_X + 72} y={TABLE - 62} width={83} height={64} preserveAspectRatio="none" />
              <image href="/hero/cast/prop_cup.webp" x={818} y={TABLE - 38} width={33} height={40} preserveAspectRatio="none" />
            </g>
          </svg>


          <svg
            aria-hidden
            className="fs-world fs-front absolute inset-0 h-full w-full"
            viewBox={motion ? "-200 380 1500 900" : "380 560 900 640"}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g className="fs-cam">
              <g className="p-shieldwrap">
                <path className="p-shield" d={shieldPath(CUST_X + 18, 900, 128, 190, 0, 0)} stroke={INK} fill={INK} style={{ fillOpacity: 0.04 }} strokeDasharray="10 8" strokeWidth={3} opacity={0.75} />
                {SPARKS.map((_, i) => (
                  <circle key={i} className="p-spark" r="5" fill={RED} stroke="none" style={{ opacity: 0 }} />
                ))}
              </g>

              {/* hanging lamps, in front: hover through one and it swings (its light swings with it) */}
              {LAMPS.map((x) => (
                <g key={x} className="fs-lamp">
                  <path className="lamp-cone" d={`M${x - 57} ${LAMP_RIM}L${x + 57} ${LAMP_RIM}L${x + 270} ${FLOOR + 30}L${x - 270} ${FLOOR + 30}Z`} fill="url(#lamp-cone)" stroke="none" />
                  <path d={`M${x} ${LAMP_PIVOT - 400}V${LAMP_BOTTOM - LAMP_H + 4}`} strokeWidth={2.5} />
                  <image href="/hero/cast/prop_lamp.webp" x={x - 60} y={LAMP_BOTTOM - LAMP_H} width={120} height={LAMP_H} preserveAspectRatio="none" />
                  <circle className="lamp-bulb" cx={x} cy={LAMP_BOTTOM - 22} r={60} fill="url(#lamp-bulb)" stroke="none" />
                </g>
              ))}

              {/* just for fun: click her coffee. She says it (the tail points at her). */}
              <g transform="translate(740 820)">
                <g className="cup-say who-person">
                  <path d="M-134 -27H134Q148 -27 148 -13V13Q148 27 134 27H-94L-128 50L-108 27H-134Q-148 27 -148 13V-13Q-148 -27 -134 -27Z" fill={INK} strokeWidth={4} />
                  <text x="0" y="8" textAnchor="middle" fontFamily="var(--font-hand)" fontSize={25} fill={WHITE} stroke="none">
                    {coffee}
                  </text>
                </g>
                <g className="cup-say-angry who-person">
                  <path d="M-166 -27H166Q180 -27 180 -13V13Q180 27 166 27H-126L-160 50L-140 27H-166Q-180 27 -180 13V-13Q-180 -27 -166 -27Z" fill={INK} strokeWidth={4} />
                  <text x="0" y="8" textAnchor="middle" fontFamily="var(--font-hand)" fontSize={25} fill={WHITE} stroke="none">
                    {coffee} 😠😡
                  </text>
                </g>
              </g>

              {/* the ending: confetti */}
              <g className="cafe-payoff" style={{ opacity: 0 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <path key={i} className="payoff-petal" d="M0 -10c8 4 8 16 0 20c-8-4-8-16 0-20z" fill={i % 3 ? WHITE : RED} strokeWidth={3} style={{ opacity: 0 }} />
                ))}
              </g>

              {/* speech */}
              <Bubble cls="b-push" x={900} y={650} text={bubbles.push} who="stranger" tail="r" />
              <Bubble cls="b-react" x={580} y={700} text={bubbles.react} who="person" tail="d" size={22} />
              <Bubble cls="b-ask" x={1010} y={640} text={bubbles.ask} who="stranger" tail="r" />
              <Bubble cls="b-talk" x={600} y={740} text="• • •" who="person" tail="d" />
              <Bubble cls="b-listen" x={1000} y={760} text={bubbles.listen} who="stranger" tail="r" />
              <Bubble cls="b-want" x={660} y={720} text={bubbles.want} who="person" tail="d" size={22} />

              {/* ============ the real why (a chain under the café) ============ */}
              <g className="why-chain">
                <path className="why-line" d="M800 1300V2300" strokeDasharray="4 14" strokeWidth={3} opacity="0.4" />
                <Bubble cls="b-why" x={800} y={1620} text={bubbles.why} who="stranger" tail="r" size={34} />
                <Bubble cls="b-health" x={800} y={1870} text={bubbles.health} who="person" tail="l" size={34} />
                <Bubble cls="b-why2" x={800} y={2120} text={bubbles.why2} who="stranger" tail="r" size={34} />
                <g className="why-photo" transform="translate(800 2440) scale(0)">
                  {/* a polaroid: white frame, a hard ink shadow, her and her two kids */}
                  <rect x="-150" y="-150" width="300" height="330" rx="4" fill={INK} stroke="none" transform="translate(10 12)" />
                  <rect x="-150" y="-150" width="300" height="330" rx="4" fill={WHITE} strokeWidth={4} />
                  <clipPath id="fs-photo-clip">
                    <rect x="-130" y="-130" width="260" height="230" />
                  </clipPath>
                  <rect x="-130" y="-130" width="260" height="230" fill={mix(SUN, 45)} strokeWidth={3} />
                  <image href="/hero/cast/polaroid.webp" x="-130" y="-130" width="260" height="230" preserveAspectRatio="xMidYMid slice" clipPath="url(#fs-photo-clip)" />
                  <rect x="-130" y="-130" width="260" height="230" strokeWidth={3} />
                  <text x="0" y="154" textAnchor="middle" fontFamily="var(--font-hand)" fontSize={38} fill={INK} stroke="none">
                    {bubbles.kids}
                  </text>
                </g>
                <g className="why-heart" transform="translate(935 2300) scale(0)">
                  <path d="M0 18c-17-11-25-20-25-29a12.5 12.5 0 0 1 25-4.5a12.5 12.5 0 0 1 25 4.5c0 9-8 18-25 29z" fill={RED} strokeWidth={4} />
                </g>
              </g>
              <Bubble cls="b-start" x={640} y={640} text={bubbles.start} who="person" tail="d" />
              {/* the twist: a red ring around the stranger, "That stranger is you." */}
              <g className="you-ring" transform="translate(1036 778) scale(0)" style={{ opacity: 0 }}>
                <circle r="104" stroke={RED} strokeWidth={5} strokeDasharray="14 12" fill="none" />
              </g>

              {/* the ink curtain (the intro closes onto it; it becomes the About section at the end) */}
              <rect className="fs-curtain" x={99999} y="-6000" width="20000" height="20000" fill={CURTAIN} stroke="none" />
              {/* tap targets, on top of everything (the art itself ignores the mouse) */}
              <rect className="p-hit" x="575" y="830" width="150" height="250" fill="transparent" stroke="none" style={{ cursor: "pointer" }} />
              <rect className="cup-hit" x="810" y="945" width="50" height="52" fill="transparent" stroke="none" style={{ cursor: "pointer" }} />
            </g>
          </svg>

          {/* depth: warm golden glow from the window side and a soft vignette */}
          <div aria-hidden className="fs-light pointer-events-none absolute inset-0 motion-reduce:hidden" />
          {/* the rewind: the picture dims while the pushy take plays backwards */}
          <div className="fs-rewind pointer-events-none absolute inset-0 opacity-0 motion-reduce:hidden">
            <div className="fs-tape-wash absolute inset-0 bg-ink/55" />
            <div className="fs-tape-lines absolute inset-0" />
            <div className="fs-tape-band absolute inset-x-0 h-[14svh]" />
            <p className="fs-tape-label absolute top-28 left-1/2 flex -translate-x-1/2 items-center gap-3 font-mono text-label tracking-[0.2em] whitespace-nowrap text-paper uppercase">
              <svg viewBox="0 0 24 12" className="h-3 w-6" fill="currentColor" aria-hidden>
                <path d="M12 0v12L0 6zM24 0v12L12 6z" />
              </svg>
              {rewind}
            </p>
          </div>

          {/* a soft scrim behind the words so they stay readable over the café */}
          <div aria-hidden className="fs-scrim pointer-events-none absolute inset-0 motion-reduce:hidden" />
          {/* the lines: left at mid height */}
          <div className="fs-words pointer-events-none absolute inset-0 px-(--gutter) motion-reduce:static motion-reduce:py-12">
            <div className="relative mx-auto h-full max-w-(--container-page)">
              <div className="fs-hint absolute bottom-[9svh] left-0 motion-reduce:hidden md:bottom-[38svh]" style={{ opacity: 0 }}>
                <p className="max-w-[12ch] font-display text-h2 leading-[1.02] font-semibold tracking-[-0.03em] text-balance text-ink">
                  <Accent line={{ text: scrollHint.text, accent: scrollHint.accent }} />
                </p>
              </div>
              {lines.map((l, i) => (
                <div key={l.text} className="fs-line absolute bottom-[9svh] left-0 motion-reduce:static motion-reduce:mb-6 md:bottom-[40svh]" style={motion ? { opacity: 0 } : undefined}>
                  <p className="fs-scene mb-3 inline-block -rotate-2 text-[1.7rem] leading-none text-ink/70" style={{ fontFamily: "var(--font-hand)" }}>
                    {eyebrows[i]}
                    <svg viewBox="0 0 120 8" className="mt-1 block h-2 w-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                      <path d="M2 5c18-4 34 2 52-1s40-2 64 0" />
                    </svg>
                  </p>
                  <p className="max-w-[11ch] font-display text-h1 leading-[0.98] font-semibold tracking-[-0.035em] text-balance text-ink motion-reduce:text-h2">
                    {motion ? <ReadLine line={l} /> : <Accent line={l} />}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* the end: the ink curtain he drags closed is the About card */}
          <div className="fs-about absolute inset-0 flex items-center bg-ink px-(--gutter) motion-reduce:hidden" style={{ display: "none" }}>
            <div className="mx-auto grid w-full max-w-(--container-page) gap-10 md:grid-cols-12">
              <h2 className="font-display text-h1 font-light tracking-[-0.035em] text-balance text-paper md:col-span-8">
                <AboutHeading text={about.heading} heavy={about.heavy} />
              </h2>
              <div className="md:col-span-6 md:col-start-7">
                <p className="text-lead text-mute-dark">{about.body}</p>
                {/* a quiet way on for people who enjoyed the story (owner 2026-11-10) */}
                {about.link && (
                  <Link href={about.link.href} className="group mt-8 inline-flex items-center gap-3 font-display text-[1.125rem] font-medium text-paper">
                    <span className="border-b border-paper/30 pb-0.5 transition-colors group-hover:border-signal group-hover:text-signal">{about.link.label}</span>
                    <span className="text-signal transition-transform duration-450 ease-primary group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* the opening: the intro's paper screen with the lockup, as a card he shoves off to the right */}
          <div aria-hidden className="fs-card absolute inset-0 bg-paper motion-reduce:hidden" style={motion ? undefined : { display: "none" }}>
            <div className="wheel-size absolute inset-0 leading-none">
              <div className="absolute top-1/2 left-[calc(var(--gutter)+1.1em-1.0105em)] flex -translate-y-1/2 items-center font-display leading-none font-bold text-ink sm:left-[calc(27.9vw-1.0105em)] [&_.brand-logo]:text-signal">
                <LockupInner />
              </div>
            </div>
          </div>

          <svg aria-hidden className="fs-world fs-top pointer-events-none absolute inset-0 h-full w-full" viewBox={motion ? "-200 380 1500 900" : "380 560 900 640"} preserveAspectRatio="xMidYMid slice" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            <g className="slot-top" />
              {/* effort marks while he catches his breath between shoves (comic pop on twos) */}
              <g className="fs-effort" style={{ display: "none" }}>
                <path d="M-46 -8q-10 15 0 21q10 -6 0 -21z" fill={WHITE} strokeWidth={3} />
                <path d="M-70 18q-7 10 0 14q7 -4 0 -14z" fill={WHITE} strokeWidth={2.6} />
                <path d="M-14 -40l-6 -16M6 -46v-17M26 -40l7 -15" strokeWidth={4} />
                <path d="M64 30q10 3 0 9q10 3 0 9M80 18q8 2 0 7q8 2 0 7" strokeWidth={3} />
              </g>
          </svg>

          {/* day / night (this scene only) */}
          <button
            type="button"
            onClick={() => setNight((n) => !n)}
            aria-pressed={night}
            aria-label={nightCopy.label}
            className="fs-daynight absolute top-24 transition-opacity duration-450 right-(--gutter) z-10 flex items-center gap-2 rounded-full border border-ink/15 bg-paper/80 py-2 pr-4 pl-2 font-mono text-label tracking-[0.16em] text-ink uppercase backdrop-blur-sm motion-reduce:hidden md:top-28"
          >
            <span className="relative grid size-7 place-items-center rounded-full bg-ink text-paper">
              {night ? (
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="4.2" />
                  <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M20 14.6A8.5 8.5 0 0 1 9.4 4a8.5 8.5 0 1 0 10.6 10.6z" />
                </svg>
              )}
            </span>
            {night ? nightCopy.toDay : nightCopy.toNight}
          </button>
        </div>
      </div>
    </section>
  );
}
