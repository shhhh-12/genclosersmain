"use client";

/**
 * Page change from the header nav (owner 2026-11-10): two black shutters close, the page's name
 * appears, the red GenClosers mark slices across the middle (the intro's cut), and the shutters part
 * along that cut onto the new page. Mounted once in the root layout so it survives the route change.
 * Only header links start it (NavLink). Reduced motion: plain navigation.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { LogoMark } from "@/components/brand/LogoMark";
import { getLenis, lockScroll } from "@/lib/scroll";

export const TITLE_EVENT = "gc:title-card";
type Detail = { href: string; label: string };

export function TitleCard() {
  const router = useRouter();
  const pathname = usePathname();
  const [card, setCard] = useState<Detail | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const blade = useRef<HTMLDivElement>(null);
  const slit = useRef<HTMLDivElement>(null);
  const state = useRef({ sliced: false, arrived: false, open: false, href: "" });
  const reveal = useRef<() => void>(() => {});

  // header links ask for the card
  useEffect(() => {
    document.documentElement.dataset.titleCard = "1";
    const onAsk = (e: Event) => {
      const d = (e as CustomEvent<Detail>).detail;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(d.href);
        return;
      }
      state.current = { sliced: false, arrived: false, open: false, href: d.href };
      setCard(d);
    };
    window.addEventListener(TITLE_EVENT, onAsk);
    return () => {
      delete document.documentElement.dataset.titleCard;
      window.removeEventListener(TITLE_EVENT, onAsk);
    };
  }, [router]);

  // close, name, slice; open once the new page is there (and the slice has finished)
  useEffect(() => {
    if (!card) return;
    const st = state.current;
    lockScroll(true);
    const W = window.innerWidth;
    const tl = gsap.timeline();
    gsap.set(top.current, { yPercent: -100 });
    gsap.set(bottom.current, { yPercent: 100 });
    gsap.set(slit.current, { scaleX: 0, opacity: 1 });
    gsap.set(blade.current, { x: -0.12 * W, opacity: 1 });
    tl.to([top.current, bottom.current], { yPercent: 0, duration: 0.5, ease: "power3.inOut" });
    tl.call(() => router.push(st.href));
    tl.fromTo(".tc-word", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, "-=0.08");
    tl.addLabel("cut", "+=0.2");
    // one position drives both: the slit always ends at the mark's tail, so the mark leads the line
    const mw = blade.current!.offsetWidth;
    const cut = { x: -0.12 * W };
    tl.to(cut, {
      x: W + mw * 1.2,
      duration: 1.05, // slow enough to see the mark doing the cutting (owner 2026-11-10)
      ease: "power2.inOut",
      onUpdate: () => {
        gsap.set(blade.current, { x: cut.x });
        gsap.set(slit.current, { scaleX: Math.max(0, Math.min(1, (cut.x + mw * 0.35) / W)) });
      },
    }, "cut");
    tl.call(() => {
      st.sliced = true;
      reveal.current();
    });

    let opened: gsap.core.Timeline | null = null;
    reveal.current = () => {
      if (st.open || !st.sliced || !st.arrived) return;
      st.open = true;
      window.scrollTo(0, 0);
      getLenis()?.scrollTo(0, { immediate: true, force: true });
      opened = gsap.timeline({
        onComplete: () => {
          lockScroll(false);
          setCard(null);
        },
      });
      opened.to(slit.current, { opacity: 0, duration: 0.3 });
      opened.to(top.current, { yPercent: -100, duration: 0.9, ease: "power3.inOut" }, 0.05);
      opened.to(bottom.current, { yPercent: 100, duration: 0.9, ease: "power3.inOut" }, 0.05);
    };
    // never get stuck on the card
    const failsafe = window.setTimeout(() => {
      st.sliced = st.arrived = true;
      reveal.current();
    }, 5000);
    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
      opened?.kill();
      lockScroll(false);
    };
  }, [card, router]);

  // the new route has rendered
  useEffect(() => {
    const st = state.current;
    if (card && pathname === st.href) {
      st.arrived = true;
      reveal.current();
    }
  }, [pathname, card]);

  if (!card) return null;
  const word = (
    <span className="tc-word block font-display text-mega leading-none font-semibold tracking-[-0.045em] whitespace-nowrap text-signal uppercase">{card.label}</span>
  );
  return (
    <div aria-hidden className="fixed inset-0 z-[80] overflow-hidden">
      {/* each shutter carries the same word, so the cut splits it in two when they part */}
      <div ref={top} className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-ink">
        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">{word}</div>
      </div>
      <div ref={bottom} className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-ink">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">{word}</div>
      </div>
      {/* the slit the mark leaves behind, and the flying mark */}
      <div ref={slit} className="absolute top-1/2 left-0 h-[2px] w-full origin-left -translate-y-1/2 scale-x-0 bg-white shadow-[0_0_22px_3px_#ff0000,0_0_3px_1px_#fff]" />
      <div ref={blade} className="absolute top-1/2 left-0 -translate-y-1/2">
        <span className="block text-signal drop-shadow-[0_0_14px_#ff0000]">
          <LogoMark className="block h-12 w-auto sm:h-16" title="" />
        </span>
      </div>
    </div>
  );
}

/** Ask for the title card (used by NavLink). Returns false when it is not available. */
export function playTitleCard(href: string, label: string) {
  if (document.documentElement.dataset.titleCard !== "1") return false;
  window.dispatchEvent(new CustomEvent<Detail>(TITLE_EVENT, { detail: { href, label } }));
  return true;
}
