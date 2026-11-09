"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

/** One seat: a café chair from the front (slatted back, seat, splayed legs), so it reads as a chair. */
function Seat({ taken }: { taken: boolean }) {
  const line = taken ? "stroke-ink-line" : "stroke-signal";
  return (
    <svg viewBox="0 0 24 30" className="h-full w-auto" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 15V4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V15" className={line} strokeWidth={2} />
      <path d="M10 3v12M14 3v12" className={line} strokeWidth={1.4} />
      <rect x="3" y="14.2" width="18" height="3.6" rx="1.5" className={taken ? "fill-ink-line" : "fill-signal"} />
      <path d="M5.6 18.2 4.6 28M18.4 18.2l1 9.8M7.5 23h9" className={line} strokeWidth={2} />
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
