"use client";

/**
 * Home hero on phones: the owner's logo animation ("Logo hero loop", src/assets/logo-hero.json,
 * a Lottie: shards, pause bars, play triangle, arm, handset), scrubbed by scroll instead of looping.
 * The desktop story (FriendStory) is too detailed for a small screen.
 *
 * A tall section with a sticky stage; one damped progress number (lib/scrollScene.ts) picks the
 * frame, so scrolling back plays it backwards, exactly. The closing line of the story fades in
 * at the end. The Lottie player and the JSON load only on phones.
 * Reduced motion: the last frame, still.
 */

import { useEffect, useRef } from "react";
import { createScrollScene, seg, clamp01, easeOut, easeInOut } from "@/lib/scrollScene";

type Line = { text: string; accent?: string };

export function LogoScrollHero({ line, label }: { line: Line; label: string }) {
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const el = box.current;
    if (!sec || !el || window.matchMedia("(min-width: 768px)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let destroy: (() => void) | null = null;

    (async () => {
      const [{ default: lottie }, data] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        import("@/assets/logo-hero.json").then((m) => m.default),
      ]);
      if (!alive) return;
      const anim = lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: structuredClone(data),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      // The loop opens the G up again after ~frame 330; the complete mark (with the arrow inside)
      // holds from ~270 to ~330, so the scroll ends at 300.
      const last = Math.min(300, Math.max(0, anim.getDuration(true) - 1));
      const inner = sec.querySelector<HTMLElement>(".lh-inner")!;
      const text = sec.querySelector<HTMLElement>(".lh-line")!;
      const eyebrow = sec.querySelector<HTMLElement>(".lh-eyebrow")!;

      if (reduced) {
        anim.goToAndStop(last, true);
        text.style.opacity = "1";
        destroy = () => anim.destroy();
        return;
      }

      let coverAt = 0.75;
      const measure = () => {
        const vh = window.innerHeight;
        const range = Math.max(1, sec.offsetHeight - vh);
        coverAt = Math.max(0.5, (range - vh) / range);
      };
      let lastFrame = -1;
      const render = (p: number) => {
        const c = clamp01(p / coverAt);
        // the animation plays across the first 80% of the scroll, the line lands after it
        const f = Math.round(seg(c, 0, 0.8) * last);
        if (f !== lastFrame) {
          anim.goToAndStop(f, true);
          lastFrame = f;
        }
        const l = easeOut(seg(c, 0.78, 0.92));
        text.style.opacity = String(l);
        text.style.transform = `translate3d(0, ${((1 - l) * 24).toFixed(1)}px, 0)`;
        eyebrow.style.opacity = String(1 - seg(c, 0.05, 0.15));
        const cv = easeInOut(seg(p, coverAt, 1));
        inner.style.transform = cv > 0 ? `scale(${(1 - 0.06 * cv).toFixed(4)})` : "";
        inner.style.opacity = String(1 - 0.65 * cv);
      };
      const scene = createScrollScene(sec, render, { tau: 110, onMeasure: measure });
      destroy = () => {
        scene.destroy();
        anim.destroy();
      };
    })();

    return () => {
      alive = false;
      destroy?.();
    };
  }, []);

  const i = line.accent ? line.text.indexOf(line.accent) : -1;
  return (
    <section ref={section} className="logo-hero relative h-[420svh] bg-black md:hidden motion-reduce:h-auto">
      <h1 className="sr-only">{line.text}</h1>
      <div className="sticky top-0 h-[100svh] overflow-hidden motion-reduce:static">
        <div className="lh-inner absolute inset-0 flex flex-col items-center justify-center px-(--gutter) motion-reduce:static motion-reduce:py-24">
          <div ref={box} aria-hidden className="aspect-[800/640] w-full max-w-[26rem]" />
          <p className="lh-eyebrow eyebrow absolute bottom-[14svh] flex items-center gap-3 text-mute-dark">
            <span className="h-px w-8 bg-signal" />
            {label}
          </p>
          <p className="lh-line mt-10 max-w-[13ch] self-start font-display text-h1 leading-[0.98] font-semibold tracking-[-0.035em] text-balance text-paper opacity-0 motion-reduce:opacity-100">
            {i < 0 ? (
              line.text
            ) : (
              <>
                {line.text.slice(0, i)}
                <span className="text-signal">{line.accent}</span>
                {line.text.slice(i + (line.accent?.length ?? 0))}
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
