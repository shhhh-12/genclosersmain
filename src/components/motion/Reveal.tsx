"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { ease, dur, stagger } from "@/lib/motion";

const viewport = { once: true, margin: "0px 0px -10% 0px" } as const;

/** Fade and lift content in once when it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: dur.slow, ease: ease.primary, delay }}
    >
      {children}
    </Tag>
  );
}

const wordVariants: Variants = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: dur.reveal, ease: ease.primary } },
};

/**
 * Headline that reveals word by word, each word sliding up from a mask.
 * The whole line is the in-view trigger (masked words can't be observed on their own).
 */
export function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      aria-label={text}
      role="text"
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={viewport}
      transition={{ staggerChildren: stagger * 0.6, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span className="inline-block" variants={wordVariants}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
