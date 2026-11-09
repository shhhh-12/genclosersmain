"use client";

/** Dev-only sheet for the v2 salesman: poses (old vs new), hands, faces x head views, a live walk. */
import { useEffect, useRef } from "react";
import { walk, reach, joints, feetDrop, SEATED, STAND, STAND_H, type Pose } from "@/lib/inkRig";
import { createRig2, RIG2_DEFS, type View } from "@/lib/inkRig2";
import { HANDS } from "@/lib/inkArt/hands";
import { FACE_DEFS } from "@/lib/inkArt/salesman";

const FLOOR = 0;
const walkAt = (x: number, o?: Parameters<typeof walk>[1], phase = 0.6): Pose => {
  const p = walk(phase, o);
  p.y = FLOOR - feetDrop(p);
  p.x = x;
  return p;
};
const armsTo = (p: Pose, back: [number, number] | null, front: [number, number] | null): Pose => {
  const j = joints(p);
  const arms = [...p.arms] as Pose["arms"];
  if (back) arms[0] = reach(j.arms[0].S[0], j.arms[0].S[1], back[0], back[1]);
  if (front) arms[1] = reach(j.arms[1].S[0], j.arms[1].S[1], front[0], front[1]);
  return { ...p, arms };
};
const push = (x: number): Pose => {
  const o = { lean: 40, base: -24, amp: 20, arms: 0, knee: 46, crouch: 26 };
  const p = walkAt(x, o, 0.9);
  p.head = -30;
  const j = joints(p);
  const E = j.S[0] + 58;
  return armsTo(p, [E - 4, j.S[1] - 10], [E - 2, j.S[1] + 18]);
};

type Shot = { label: string; pose: Pose; face: string; view?: View; flyer?: boolean };
const SHOTS: Shot[] = [
  { label: "stand · gentle", pose: { ...STAND, y: FLOOR - STAND_H }, face: "gentle" },
  { label: "push · strain", pose: push(0), face: "strain" },
  { label: "barge in · pushy", pose: armsTo(walkAt(0, { lean: 8, amp: 28, arms: 26 }), null, [150, -230]), face: "pushy", flyer: true },
  { label: "seated · listen", pose: { ...SEATED, y: FLOOR - 100 }, face: "listen" },
  { label: "walk · happy", pose: walkAt(0, undefined, 2.2), face: "happy" },
  { label: "freeze · guilty (front)", pose: { ...STAND, y: FLOOR - STAND_H }, face: "guilty", view: "front" },
];

