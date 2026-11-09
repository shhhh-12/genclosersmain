/**
 * Comic-ink rig v2: a cut-out puppet. Each bone is an SVG <g> holding a hand-drawn part
 * (lib/inkArt/*), placed every frame with translate + rotate only (no path rewriting).
 * Same skeleton, poses and update() signature as lib/inkRig.ts, plus swap slots:
 *   view   "profile" | "threeQuarter" | "front"  (head drawing)
 *   hands  [back, front] hand drawings (lib/inkArt/hands.ts); inferred from the face if omitted
 * Pure function of the pose, so scrubbing backwards plays the exact reverse.
 * Only the salesman has v2 art so far; other kinds fall back to v1.
 */
import { joints, RIG_DEFS, type Pose, type Rig, type Kind } from "./inkRig";
import { HANDS } from "./inkArt/hands";
import { ART_DEFS } from "./inkArt/pen";
import { spineOf } from "./inkArt/skin";
import { armShapes, legShapes, type Shape } from "./inkArt/limbs";
import * as SALES from "./inkArt/salesman";
import * as CUST from "./inkArt/customer";

export const RIG2_DEFS = RIG_DEFS + ART_DEFS;
export type View = SALES.View;
export type Rig2Opts = {
  face?: string;
  facing?: 1 | -1;
  blink?: boolean;
  flyer?: boolean;
  tieSwing?: number;
  view?: View;
  hands?: [string, string];
  /** body squash about the pelvis (+ = squash down, - = stretch), e.g. 0.03 on a foot plant */
  squash?: number;
};
export type Rig2 = Omit<Rig, "update"> & { update: (p: Pose, o?: Rig2Opts) => void };

const NS = "http://www.w3.org/2000/svg";
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const g = (parent: Element, html = "") => {
  const e = document.createElementNS(NS, "g") as SVGGElement;
  if (html) e.innerHTML = html;
  parent.appendChild(e);
  return e;
};
const place = (el: Element, x: number, y: number, rot: number) => el.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`);

/** A slot that swaps its drawing only when the key changes (snaps, no crossfade). */
function slot(parent: Element, draw: (key: string) => string) {
  const el = g(parent);
  let cur = "";
  return {
    el,
    set(key: string) {
      if (key === cur) return;
      cur = key;
      el.innerHTML = draw(key);
    },
  };
}

function inferHands(face: string, flyer: boolean, p: Pose): [string, string] {
  if (face === "strain") return ["pushFlat", "pushFlat"];
  const back = flyer ? "hold" : "relaxed";
  if (face === "pushy") return [back, "point"];
  // an arm raised well forward reads as reaching: open hand
  const front = p.arms[1].sh > 55 ? "grip" : "relaxed";
  return [back, front];
}

export function createRig2(parent: SVGGElement, kind: Kind): Rig2 {
  // both characters share bone frames; each brings its own drawings
  const S = kind === "salesman" ? SALES : CUST;

  const root = g(parent);
  root.setAttribute("class", `rig rig2 rig-${kind}`);
  const body = g(root);

  // a pool of paths a limb redraws every frame (continuous shape, no rigid segments)
  const pool = (parent: Element) => {
    const el = g(parent);
    const paths: SVGPathElement[] = [];
    return {
      el,
      draw(shapes: Shape[]) {
        while (paths.length < shapes.length) paths.push(el.appendChild(document.createElementNS(NS, "path")) as SVGPathElement);
        paths.forEach((p, i) => {
          const sh = shapes[i];
          if (!sh) return p.setAttribute("d", "");
          if (p.getAttribute("fill") !== sh.fill) p.setAttribute("fill", sh.fill);
          p.setAttribute("d", sh.d);
        });
      },
    };
  };
  const arm = () => {
    const a = g(body);
    const limb = pool(a);
    const handG = g(a);
    const handIn = g(handG);
    handIn.setAttribute("transform", `scale(${S.HAND_SCALE})`);
    const hand = slot(handIn, (k) => HANDS[k] ?? HANDS.relaxed);
    const extra = g(handIn); // flyer
    return { limb, handG, hand, extra };
  };
  const leg = () => {
    const l = g(body);
    const limb = pool(l);
    const foot = g(l, S.SHOE);
    return { limb, foot };
  };

  const backArm = arm();
  const backLeg = leg();
  // hips, then the front leg (its rounded top reads as the hip joint), then the shirt over both
  const hips = g(body, S.HIPS);
  const frontLeg = leg();
  const torso = g(body, S.TORSO);
  const tie = g(body, S.TIE);
  const headG = g(body);
  g(headG, S.NECK);
  const headArt = g(headG); // big comic head: drawn at 1x, scaled up about the neck
  headArt.setAttribute("transform", `scale(${S.HEAD_SCALE})`);
  const head = slot(headArt, (k) => S.HEADS[k as View] ?? S.HEADS.profile);
  const face = slot(headArt, (k) => {
    const [name, view, blink] = k.split("|");
    return S.faceArt(name, view as View, blink === "1");
  });
  const frontArm = arm();

  const rig: Rig2 = { root, joints: null, update: () => {}, destroy: () => root.remove() };

  rig.update = (p, o = {}) => {
    const { face: fname = "gentle", facing = 1, blink = false, flyer = false, tieSwing = 0, view = "profile", squash = 0 } = o;
    const j = joints(p);
    rig.joints = j;
    root.setAttribute("transform", facing === 1 ? "" : "scale(-1 1)");
    body.setAttribute(
      "transform",
      squash ? `translate(${f1(j.P[0])} ${f1(j.P[1])}) scale(${(1 + squash * 0.6).toFixed(4)} ${(1 - squash).toFixed(4)}) translate(${f1(-j.P[0])} ${f1(-j.P[1])})` : "",
    );

    const [hb, hf] = o.hands ?? inferHands(fname, flyer, p);
    const drawArm = (A: ReturnType<typeof arm>, i: 0 | 1, handKey: string) => {
      const a = j.arms[i];
      A.limb.draw(armShapes(kind === "salesman" ? "salesman" : "customer", spineOf(a.S, a.E, a.W, 30), facing, 3 + i));
      const R = Math.PI / 180;
      const hx = a.E[0] + Math.sin(a.ang * R) * S.FOREARM_HAND, hy = a.E[1] + Math.cos(a.ang * R) * S.FOREARM_HAND;
      place(A.handG, hx, hy, -a.ang);
      A.hand.set(handKey);
    };
    const drawLeg = (L: ReturnType<typeof leg>, i: 0 | 1) => {
      const l = j.legs[i];
      L.limb.draw(legShapes(kind === "salesman" ? "salesman" : "customer", spineOf(l.hip, l.K, l.A, 30), facing, 7 + i));
      place(L.foot, l.A[0], l.A[1], -l.foot);
    };

    drawArm(backArm, 0, flyer ? "hold" : hb);
    backArm.extra.innerHTML = flyer ? S.FLYER : "";
    drawLeg(backLeg, 0);
    drawLeg(frontLeg, 1);
    place(hips, j.P[0], j.P[1], p.torso * 0.35);
    place(torso, j.P[0], j.P[1], p.torso);
    const R = Math.PI / 180;
    place(tie, j.S[0] + Math.cos(p.torso * R) * 16, j.S[1] + Math.sin(p.torso * R) * 16 + 4, tieSwing);
    place(headG, j.N[0], j.N[1], p.torso * 0.5 + p.head);
    head.set(view);
    face.set(`${fname}|${view}|${blink ? 1 : 0}`);
    drawArm(frontArm, 1, hf);
  };
  return rig;
}
