"use client";

/**
 * Course page journey: "From your first module to your certificate." as a sheet you complete.
 *
 * A tall section with a sticky stage, driven by one damped progress number (lib/scrollScene.ts).
 * At rest (as it scrolls in) the paper sheet is open: title, 0 / 7, seven pale step cards.
 *  0.06–0.84  you work through the steps: each card in turn lifts (red ring), draws its
 *             illustration, floods with its tint and gets a red check; the counter climbs to 7 / 7
 *             and the active step's line shows under the cards
 *  0.74–0.82  the "GenClosers Certified" stamp lands
 *  0.86–0.95  the sheet turns over in 3D: its back is the certificate (owner 2026-11-10)
 * Every visual is a pure function of progress, so slow back-and-forth scrolling is exact.
 * Without JS / with reduced motion the markup is the finished sheet (all steps done).
 */

import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { JourneyIcon } from "./JourneyIcons";
import { createScrollScene, seg, lerp, easeOut, easeInOut } from "@/lib/scrollScene";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { TONES, tint } from "@/lib/tones";
import { createConfetti } from "@/lib/confetti";
import { site } from "@/content/site";
import type { Card } from "@/content/types";

const HEADER_SPACE = 88; // px kept clear for the fixed header
const WALK = [0.06, 0.72] as const;
const backOut = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

