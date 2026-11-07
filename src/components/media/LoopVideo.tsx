"use client";

import { useEffect, useRef } from "react";
import type { Media } from "@/content/types";

/**
 * Silent looping clip. Loads lazily, plays only while on screen,
 * and stays on its poster image for reduced motion.
 * `rate` < 1 slows it down (the source is 60fps, so 0.75 still plays smoothly at 45fps).
 */
export function LoopVideo({
  media,
  className = "",
  priority = false,
  rate = 1,
}: {
  media: Media;
  className?: string;
  priority?: boolean;
  rate?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const applyRate = () => {
      v.defaultPlaybackRate = rate;
      v.playbackRate = rate;
    };
    v.addEventListener("loadedmetadata", applyRate);
    applyRate();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (v.preload === "none") {
            v.preload = "auto";
            v.load();
          }
          applyRate();
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("loadedmetadata", applyRate);
    };
  }, [rate]);

  return (
    <video
      ref={ref}
      className={`block h-auto w-full bg-ink-2 object-cover ${className}`}
      style={{ aspectRatio: `${media.width} / ${media.height}` }}
      width={media.width}
      height={media.height}
      poster={`${media.base}-poster.jpg`}
      muted
      loop
      playsInline
      preload={priority ? "auto" : "none"}
      aria-label={media.label}
      disablePictureInPicture
    >
      <source src={`${media.base}.webm`} type="video/webm" />
      <source src={`${media.base}.mp4`} type="video/mp4" />
    </video>
  );
}

/** Edge-to-edge band for the loop video, full browser width. */
export function LoopBand({ media, rate = 0.75 }: { media: Media; rate?: number }) {
  return (
    <section aria-label={media.label} className="relative w-full overflow-hidden bg-ink-2">
      <LoopVideo media={media} rate={rate} className="max-h-[92svh]" />
    </section>
  );
}
