"use client";

/**
 * VSL player.
 * - Preview: plays muted on a loop as soon as it is on screen (never with sound on its own).
 *   Clicking anywhere restarts it from the beginning with sound and shows the controls.
 * - Ambient light: a clean red glow behind the frame (pure brand red; sampling the grey video made it muddy).
 * - Fixed aspect ratio, so no layout shift. 720p on phones, 1080p elsewhere.
 * - Keyboard: Space/K play-pause, M mute, F fullscreen, ←/→ seek 5s.
 * - Captions track appears automatically once `media.captions` is set.
 * - Reduced motion: no autoplay preview, just the poster and play button.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Volume, Fullscreen } from "@/components/ui/Icons";
import type { Media } from "@/content/types";

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VslPlayer({ media, soundLabel }: { media: Media; soundLabel: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"poster" | "preview" | "full">("poster");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [idle, setIdle] = useState(false);
  const [failed, setFailed] = useState(false);
  const idleTimer = useRef<number | undefined>(undefined);
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Muted preview while on screen
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (modeRef.current === "full") {
          if (!e.isIntersecting && !v.paused) v.pause();
          return;
        }
        if (e.isIntersecting) {
          v.muted = true;
          v.loop = true;
          v.play()
            .then(() => setMode("preview"))
            .catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const startFull = useCallback(() => {
    const v = video.current;
    if (!v) return;
    setMode("full");
    modeRef.current = "full";
    v.loop = false;
    v.currentTime = 0;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => setFailed(true));
  }, []);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (modeRef.current !== "full") return startFull();
    if (v.paused) v.play().catch(() => setFailed(true));
    else v.pause();
  }, [startFull]);

  const seek = (delta: number) => {
    const v = video.current;
    if (v) v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0);
  };

  const fullscreen = () => {
    const el = wrap.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el?.requestFullscreen) el.requestFullscreen();
    else v?.webkitEnterFullscreen?.();
  };

  const wake = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2200);
  };
  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      e.preventDefault();
      toggle();
    } else if (k === "m") {
      if (video.current) video.current.muted = !video.current.muted;
      setMuted((m) => !m);
    } else if (k === "f") fullscreen();
    else if (k === "arrowright") seek(5);
    else if (k === "arrowleft") seek(-5);
  };

  const progress = duration ? (time / duration) * 100 : 0;
  const showChrome = !playing || !idle;
  const full = mode === "full";

  return (
    <div className="relative isolate">
      {/* Ambient light behind the frame */}
      {/* clean bias light: a wide soft red pool, strongest under the frame, and a tight rim at the edges */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-[3%] -inset-y-[4%] -z-10">
        <div className="absolute inset-x-[12%] top-[22%] -bottom-[6%] rounded-full bg-signal opacity-40 blur-[110px] max-sm:blur-[60px]" />
        <div className="absolute inset-[3%] rounded-[28px] bg-signal-deep opacity-45 blur-[34px] max-sm:blur-[20px]" />
      </div>

      <div
        ref={wrap}
        role="region"
        aria-label={media.label}
        onKeyDown={onKey}
        onPointerMove={wake}
        className="group/vsl relative overflow-hidden rounded-soft bg-ink-2 shadow-media ring-1 ring-signal/30 transition-shadow duration-800 hover:ring-signal/70"
        style={{ aspectRatio: `${media.width} / ${media.height}` }}
      >
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-cover"
          width={media.width}
          height={media.height}
          poster={`${media.base}-poster.jpg`}
          preload="metadata"
          muted
          playsInline
          onClick={toggle}
          onPlay={() => {
            setPlaying(true);
            wake();
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            setTime(e.currentTarget.currentTime);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onError={() => setFailed(true)}
        >
          <source src={`${media.base}-720.mp4`} type="video/mp4" media="(max-width: 767px)" />
          <source src={`${media.base}.webm`} type="video/webm" />
          <source src={`${media.base}.mp4`} type="video/mp4" />
          {media.captions && <track kind="captions" src={media.captions} srcLang="en" label="English" default />}
          Your browser can’t play this video. <a href={`${media.base}.mp4`}>Download it here</a>.
        </video>

        {/* Before sound: big play button + "watch with sound" */}
        {!full && (
          <button
            type="button"
            onClick={startFull}
            className="group/play absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgb(12_11_11/0.05),rgb(12_11_11/0.5))]"
            aria-label={soundLabel}
          >
            <span className="relative flex h-20 w-20 items-center justify-center rounded-pill bg-signal text-signal-ink shadow-[0_0_40px_rgb(227_16_27/0.6)] transition-transform duration-450 ease-primary group-hover/play:scale-110 sm:h-24 sm:w-24">
              <span className="absolute inset-0 animate-ping rounded-pill bg-signal opacity-25" />
              <Play className="relative ml-1 h-8 w-8" />
            </span>
            {mode === "preview" && (
              <span className="eyebrow absolute bottom-4 left-4 flex items-center gap-2 rounded-pill bg-ink/70 px-3.5 py-2 text-paper backdrop-blur-sm transition-colors group-hover/play:bg-signal">
                <Volume muted className="h-4 w-4" /> {soundLabel}
              </span>
            )}
          </button>
        )}

        {failed && (
          <p className="absolute inset-x-4 top-4 rounded-sharp bg-ink/90 p-3 text-small text-paper">
            The video couldn’t load. <a className="underline" href={`${media.base}.mp4`}>Open it directly</a>.
          </p>
        )}

        {full && (
          <div
            className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-ink/85 to-transparent px-3 pt-10 pb-3 transition-opacity duration-450 sm:gap-4 sm:px-5 sm:pb-4 ${
              showChrome ? "opacity-100" : "opacity-0 focus-within:opacity-100"
            }`}
          >
            <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="flex h-10 w-10 items-center justify-center rounded-pill text-paper hover:bg-signal">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <span className="font-mono text-[0.75rem] text-paper tabular-nums">
              {fmt(time)} / {fmt(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={time}
              onChange={(e) => {
                if (video.current) video.current.currentTime = Number(e.target.value);
              }}
              aria-label="Seek"
              aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
              className="vsl-range h-1 flex-1 cursor-pointer"
              style={{ ["--p" as string]: `${progress}%` }}
            />
            <button
              type="button"
              onClick={() => {
                if (video.current) video.current.muted = !muted;
                setMuted(!muted);
              }}
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
              className="flex h-10 w-10 items-center justify-center rounded-pill text-paper hover:bg-signal"
            >
              <Volume muted={muted} />
            </button>
            <button type="button" onClick={fullscreen} aria-label="Full screen" className="flex h-10 w-10 items-center justify-center rounded-pill text-paper hover:bg-signal">
              <Fullscreen />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