/** The sample certificate on the back of the journey sheet: ink, red curved panels, our stamp as the seal. */
function Certificate({ courseName }: { courseName: string }) {
  const t = site.ui.certificate;
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden rounded-[18px] bg-ink text-paper shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
    >
      {/* red curved panels with a dark band, top left and bottom right */}
      <svg viewBox="0 0 420 300" className="absolute -top-px -left-px w-[44%] max-w-[30rem]" aria-hidden>
        <path d="M0 0H360C300 40 270 120 190 205C140 258 70 290 0 300Z" className="fill-ink-2" />
        <path d="M0 0H322C268 36 240 108 168 185C122 234 62 262 0 272Z" className="fill-signal" />
        <path d="M0 0H250C210 30 188 84 132 146C96 186 50 210 0 220Z" className="fill-signal-deep" opacity="0.55" />
      </svg>
      <svg viewBox="0 0 420 300" className="absolute -right-px -bottom-px w-[30%] max-w-[20rem] rotate-180" aria-hidden>
        <path d="M0 0H360C300 40 270 120 190 205C140 258 70 290 0 300Z" className="fill-ink-2" />
        <path d="M0 0H322C268 36 240 108 168 185C122 234 62 262 0 272Z" className="fill-signal" />
      </svg>

      {/* the seal: our stamp */}
      <div className="absolute top-[9%] left-[6%] grid size-[clamp(4.5rem,11vw,8.5rem)] -rotate-9 place-items-center rounded-full border-2 border-signal bg-paper text-signal shadow-[0_14px_36px_-12px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-1.5 rounded-full border border-signal/40" />
        <div className="relative flex flex-col items-center gap-1 px-2 text-center">
          <LogoMark className="h-[clamp(1rem,2.4vw,1.9rem)] w-auto" title="" />
          <span className="font-mono text-[clamp(0.45rem,0.9vw,0.7rem)] leading-tight tracking-[0.14em] uppercase">{site.ui.certified}</span>
        </div>
      </div>

      <div className="relative flex h-full flex-col items-end justify-center px-[6%] py-[5%] text-right">
        <p className="font-display text-[clamp(1.6rem,4.6vw,3.6rem)] leading-none font-semibold tracking-[0.06em] uppercase">{t.title}</p>
        <p className="mt-1 font-display text-[clamp(0.8rem,2vw,1.5rem)] font-light tracking-[0.32em] uppercase">{t.subtitle}</p>
        <span className="mt-3 block h-px w-[clamp(8rem,26vw,20rem)] bg-paper/50" />
        <div className="mt-[clamp(0.8rem,3vw,2.2rem)] w-full max-w-[34rem] text-center md:mr-[4%]">
          <p className="font-mono text-[clamp(0.55rem,1vw,0.75rem)] tracking-[0.3em] text-paper/70 uppercase">{t.presented}</p>
          <p className="mt-2 font-display text-[clamp(2rem,5.4vw,4.2rem)] leading-none font-semibold tracking-[-0.03em] text-signal">
            {t.name}
          </p>
          <p className="mt-2 text-[clamp(0.7rem,1.4vw,1rem)] text-paper/75">
            {t.for} <span className="font-semibold text-paper">{courseName}</span>
          </p>
          <div className="mt-[clamp(1rem,3.5vw,2.6rem)] flex justify-center gap-[clamp(1.5rem,6vw,5rem)]">
            {[t.date, t.signature].map((l) => (
              <span key={l} className="flex flex-col items-center gap-1.5">
                <span className="block h-px w-[clamp(5rem,12vw,9rem)] bg-paper/45" />
                <span className="font-mono text-[clamp(0.5rem,0.9vw,0.68rem)] tracking-[0.2em] text-paper/60 uppercase">{l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function JourneySheet({ heading, steps, courseName }: { heading: string; steps: Card[]; courseName: string }) {
  const section = useRef<HTMLElement>(null);
  const motion = useMotionAllowed();
  const total = steps.length;

  useEffect(() => {
    const sec = section.current;
    if (!motion || !sec) return;
    const q = (s: string) => sec.querySelector<HTMLElement>(s)!;
    const qa = (s: string, root: ParentNode = sec) => Array.from(root.querySelectorAll<HTMLElement>(s));
    const stage = q(".js-stage");
    const sheetEl = q(".js-sheet");
    const bar = q(".js-bar");
    const count = q(".js-count");
    const stamp = q(".js-stamp");
    const turn = q(".js-turn");
    // celebration: confetti bursts from both sides once the certificate faces you
    const css = getComputedStyle(document.documentElement);
    const tok = (n: string) => css.getPropertyValue(n).trim();
    const confetti = createConfetti(q(".js-confetti") as unknown as HTMLCanvasElement, [
      tok("--color-signal"), tok("--color-signal"), tok("--color-signal-deep"), tok("--color-paper"), tok("--color-paper"), ...TONES,
    ]);
    let cheered = false;
    const captions = qa(".js-caption");
    const cards = qa(".js-card").map((el) => ({
      el,
      fill: el.querySelector<HTMLElement>(".js-fill")!,
      ring: el.querySelector<HTMLElement>(".js-ring")!,
      check: el.querySelector<HTMLElement>(".js-check")!,
      lines: qa("[data-draw]", el) as unknown as SVGPathElement[],
    }));
    const n = cards.length;
    const L = (WALK[1] - WALK[0]) / n;

    const measure = () => {
      const st = stage.getBoundingClientRect();
      sheetEl.style.transform = "none";
      const fit = Math.min(1, (st.height - HEADER_SPACE - 16) / Math.max(1, sheetEl.offsetHeight));
      sheetEl.style.transform = fit < 1 ? `scale(${fit.toFixed(4)})` : "";
    };

    let lastDone = -1;
    const render = (p: number) => {
      let done = 0;
      cards.forEach((card, i) => {
        const t = seg(p, WALK[0] + i * L, WALK[0] + (i + 1) * L);
        const lift = Math.sin(Math.PI * t); // up while it is the active step, settles when done
        const draw = easeInOut(seg(t, 0, 0.55));
        const fill = easeInOut(seg(t, 0.35, 0.85));
        const chk = seg(t, 0.7, 1);
        if (t >= 0.7) done++;
        card.el.style.opacity = String(0.5 + 0.5 * Math.max(lift, fill));
        card.el.style.transform = `translate3d(0, ${(-lift * 10).toFixed(1)}px, 0)`;
        card.ring.style.opacity = lift.toFixed(3);
        card.fill.style.clipPath = `inset(${((1 - fill) * 100).toFixed(2)}% 0 0 0)`;
        for (const l of card.lines) l.style.strokeDashoffset = (1 - draw).toFixed(3);
        card.check.style.opacity = chk > 0 ? "1" : "0";
        card.check.style.transform = `scale(${chk > 0 ? backOut(chk).toFixed(3) : 0})`;
      });
      if (done !== lastDone) {
        count.textContent = String(done);
        lastDone = done;
      }
      const w = seg(p, WALK[0], WALK[1]);
      bar.style.transform = `scaleX(${w.toFixed(4)})`;

      // The line under the cards: the step you are on (crossfades, never two at once)
      const sp = Math.min(n - 0.5, Math.max(0.5, w * n));
      captions.forEach((c, i) => {
        const d = sp - (i + 0.5);
        c.style.opacity = String(Math.max(0, Math.min(1, (0.5 - Math.abs(d)) / 0.14)));
        c.style.transform = `translate3d(0, ${(-d * 14).toFixed(1)}px, 0)`;
      });

      // Certified: the stamp lands
      const s = seg(p, 0.74, 0.82);
      const se = easeOut(s);
      stamp.style.opacity = String(easeOut(seg(s, 0, 0.4)));
      stamp.style.transform = `rotate(${lerp(-20, -9, se).toFixed(2)}deg) scale(${lerp(1.8, 1, se).toFixed(4)})`;

      // ...then the sheet turns over: the certificate is on its back
      const f = easeInOut(seg(p, 0.86, 0.95));
      const lift = Math.sin(Math.PI * f);
      turn.style.transform = `rotateY(${(f * 180).toFixed(2)}deg) scale(${(1 - 0.07 * lift).toFixed(4)})`;
      if (!cheered && p >= 0.935) {
        cheered = true;
        confetti.burst();
      } else if (cheered && p < 0.86) cheered = false; // scroll back up and it can cheer again
    };

    const scene = createScrollScene(sec, render, { tau: 110, onMeasure: measure });
    sec.classList.add("is-ready");
    return () => {
      scene.destroy();
      confetti.destroy();
      sec.classList.remove("is-ready");
      count.textContent = String(n);
      for (const e of [bar, stamp, sheetEl, turn, ...captions, ...cards.flatMap((k) => [k.el, k.fill, k.ring, k.check])]) {
        e.style.transform = "";
        e.style.opacity = "";
        e.style.clipPath = "";
      }
      for (const k of cards) for (const l of k.lines) l.style.strokeDashoffset = "";
    };
  }, [motion]);

  return (
    <section ref={section} className="journey-sheet relative h-[400svh] bg-black max-md:h-[380svh] motion-reduce:h-auto">
      <div className="js-stage sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-(--gutter) pt-[88px] pb-4 motion-reduce:static motion-reduce:h-auto motion-reduce:py-(--section-y)">
        <canvas aria-hidden className="js-confetti pointer-events-none absolute inset-0 z-20 size-full motion-reduce:hidden" />
        <div className="js-sheet relative w-full max-w-[66rem] origin-center" style={{ perspective: "2200px" }}>
          <div className="js-turn relative [transform-style:preserve-3d] will-change-transform">
          <div className="relative [backface-visibility:hidden]">
          <div className="relative rounded-[18px] bg-paper p-5 text-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] sm:p-8 md:p-10">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-h3 leading-tight font-semibold tracking-[-0.02em] text-balance md:text-h2">{heading}</h2>
              <p className="shrink-0 text-right">
                <span className="eyebrow block text-mute-light">{site.ui.stepsLabel}</span>
                <span className="font-display text-h2 leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  <span className="js-count">{total}</span>
                  <span className="text-mute-light"> / {total}</span>
                </span>
              </p>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-paper-line">
              <div className="js-bar h-full origin-left rounded-full bg-signal" />
            </div>

            <ol className="mt-5 grid grid-cols-4 gap-2 sm:mt-7 sm:gap-3 md:grid-cols-7">
              {steps.map((s, i) => (
                <li key={s.title} className="js-card relative will-change-transform">
                  <div className="relative flex h-full min-h-[8.5rem] flex-col overflow-hidden rounded-[12px] border border-ink/10 bg-paper p-2.5 sm:min-h-[11.5rem] sm:p-3">
                    <span aria-hidden className="js-fill absolute inset-0" style={{ background: tint(TONES[i % TONES.length], 62) }} />
                    <div className="relative flex items-center justify-between">
                      <span className="font-mono text-label text-ink/60">{String(i + 1).padStart(2, "0")}</span>
                      <span aria-hidden className="js-check grid h-5 w-5 place-items-center rounded-full bg-signal text-paper">
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 6.2l2.3 2.3 4.7-5" />
                        </svg>
                      </span>
                    </div>
                    <span className="relative mt-2 block h-9 w-9 sm:mt-3 sm:h-12 sm:w-12">
                      <JourneyIcon index={i} className="absolute inset-0 h-full w-full text-ink/15" />
                      <JourneyIcon index={i} draw className="absolute inset-0 h-full w-full text-ink" />
                    </span>
                    <span className="relative mt-auto pt-2 font-display text-[0.6rem] leading-tight font-semibold break-words hyphens-auto sm:text-small">
                      {s.title}
                    </span>
                  </div>
                  <span aria-hidden className="js-ring pointer-events-none absolute -inset-[3px] rounded-[14px] border-2 border-signal opacity-0" />
                </li>
              ))}
            </ol>

            {/* What this step means (the one you are on) */}
            <div className="relative mt-6 min-h-[3.2rem] sm:mt-8">
              {steps.map((s, i) => (
                <p key={s.title} className="js-caption absolute inset-x-0 top-0 max-w-[40rem] pr-24 text-body sm:pr-36 text-ink/75 sm:text-lead motion-reduce:hidden" style={{ opacity: i === total - 1 ? 1 : 0 }}>
                  <span className="mr-3 font-mono text-label text-signal">{String(i + 1).padStart(2, "0")}</span>
                  {s.body}
                </p>
              ))}
            </div>
          </div>

          <div
            aria-hidden
            className="js-stamp absolute -right-1 -bottom-3 grid h-24 w-24 place-items-center rounded-full border-2 border-signal bg-paper text-signal shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] sm:-right-6 sm:-bottom-8 sm:h-36 sm:w-36"
            style={{ transform: "rotate(-9deg)" }}
          >
            <div className="absolute inset-1.5 rounded-full border border-signal/40" />
            <div className="relative flex flex-col items-center gap-1.5 px-3 text-center">
              <LogoMark className="h-6 w-auto sm:h-8" title="" />
              <span className="font-mono text-[0.6rem] leading-tight tracking-[0.14em] uppercase sm:text-label">{site.ui.certified}</span>
            </div>
          </div>
          </div>

          {/* the back of the sheet: the certificate, in the site's ink and red */}
          <Certificate courseName={courseName} />
          </div>
        </div>
      </div>
    </section>
  );
}
