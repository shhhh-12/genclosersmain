"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

/** Sticky bottom bar on phones: price + CTA. Hides at the top of the page and once the form is on screen. */
export function MobileCtaBar({ price, label }: { price: number; label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const form = document.getElementById("apply");
    let formVisible = false;
    const io = new IntersectionObserver(([e]) => {
      formVisible = e.isIntersecting;
      update();
    });
    if (form) io.observe(form);
    const update = () => setShow(window.scrollY > window.innerHeight * 0.8 && !formVisible);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-ink/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-450 ease-primary md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div className="flex items-center justify-between gap-4">
        <Price amount={price} className="font-display text-[1.375rem] font-semibold" />
        <ButtonLink href="#apply" tabIndex={show ? 0 : -1}>
          {label}
        </ButtonLink>
      </div>
    </div>
  );
}
