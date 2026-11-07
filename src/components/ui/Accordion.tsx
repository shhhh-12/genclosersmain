"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { Plus } from "./Icons";
import { ease, dur } from "@/lib/motion";

/** One expandable row. Button + region, keyboard and screen reader friendly. */
export function AccordionItem({
  head,
  children,
  tone = "light",
  defaultOpen = false,
}: {
  head: ReactNode;
  children: ReactNode;
  tone?: "light" | "dark";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const id = useId();
  const line = tone === "light" ? "border-paper-line" : "border-ink-line";
  return (
    <div className={`border-b ${line}`}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-start justify-between gap-6 py-6 text-left"
        >
          <span className="flex-1">{head}</span>
          <span
            className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border transition-[transform,background-color,border-color,color] duration-450 ease-primary ${
              open ? "rotate-45 border-signal bg-signal text-signal-ink" : `${line} group-hover:border-current`
            }`}
          >
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: dur.base, ease: ease.primary }}
            className="overflow-hidden"
          >
            <div className="pb-7">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
