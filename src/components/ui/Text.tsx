import { Fragment } from "react";
import { Rupee } from "./Icons";

/**
 * Renders content strings safely:
 * - [[TODO: ...]] markers become a visible highlighted tag (missing info, never hidden)
 * - "₹" is swapped for the drawn rupee sign, since Chillax has no ₹ glyph
 */
export function Txt({ children }: { children: string }) {
  const parts = children.split(/(\[\[TODO:[^\]]*\]\]|₹)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "₹") return <Rupee key={i} />;
        if (part.startsWith("[[TODO:")) {
          return (
            <mark
              key={i}
              className="rounded-sharp bg-[#ffe14d] px-1.5 py-0.5 font-mono text-[0.8em] text-ink not-italic"
            >
              {part}
            </mark>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

export function hasTodo(s: string) {
  return s.includes("[[TODO:");
}
