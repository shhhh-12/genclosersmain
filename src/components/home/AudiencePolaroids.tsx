"use client";

/**
 * "Who it's for" as polaroids: five ink illustrations, scattered and tilted, that you can drag
 * around the table (desktop, fine pointer). Hover one and a red "That's me" sticker slaps on.
 * Phones: a swipeable row, no dragging. Same comic-ink look as the home story.
 */

import { useEffect, useRef, type ReactNode } from "react";
import type { Card } from "@/content/types";

const INK = "#151313";
const RED = "#e3101b";
const s = { stroke: INK, strokeWidth: 3.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// Simple ink drawings (viewBox 0 0 120 100), one per audience, in the order of content/home.ts
const ART: ReactNode[] = [
  // students: a cap on a stack of books
  <g key="s" {...s}>
    <rect x="28" y="66" width="64" height="12" rx="2" fill="#fff" />
    <rect x="34" y="54" width="54" height="12" rx="2" fill="#d9d6d0" />
    <path d="M60 18L98 32L60 46L22 32Z" fill={INK} />
    <path d="M40 39v10q20 10 40 0V39" fill="#fff" />
    <path d="M96 33v18" />
    <circle cx="96" cy="54" r="3.5" fill={RED} />
  </g>,
  // aspiring entrepreneurs: a light bulb with rays
  <g key="e" {...s}>
    <path d="M60 18a22 22 0 0 0-13 40c3 2 4 6 4 9h18c0-3 1-7 4-9a22 22 0 0 0-13-40z" fill="#fff" />
    <path d="M52 74h16M54 81h12" />
    <path d="M54 52l6-10 6 10" stroke={RED} />
    <path d="M60 6v-2M92 26l4-3M28 26l-4-3M98 50h4M18 50h4" />
  </g>,
  // business owners: a shop with a striped awning
  <g key="b" {...s}>
    <rect x="26" y="40" width="68" height="42" fill="#fff" />
    <path d="M22 26h76l4 14H18z" fill="#fff" />
    <path d="M37 26l-3 14M53 26l-1 14M67 26l1 14M83 26l3 14" />
    <path d="M22 26h15l-3 14H18zM53 26h14l1 14H52zM83 26h15l4 14H86z" fill={RED} />
    <rect x="34" y="52" width="20" height="30" fill="#d9d6d0" />
    <rect x="62" y="52" width="22" height="16" fill="#fff" />
  </g>,
  // freelancers: a laptop and a coffee
  <g key="f" {...s}>
    <path d="M30 26h50v34H30z" fill="#fff" />
    <path d="M38 36h22M38 44h30M38 52h16" />
    <path d="M22 60h66l-6 10H28z" fill="#d9d6d0" />
    <path d="M90 54l-3 22h18l-3-22z" fill="#fff" />
    <path d="M104 60h4a5 5 0 0 1 0 10h-4" />
    <path d="M94 46c-3-4 3-6 0-10M100 46c-3-4 3-6 0-10" />
  </g>,
  // salespeople: a phone and a speech balloon
  <g key="p" {...s}>
    <path d="M30 30c-6 6-2 24 14 40s34 20 40 14l-10-12-10 4c-6-2-14-10-16-16l4-10z" fill="#fff" />
    <path d="M66 14h38a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H84l-10 8 2-8h-10a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z" fill={RED} />
    <path d="M74 27h22M74 33h14" stroke="#fff" />
  </g>,
];

// Scatter on the table (desktop): left %, top px, rotation
const SPOTS = [
  { l: 2, t: 10, r: -6 },
  { l: 36, t: 0, r: 4 },
  { l: 68, t: 34, r: -3 },
  { l: 12, t: 372, r: 5 },
  { l: 50, t: 360, r: -5 },
];

export function AudiencePolaroids({ items, sticker, dragHint }: { items: readonly Card[]; sticker: string; dragHint: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const table = ref.current;
    if (!table || !window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) return;
    const cards = Array.from(table.querySelectorAll<HTMLElement>("[data-pol]"));
    let z = 10;
    const offs = cards.map(() => ({ x: 0, y: 0 }));
    const cleanups = cards.map((card, i) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
      const down = (e: PointerEvent) => {
        drag = true;
        card.setPointerCapture(e.pointerId);
        sx = e.clientX;
        sy = e.clientY;
        ox = offs[i].x;
        oy = offs[i].y;
        card.style.zIndex = String(++z);
        card.classList.add("is-grabbed");
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        const tr = table.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        // keep the card on the table
        const nx = ox + e.clientX - sx;
        const ny = oy + e.clientY - sy;
        const dx = nx - offs[i].x;
        const dy = ny - offs[i].y;
        const cx = Math.min(Math.max(dx, tr.left - cr.left - 20), tr.right - cr.right + 20);
        const cy = Math.min(Math.max(dy, tr.top - cr.top - 20), tr.bottom - cr.bottom + 20);
        offs[i].x += cx;
        offs[i].y += cy;
        card.style.setProperty("--dx", `${offs[i].x}px`);
        card.style.setProperty("--dy", `${offs[i].y}px`);
      };
      const up = () => {
        drag = false;
        card.classList.remove("is-grabbed");
      };
      card.addEventListener("pointerdown", down);
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerup", up);
      card.addEventListener("pointercancel", up);
      return () => {
        card.removeEventListener("pointerdown", down);
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerup", up);
        card.removeEventListener("pointercancel", up);
      };
    });
    table.classList.add("is-live");
    return () => {
      cleanups.forEach((c) => c());
      table.classList.remove("is-live");
    };
  }, []);

  return (
    <div>
      <ul ref={ref} className="pol-table -mx-(--gutter) flex snap-x gap-5 overflow-x-auto px-(--gutter) pb-6 lg:relative lg:mx-0 lg:block lg:h-[740px] lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item, i) => {
          const sp = SPOTS[i % SPOTS.length];
          return (
            <li
              key={item.title}
              data-pol
              className="pol group w-[250px] shrink-0 snap-center select-none lg:absolute"
              style={{ left: `${sp.l}%`, top: sp.t, ["--r" as string]: `${sp.r}deg` }}
            >
              <div className="pol-card relative rounded-[6px] border-[2.5px] border-ink bg-white p-3 pb-4 text-ink shadow-[7px_8px_0_0_rgba(0,0,0,0.55)]">
                <div className="pol-photo relative overflow-hidden rounded-[3px] border-2 border-ink">
                  <svg viewBox="0 0 120 100" className="block h-auto w-full" aria-hidden>
                    {ART[i % ART.length]}
                  </svg>
                </div>
                <h3 className="mt-3 font-display text-[1.35rem] leading-tight font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-1.5 text-small leading-snug text-mute-light">{item.body}</p>
                <span aria-hidden className="pol-sticker absolute -top-4 -right-4 grid h-[74px] w-[74px] place-items-center rounded-full border-[2.5px] border-ink bg-signal text-center font-display text-[0.95rem] leading-[1.05] font-bold text-signal-ink">
                  {sticker}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="eyebrow mt-4 hidden text-mute-dark lg:block">{dragHint}</p>
    </div>
  );
}
