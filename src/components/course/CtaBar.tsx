"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

/**
 * The one always-there way to book, on every screen size: price, seats and the button.
 * Shows once you are past the opening section, and steps aside whenever a booking button
 * (any [data-cta] block) or the form is already on screen, so two never compete.
 */
export function CtaBar({ price, label, seats }: { price: number; label: string; seats: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cta], #apply"));
    const visible = new Set<Element>();
    const update = () => setShow(window.scrollY > window.innerHeight * 0.8 && visible.size === 0);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    targets.forEach((t) => io.observe(t));
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:bottom-4 md:px-(--gutter)">
      <div
        aria-hidden={!show}
        className={`pointer-events-auto mx-auto border-t border-ink-line bg-ink/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-[transform,opacity] duration-450 ease-primary md:max-w-xl md:rounded-pill md:border md:py-2 md:pr-2 md:pl-6 ${
          show ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <Price amount={price} className="font-display text-[1.375rem] font-semibold" />
            <span className="eyebrow hidden text-mute-dark sm:inline">{seats}</span>
          </div>
          <ButtonLink href="#apply" tabIndex={show ? 0 : -1}>
            {label}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
