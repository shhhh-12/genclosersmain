"use client";

/**
 * "In the room." (About page, owner 2026-11-19): the workshop photos and a few of the messages people
 * sent, as taped polaroids in a loose row. Desktop: drag them around (lib/usePolaroidDrag.ts).
 * Phones: a swipe row. Same cards as the home proof wall, without its close view.
 */

import { useRef } from "react";
import { usePolaroidDrag } from "@/lib/usePolaroidDrag";

type Item = { kind: string; src: string; width: number; height: number; alt: string };

const TILT = [-4, 3, -2, 4, -3];
const DROP = [0, 40, 8, 56, 16]; // px down on desktop, so the row looks laid by hand

export function AboutRoom({ items, workshop, dragHint }: { items: Item[]; workshop: string; dragHint: string }) {
  const table = useRef<HTMLUListElement>(null);
  usePolaroidDrag(table);
  return (
    <div>
      <ul ref={table} className="pol-table -mx-(--gutter) flex snap-x items-start gap-5 overflow-x-auto px-(--gutter) pt-5 pb-10 lg:mx-0 lg:justify-between lg:gap-4 lg:overflow-visible lg:px-0">
        {items.map((it, i) => {
          const photo = it.kind === "photo";
          return (
            <li
              key={it.src}
              data-pol
              className={`pol shrink-0 snap-center select-none lg:mt-(--drop) ${photo ? "w-[270px] lg:w-[22%]" : "w-[220px] lg:w-[17%]"}`}
              style={{ ["--r" as string]: `${TILT[i % TILT.length]}deg`, ["--drop" as string]: `${DROP[i % DROP.length]}px` }}
            >
              <figure className="relative rounded-[6px] border-[2.5px] border-ink bg-white p-3 pb-3.5 text-ink shadow-[7px_8px_0_0_rgba(0,0,0,0.55)]">
                {!photo && <span aria-hidden className="proof-tape absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-4deg] rounded-[3px]" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt={it.alt} width={it.width} height={it.height} loading="lazy" draggable={false} className="block h-auto w-full rounded-[3px] border border-ink/15" />
                {photo && <figcaption className="mt-3 font-display text-[length:max(0.875rem,calc(1.05rem*var(--type-scale)))] font-semibold tracking-[-0.01em]">{workshop}</figcaption>}
              </figure>
            </li>
          );
        })}
      </ul>
      <p className="eyebrow mt-2 hidden text-mute-light lg:block">{dragHint}</p>
    </div>
  );
}
