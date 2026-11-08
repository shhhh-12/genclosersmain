import type { Ref, ReactNode, CSSProperties } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { WHEEL } from "@/lib/wheel";
import { WordSketch } from "./WordSketch";

/**
 * Markup for the flat spoke wheel (see lib/wheel.ts). Pure layout; intro, hero and journey animate it.
 * Each word is one line of text whose left edge sits on the anchor; it rotates around a pivot
 * WHEEL.radiusEm to its left, on the same horizontal line. The GenClosers mark sits in the
 * arrow slot (class wheel-arrow) and never rotates.
 */
export function WheelScene({
  words,
  sceneRef,
  arrowRef,
  className = "",
  anchorClassName = "left-[calc(var(--gutter)+1.1em)] sm:left-[27.9vw]",
  highlight = "Sales",
  fade = false,
  sketches = false,
  children,
}: {
  words: readonly string[];
  sceneRef?: Ref<HTMLDivElement>;
  arrowRef?: Ref<HTMLSpanElement>;
  className?: string;
  /** Where the active word's left edge sits (27.9vw = x 536 on the 1920 reference). */
  anchorClassName?: string;
  /** Word drawn in red (#ff0000). */
  highlight?: string;
  /** Fade the top and bottom edges into the background. */
  fade?: boolean;
  /** Small line drawings after each word, shown while the word is lined up (intro only). */
  sketches?: boolean;
  /** Extra layers placed at the anchor (e.g. the hero brand). */
  children?: ReactNode;
}) {
  const wordStyle: CSSProperties = {
    top: "-0.5em",
    height: "1em",
    transformOrigin: `${-WHEEL.radiusEm}em 0.5em`,
  };
  return (
    <div ref={sceneRef} className={`wheel-scene absolute inset-0 overflow-hidden ${className}`}>
      <div className={`wheel-anchor absolute top-1/2 font-display leading-none font-bold tracking-[-0.02em] ${anchorClassName}`}>
        <span
          ref={arrowRef}
          className="wheel-arrow absolute z-10 block"
          style={{ left: `${WHEEL.arrowLeftEm}em`, width: `${WHEEL.arrowWidthEm}em`, top: "var(--cap-off, 0px)", transform: "translateY(-50%)", color: WHEEL.redHex }}
        >
          <span className="block">
            {/* GenClosers mark in the arrow slot (same size as the lockup mark) */}
            <LogoMark className="block h-[0.72em] w-auto" title="" />
          </span>
        </span>
        <div className="wheel-words">
          {words.map((w, i) => (
            <span
              key={w}
              data-i={i}
              className={`wheel-word absolute left-0 block whitespace-nowrap will-change-transform ${w === highlight ? "is-solo" : ""}`}
              style={{ ...wordStyle, color: w === highlight ? WHEEL.redHex : "#fff" }}
            >
              {w}
              {sketches && <WordSketch word={w} />}
            </span>
          ))}
        </div>
        {children}
      </div>
      {fade && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,transparent_22%,transparent_78%,#000_100%)]" />
      )}
    </div>
  );
}
