import type { ReactNode } from "react";

/**
 * Tiny red line drawings for the home intro + hero wheels. One per word (not "Sales": the mark is its sketch).
 * They sit after the word and only show while that word is lined up with the mark
 * (IntroTear toggles .is-on). Drawn with stroke-dashoffset + one small transform, CSS only.
 * Styles: .wheel-sketch in globals.css.
 */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 2.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const sketches: Record<string, ReactNode> = {
  // a pin drops in: a new lead lands
  lead: (
    <>
      <path className="d" d="M14 2V13" pathLength={1} {...S} />
      <circle className="pop" cx="14" cy="18" r="3" fill="currentColor" />
    </>
  ),
  // a small lens: looking for the real need
  Discover: (
    <>
      <circle className="d" cx="13" cy="10" r="7" pathLength={1} {...S} />
      <path className="d" d="M18.5 15.5L25 22" pathLength={1} {...S} />
    </>
  ),
  // a cup catches a falling dot: an objection, caught calmly
  Handle: (
    <>
      <path className="d" d="M4 9C4 17 8 21 16 21C24 21 28 17 28 9" pathLength={1} {...S} />
      <circle className="drop" cx="16" cy="14" r="2.8" fill="currentColor" />
    </>
  ),
  // a tick: yes
  Convert: <path className="d" d="M4 13L11 20L26 4" pathLength={1} {...S} />,
  // a loop that comes back round
  Retain: (
    <>
      <path className="d" d="M24 7A9 9 0 1 0 25 16" pathLength={1} {...S} />
      <path className="pop" d="M19 6.5L24.5 7L25 1.5" {...S} />
    </>
  ),
  // three steps up
  "Up-Selling": <path className="d" d="M4 21V16M14 21V10M24 21V4" pathLength={1} {...S} />,

  // a ring that tightens onto a dot: finding the right person
  Prospect: (
    <>
      <circle className="d ring" cx="14" cy="12" r="9" pathLength={1} {...S} />
      <circle className="pop" cx="14" cy="12" r="2.6" fill="currentColor" />
    </>
  ),
  // two dots, a line draws between them
  Connect: (
    <>
      <circle cx="5" cy="12" r="2.6" fill="currentColor" />
      <path className="d" d="M9 12H39" pathLength={1} {...S} />
      <circle className="pop" cx="43" cy="12" r="2.6" fill="currentColor" />
    </>
  ),
  // a voice line that rises once
  Pitch: <path className="d" d="M2 17H13L18 17C21 17 22 5 26 5C30 5 31 17 34 17H46" pathLength={1} {...S} />,
  // two arrows meet and settle level
  Negotiate: (
    <>
      <g className="tilt-l">
        <path className="d" d="M3 12H20M15 7l5 5-5 5" pathLength={1} {...S} />
      </g>
      <g className="tilt-r">
        <path className="d" d="M45 12H28M33 7l-5 5 5 5" pathLength={1} {...S} />
      </g>
    </>
  ),
  // an open bracket snaps shut
  Close: (
    <>
      <path className="d shut-l" d="M14 4H8V20H14" pathLength={1} {...S} />
      <path className="d shut-r" d="M34 4H40V20H34" pathLength={1} {...S} />
    </>
  ),
};

export function WordSketch({ word }: { word: string }) {
  const s = sketches[word];
  if (!s) return null;
  return (
    <svg viewBox="0 0 48 24" className="wheel-sketch" aria-hidden>
      {s}
    </svg>
  );
}
