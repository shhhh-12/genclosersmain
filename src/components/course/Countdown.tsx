"use client";

/**
 * Countdown to the batch start. Digits sit on little vertical reels (0-9) and click into place
 * with the spoke wheel's easing, so every second feels like a beat of the wheel.
 * Renders placeholders on the server (time is only known in the browser) and hides itself
 * once the start time has passed. Reduced motion: digits change without rolling.
 */

import { useEffect, useState } from "react";
import { site } from "@/content/site";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function Digit({ value }: { value: number | null }) {
  return (
    <span className="relative block h-[1em] w-[0.64em] shrink-0 overflow-hidden text-center">
      <span
        className="absolute inset-x-0 top-0 block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.5,0,0,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(${-(value ?? 0)}em)` }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-none">
            {value === null ? "-" : i}
          </span>
        ))}
      </span>
    </span>
  );
}

function Unit({ value, label, pad = 2, big }: { value: number | null; label: string; pad?: number; big: boolean }) {
  const digits = value === null ? Array<number | null>(pad).fill(null) : String(value).padStart(pad, "0").split("").map(Number);
  return (
    <div className="group flex flex-col">
      <span className={`flex font-display leading-none font-bold tracking-[-0.02em] whitespace-nowrap tabular-nums transition-colors duration-450 group-hover:text-signal ${big ? "countdown-big" : "text-h2"}`}>
        {digits.map((d, i) => (
          <Digit key={digits.length - i} value={d} />
        ))}
      </span>
      <span className="eyebrow mt-3 text-mute-dark">{label}</span>
    </div>
  );
}

export function Countdown({ startsAt, label, dateLabel, size = "large" }: { startsAt: string; label: string; dateLabel: string; size?: "large" | "compact" }) {
  const target = new Date(startsAt).getTime();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(target - Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [target]);

  if (left !== null && left <= 0) return null;
  const p = left === null ? null : parts(left);
  const big = size === "large";
  const u = site.ui.countdown;

  return (
    <div role="timer" aria-label={`${label}: ${dateLabel}`}>
      <p className="eyebrow flex items-center gap-3 text-mute-dark">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />
          <span className="relative h-2 w-2 rounded-full bg-signal" />
        </span>
        {label} · <span className="text-paper">{dateLabel}</span>
      </p>
      <div aria-hidden className={`mt-5 flex items-end ${big ? "gap-5 sm:gap-10" : "gap-4 sm:gap-6"}`}>
        <Unit value={p?.d ?? null} label={u.days} big={big} />
        <span className={`font-display leading-none font-bold text-signal ${big ? "countdown-big" : "text-h2"} mb-[1.9rem] animate-pulse`}>:</span>
        <Unit value={p?.h ?? null} label={u.hours} big={big} />
        <span className={`font-display leading-none font-bold text-signal ${big ? "countdown-big" : "text-h2"} mb-[1.9rem] animate-pulse`}>:</span>
        <Unit value={p?.m ?? null} label={u.minutes} big={big} />
        <span className={`hidden font-display leading-none font-bold text-signal lg:inline ${big ? "countdown-big" : "text-h2"} mb-[1.9rem] animate-pulse`}>:</span>
        <span className="hidden lg:block">
          <Unit value={p?.s ?? null} label={u.seconds} big={big} />
        </span>
      </div>
    </div>
  );
}