export function RigPreview() {
  const poses = useRef<SVGSVGElement>(null);
  const live = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = poses.current!;
    const made: { destroy: () => void }[] = [];
    SHOTS.forEach((s, i) => {
      for (const v of [1, 2] as const) {
        const slotEl = svg.querySelector<SVGGElement>(`.s${i}-${v}`)!;
        const r = createRig2(slotEl, v === 1 ? "salesman" : "customer");
        const cf: Record<string, string> = { gentle: "neutral", strain: "angry", pushy: "startle", listen: "talk", happy: "happy", guilty: "shy" };
        r.update(s.pose, { face: v === 1 ? s.face : cf[s.face] ?? s.face, flyer: v === 1 && s.flyer, view: s.view });
        made.push(r);
      }
    });
    // live walk cycle (new rig) to check joints while moving
    const lr = createRig2(live.current!, "salesman");
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const s = (t - t0) / 1000;
      const ph = s * 5;
      const plant = Math.max(0, Math.cos(ph * 2)) ** 6;
      lr.update(walkAt(0, undefined, ph), { face: (s % 3.7) < 0.12 ? "gentle" : "gentle", blink: (s % 3.7) < 0.12, squash: 0.03 * plant });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      made.forEach((m) => m.destroy());
      lr.destroy();
    };
  }, []);

  const hands = Object.keys(HANDS);
  const faces = Object.keys(FACE_DEFS);
  const views: View[] = ["profile", "threeQuarter", "front"];

  return (
    <div style={{ background: "#f3f1ec", color: "#151313", minHeight: "100vh", padding: 24, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
      <h1 style={{ fontSize: 16, marginBottom: 12 }}>v2: salesman (top) and customer (bottom)</h1>
      <svg ref={poses} viewBox={`-150 -560 ${SHOTS.length * 300} 600`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs dangerouslySetInnerHTML={{ __html: RIG2_DEFS }} />
        {SHOTS.map((s, i) => (
          <g key={i} transform={`translate(${i * 300} 0)`}>
            <text x={-120} y={-520} fontSize={18}>{s.label}</text>
            <g transform="translate(0 -290) scale(0.55)"><g className={`s${i}-1`} /></g>
            <line x1={-130} x2={130} y1={-290} y2={-290} stroke="#ccc" />
            <g transform="scale(0.55)"><g className={`s${i}-2`} /></g>
          </g>
        ))}
      </svg>

      <h2 style={{ fontSize: 14, margin: "24px 0 8px" }}>Hands</h2>
      <svg viewBox={`0 0 ${hands.length * 90} 110`} style={{ width: "100%", maxWidth: 900 }}>
        <defs dangerouslySetInnerHTML={{ __html: RIG2_DEFS }} />
        {hands.map((h, i) => (
          <g key={h} transform={`translate(${i * 90 + 45} 10)`}>
            <g transform="scale(1.6)" dangerouslySetInnerHTML={{ __html: HANDS[h] }} />
            <text x={0} y={100} fontSize={11} textAnchor="middle">{h}</text>
          </g>
        ))}
      </svg>

      <h2 style={{ fontSize: 14, margin: "24px 0 8px" }}>Faces × head views</h2>
      <FaceGrid faces={faces} views={views} kind="salesman" />
      <FaceGrid faces={faces} views={views} kind="customer" />

      <h2 style={{ fontSize: 14, margin: "24px 0 8px" }}>Live walk (new rig, squash on foot plant, blink)</h2>
      <svg viewBox="-200 -480 400 500" style={{ width: 320 }}>
        <defs dangerouslySetInnerHTML={{ __html: RIG2_DEFS }} />
        <line x1={-200} x2={200} y1={0} y2={0} stroke="#151313" strokeWidth={3} />
        <g ref={live} />
      </svg>
    </div>
  );
}

function FaceGrid({ faces, views, kind }: { faces: string[]; views: View[]; kind: "salesman" | "customer" }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current!;
    const rigs: { destroy: () => void }[] = [];
    views.forEach((v, r) =>
      faces.forEach((f, c) => {
        const el = svg.querySelector<SVGGElement>(`.f${r}-${c}`)!;
        const rig = createRig2(el, kind);
        const pose: Pose = { ...STAND, y: 0, x: 0, torso: 0, head: 0 };
        rig.update(pose, { face: f, view: v });
        // show the head only: move the neck point to the cell centre
        const j = rig.joints!;
        el.setAttribute("transform", `translate(${-j.N[0]} ${-j.N[1] + 8})`);
        rigs.push(rig);
      }),
    );
    return () => rigs.forEach((r) => r.destroy());
  }, [faces, views, kind]);
  return (
    <svg ref={ref} viewBox={`0 0 ${faces.length * 150} ${views.length * 170 + 20}`} style={{ width: "100%" }}>
      <defs dangerouslySetInnerHTML={{ __html: RIG2_DEFS }} />
      {views.map((v, r) =>
        faces.map((f, c) => (
          <g key={`${r}-${c}`} transform={`translate(${c * 150 + 70} ${r * 170 + 40})`}>
            <svg x={-75} y={-40} width={150} height={150} viewBox="-75 -130 150 150" overflow="hidden">
              <g className={`f${r}-${c}`} />
            </svg>
            {r === 0 && <text x={0} y={-26} fontSize={13} textAnchor="middle">{f}</text>}
            {c === 0 && <text x={-66} y={-26} fontSize={11}>{v}</text>}
          </g>
        )),
      )}
    </svg>
  );
}
