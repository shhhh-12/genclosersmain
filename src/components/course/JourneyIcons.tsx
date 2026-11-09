/**
 * Minimal line illustrations for the 7 journey steps (48x48, 2px round stroke), drawn for GenClosers.
 * Each path has pathLength=1 so it can draw itself (stroke-dashoffset 1 → 0) when its step is reached.
 */

export const JOURNEY_ICONS: readonly (readonly string[])[] = [
  // 01 Grab one of 10 seats: a chair
  ["M14 23V8h20v15", "M10 23h28v8H10z", "M13 31v11", "M35 31v11"],
  // 02 Learn in order: numbered lessons
  ["M8 11h5", "M18 11h22", "M8 24h5", "M18 24h22", "M8 37h5", "M18 37h14"],
  // 03 Practise every key skill: a microphone
  ["M24 6a6 6 0 0 1 6 6v12a6 6 0 0 1-12 0V12a6 6 0 0 1 6-6z", "M12 22a12 12 0 0 0 24 0", "M24 34v8", "M17 42h14"],
  // 04 Get unstuck fast: a chat bubble with a question
  ["M8 9h32a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H22l-9 7v-7H8a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z", "M20 17a4 4 0 1 1 6 3.5c-1.5 1-2 1.8-2 3.5", "M24 28h.01"],
  // 05 Record your final mock: a video camera
  ["M6 14h26v20H6z", "M32 21l10-6v18l-10-6", "M11 19h.01"],
  // 06 Live 1:1 with Mak: two people on a call
  ["M5 8h38v28H5z", "M17 21a4 4 0 1 0 0-8a4 4 0 0 0 0 8z", "M10 32c1-5 4-7 7-7s6 2 7 7", "M31 21a4 4 0 1 0 0-8a4 4 0 0 0 0 8z", "M24 32c1-5 4-7 7-7s6 2 7 7", "M18 42h12"],
  // 07 Get certified: a medal
  ["M24 5a11 11 0 1 1 0 22a11 11 0 1 1 0-22z", "M24 11l2 4 4.5.6-3.3 3.1.8 4.4L24 21l-4 2.1.8-4.4-3.3-3.1L22 15z", "M17 25l-4 17 7-3 4 5", "M31 25l4 17-7-3-4 5"],
];

export function JourneyIcon({ index, className, draw }: { index: number; className?: string; draw?: boolean }) {
  const paths = JOURNEY_ICONS[index] ?? [];
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths.map((d) => (
        <path key={d} d={d} pathLength={1} {...(draw ? { strokeDasharray: 1, strokeDashoffset: 0, "data-draw": "" } : {})} />
      ))}
    </svg>
  );
}
