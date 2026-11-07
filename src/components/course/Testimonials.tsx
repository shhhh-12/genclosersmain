"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "@/components/ui/Icons";
import { Txt } from "@/components/ui/Text";
import type { Testimonial } from "@/content/types";

/** Vertical video testimonials. Tap to play with sound; only one plays at a time. */
export function TestimonialRow({ items }: { items: Testimonial[] }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);

  const toggle = (i: number) => {
    const v = refs.current[i];
    if (!v) return;
    if (!v.paused) {
      v.pause();
      return;
    }
    refs.current.forEach((o, j) => j !== i && o && !o.paused && o.pause());
    v.play().catch(() => {});
  };

  return (
    <ul className="-mx-(--gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--gutter) pb-4 [scrollbar-width:thin] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {items.map((t, i) => (
        <li key={t.id} className="w-[68vw] max-w-[20rem] shrink-0 snap-start md:w-auto md:max-w-none">
          <div className="relative overflow-hidden rounded-soft bg-ink-2" style={{ aspectRatio: `${t.video.width} / ${t.video.height}` }}>
            <video
              ref={(el) => void (refs.current[i] = el)}
              className="absolute inset-0 h-full w-full object-cover"
              poster={`${t.video.base}-poster.jpg`}
              preload="none"
              playsInline
              onPlay={() => setPlaying(i)}
              onPause={() => setPlaying((p) => (p === i ? null : p))}
              onEnded={() => setPlaying((p) => (p === i ? null : p))}
              aria-label={t.video.label}
            >
              <source src={`${t.video.base}.webm`} type="video/webm" />
              <source src={`${t.video.base}.mp4`} type="video/mp4" />
            </video>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-label={playing === i ? `Pause ${t.video.label}` : `Play ${t.video.label}`}
              className="absolute inset-0 flex items-end justify-start p-4"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-pill bg-paper text-ink transition-opacity duration-200 ${
                  playing === i ? "opacity-0 hover:opacity-100 focus-visible:opacity-100" : "opacity-100"
                }`}
              >
                {playing === i ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
              </span>
            </button>
            {t.isPlaceholder && (
              <span className="eyebrow pointer-events-none absolute top-3 left-3 rounded-pill bg-[#ffe14d] px-2.5 py-1 text-ink">
                Placeholder
              </span>
            )}
          </div>
          <p className="mt-3 font-display font-medium">
            <Txt>{t.name}</Txt>
          </p>
          {t.role && <p className="text-small text-mute-dark">{t.role}</p>}
        </li>
      ))}
    </ul>
  );
}
