"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

/** One seat, drawn as a simple chair from the front. */
function Seat({ taken }: { taken: boolean }) {
  return (
    <svg viewBox="0 0 24 26" className="h-full w-auto" aria-hidden>
      <path
        d="M6 3.5h12a2 2 0 0 1 2 2V13H4V5.5a2 2 0 0 1 2-2Z"
        className={taken ? "fill-ink-line stroke-ink-line" : "fill-signal/15 stroke-signal"}
        strokeWidth={1.6}
      />
      <path d="M2.5 13.5h19a1 1 0 0 1 1 1V17a1 1 0 0 1-1 1h-19a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 1-1Z" className={taken ? "fill-ink-line" : "fill-signal"} />
      <path d="M5 18v5M19 18v5" className={taken ? "stroke-ink-line" : "stroke-signal"} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

/**
 * The batch as 10 seats. Without a live counter every seat shows as open,
 * so nothing implies seats are taken when nobody has updated it.
 */
export function SeatRow({
  total = 10,
  left,
  label,
  className = "",
}: {
  total?: number;
  /** Only pass this if someone keeps it updated (see courses.ts seatCounter). */
  left?: number;
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const open = left ?? total;
  return (
    <div className={className}>
      <div className="flex gap-1.5" role="img" aria-label={label ?? `${total} seats per batch`}>
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            className="group/seat block h-7 transition-transform duration-200 ease-primary hover:-translate-y-1 sm:h-8"
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: ease.primary, delay: i * 0.05 }}
          >
            <Seat taken={i >= open} />
          </motion.span>
        ))}
      </div>
      {label && <p className="eyebrow mt-3 text-mute-dark">{label}</p>}
    </div>
  );
}
