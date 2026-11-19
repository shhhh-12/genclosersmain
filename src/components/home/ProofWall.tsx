"use client";

/**
 * "Why we do this." (owner 2026-11-19): real proof, laid out like a desk of polaroids. The workshop
 * photos are prints captioned "Workshop"; the messages people sent are screenshots taped down with a
 * heart under them. Desktop: scattered and tilted, drag them around (lib/usePolaroidDrag.ts, same as
 * "Who it's for"). Click (tap) a card: it zooms smoothly out of its spot into a close view; click
 * anywhere or press Esc to send it back. Double-click (double-tap): a like, a red heart badge pops on
 * the card's top right. Phones: a swipeable row. YouTube and Instagram sit beside the heading.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePolaroidDrag } from "@/lib/usePolaroidDrag";
import { lockScroll } from "@/lib/scroll";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { Arrow, Instagram as InstagramIcon, Play, Rupee } from "@/components/ui/Icons";

type ProofItem = { src: string; width: number; height: number; alt: string; kind: "photo" | "message" };
type YouTube = { href: string; handle: string; stats: string; cta: string; banner: { src: string; width: number; height: number } };
type Insta = { href: string; handle: string; name: string; stats: string; bio: readonly { text: string; rupee?: boolean }[]; cta: string; photo: string };
type Copy = { workshop: string; like: string; liked: string; close: string; preview: string };

// desktop scatter: left %, top px, tilt, width px (same order as the items)
const SPOTS = [
  { l: 0, t: 30, r: -4, w: 380 },
  { l: 30, t: 0, r: 3, w: 300 },
  { l: 55, t: 46, r: -3, w: 330 },
  { l: 81, t: 6, r: 5, w: 240 },
  { l: 2, t: 470, r: 4, w: 260 },
  { l: 25, t: 410, r: -4, w: 290 },
  { l: 51, t: 440, r: 3, w: 280 },
  { l: 77, t: 420, r: -5, w: 260 },
];
const DOUBLE_MS = 280; // a second click within this is a double-click (a like), not a preview

function Heart({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4.5 6.9 4.5c2 0 3.4 1.1 5.1 3 1.7-1.9 3.1-3 5.1-3 3.3 0 5.5 3.1 4.2 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
    </svg>
  );
}

export function ProofWall({ heading, sub, dragHint, youtube, instagram, copy, items }: { heading: string; sub: string; dragHint: string; youtube: YouTube; instagram: Insta; copy: Copy; items: ProofItem[] }) {
  const table = useRef<HTMLUListElement>(null);
  usePolaroidDrag(table);
  const motion = useMotionAllowed();
  const [liked, setLiked] = useState<Set<number>>(() => new Set());
  const [burst, setBurst] = useState<{ i: number; k: number } | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const last = useRef({ i: -1, t: 0 });
  const timer = useRef(0);
  const big = useRef<HTMLImageElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const likes = useRef(0); // a fresh key for every like, so the heart pops again

  const like = (i: number) => {
    setLiked((s) => new Set(s).add(i));
    setBurst({ i, k: ++likes.current });
  };

  // the card's picture, where it sits on the page right now
  const cardImg = (i: number) => table.current?.querySelectorAll<HTMLImageElement>("[data-pol] img")[i] ?? null;
  // a transform that puts the big picture exactly over the small one
  const fromCard = (i: number) => {
    const a = cardImg(i)?.getBoundingClientRect();
    const b = big.current?.getBoundingClientRect();
    if (!a || !b || !b.width) return "none";
    return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})`;
  };

  // open: the big picture grows out of the card
  useEffect(() => {
    if (open === null) return;
    lockScroll(true);
    closeBtn.current?.focus({ preventScroll: true });
    if (motion && big.current && shade.current) {
      big.current.animate([{ transform: fromCard(open) }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      shade.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: "ease-out" });
    }
    return () => lockScroll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // close: it shrinks back into its card
  const close = useCallback(() => {
    if (open === null || closing.current) return;
    const i = open;
    const done = () => {
      closing.current = false;
      setOpen(null);
      (table.current?.querySelectorAll<HTMLElement>("[data-pol]")[i])?.focus({ preventScroll: true });
    };
    if (!motion || !big.current || !shade.current) return done();
    closing.current = true;
    big.current.animate([{ transform: "none" }, { transform: fromCard(i) }], { duration: 380, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" });
    shade.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: "ease-in", fill: "forwards" }).onfinish = done;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, motion]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // one click: preview (after a short wait); two quick clicks: like
  const onCard = (i: number, el: HTMLElement, now: number) => {
    if (el.dataset.dragged === "1") {
      el.dataset.dragged = "";
      return;
    }
    if (last.current.i === i && now - last.current.t < DOUBLE_MS) {
      window.clearTimeout(timer.current);
      last.current = { i: -1, t: 0 };
      like(i);
      return;
    }
    last.current = { i, t: now };
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(i), DOUBLE_MS);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const channel = "group block overflow-hidden rounded-2xl border-[2.5px] border-ink bg-ink text-paper shadow-[7px_8px_0_0_rgba(0,0,0,0.55)] transition-transform duration-450 ease-primary hover:-translate-y-1";
  const go = (label: string) => (
    <span className="inline-flex items-center gap-2 font-display text-small font-semibold text-paper transition-colors group-hover:text-signal">
      {label}
      <span className="text-signal transition-transform duration-450 ease-primary group-hover:translate-x-1">
        <Arrow />
      </span>
    </span>
  );
  const item = open === null ? null : items[open];

  return (
    <section className="on-paper section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] text-balance">{heading}</h2>
            <p className="mt-4 max-w-[42ch] text-lead text-mute-light">{sub}</p>
          </div>
          {/* where the messages come from: the channel and Monish's Instagram */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            <a href={youtube.href} target="_blank" rel="noopener noreferrer" className={channel}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youtube.banner.src} alt="" width={youtube.banner.width} height={youtube.banner.height} loading="lazy" className="block h-auto w-full" />
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <span className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-signal text-signal-ink">
                    <Play className="ml-0.5 size-4" />
                  </span>
                  <span>
                    <span className="block font-display font-semibold">{youtube.handle}</span>
                    <span className="block text-small text-mute-dark">{youtube.stats}</span>
                  </span>
                </span>
                {go(youtube.cta)}
              </div>
            </a>
            <a href={instagram.href} target="_blank" rel="noopener noreferrer" className={`${channel} px-5 py-4`}>
              <span className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={instagram.photo} alt={instagram.name} width={256} height={256} loading="lazy" className="size-14 shrink-0 rounded-full" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-display font-semibold">
                    {instagram.handle}
                    {/* verified on Instagram */}
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[#3897f0]" aria-hidden>
                      <path fill="currentColor" d="M12 1.5l2.6 1.9 3.2-.2 1 3.1 2.7 1.8-1 3.1 1 3.1-2.7 1.8-1 3.1-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3.1-2.7-1.8 1-3.1-1-3.1 2.7-1.8 1-3.1 3.2.2z" />
                      <path d="M8 12.3l2.6 2.6L16.2 9.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="block truncate text-small text-mute-dark">{instagram.name}</span>
                  <span className="block text-small text-paper/85">{instagram.stats}</span>
                </span>
              </span>
              <span className="mt-3 block space-y-0.5 text-small text-paper/80">
                {instagram.bio.map((b) => (
                  <span key={b.text} className="block">
                    {b.rupee ? (
                      <>
                        {b.text.split("₹")[0]}
                        <span className="sr-only">₹</span>
                        <Rupee className="inline-block h-[0.72em] w-auto align-[0.02em]" />
                        {b.text.split("₹")[1]}
                      </>
                    ) : (
                      b.text
                    )}
                  </span>
                ))}
              </span>
              <span className="mt-3 flex items-center justify-between gap-3">
                <InstagramIcon className="size-5 text-paper/70" />
                {go(instagram.cta)}
              </span>
            </a>
          </div>
        </div>

        <ul ref={table} className="pol-table -mx-(--gutter) mt-14 flex snap-x items-start gap-5 overflow-x-auto px-(--gutter) pt-5 pb-8 lg:relative lg:mx-0 lg:mt-16 lg:block lg:h-[940px] lg:overflow-visible lg:px-0 lg:pt-0 lg:pb-0">
          {items.map((it, i) => {
            const sp = SPOTS[i % SPOTS.length];
            const photo = it.kind === "photo";
            const isLiked = liked.has(i);
            return (
              <li
                key={it.src}
                data-pol
                tabIndex={0}
                role="button"
                aria-label={`${it.alt} ${copy.preview}`}
                onClick={(e) => onCard(i, e.currentTarget, e.timeStamp)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(i);
                  }
                }}
                className={`pol proof-pol shrink-0 cursor-zoom-in snap-center select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal lg:absolute ${photo ? "w-[280px]" : "w-[240px]"}`}
                style={{ left: `${sp.l}%`, top: sp.t, ["--r" as string]: `${sp.r}deg`, ["--w" as string]: `${sp.w}px` }}
              >
                <figure className="relative rounded-[6px] border-[2.5px] border-ink bg-white p-3 pb-3.5 text-ink shadow-[7px_8px_0_0_rgba(0,0,0,0.55)]">
                  {/* a strip of tape holding the screenshot down */}
                  {!photo && <span aria-hidden className="proof-tape absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-4deg] rounded-[3px]" />}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.src} alt={it.alt} width={it.width} height={it.height} loading="lazy" draggable={false} className="block h-auto w-full rounded-[3px] border border-ink/15" />
                  <figcaption className="mt-3 flex items-center justify-between gap-3">
                    {photo ? <span className="font-display text-[1.05rem] font-semibold tracking-[-0.01em]">{copy.workshop}</span> : <span />}
                    <span className={`transition-colors ${isLiked ? "text-signal" : "text-ink/45"}`}>
                      <Heart className="size-5" filled={isLiked} />
                      <span className="sr-only">{isLiked ? copy.liked : copy.like}</span>
                    </span>
                  </figcaption>
                  {/* liked: a red heart badge on the top right */}
                  {isLiked && (
                    <span aria-hidden className="proof-badge absolute -top-3.5 -right-3.5 grid size-10 place-items-center rounded-full border-[2.5px] border-ink bg-signal text-white shadow-[3px_4px_0_0_rgba(0,0,0,0.55)]">
                      <Heart className="size-5" filled />
                    </span>
                  )}
                  {/* the double-tap moment: a big heart pops over the picture */}
                  {burst?.i === i && (
                    <span key={burst.k} aria-hidden className="proof-burst pointer-events-none absolute inset-0 grid place-items-center text-signal">
                      <Heart className="size-20 drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]" filled />
                    </span>
                  )}
                </figure>
              </li>
            );
          })}
        </ul>
        <p className="eyebrow mt-4 hidden text-mute-light lg:block">{dragHint}</p>
      </div>

      {/* the close view: the picture grows out of its card (on top of everything, header included) */}
      {item && createPortal(
        <div role="dialog" aria-modal="true" aria-label={item.alt} className="fixed inset-0 z-[70] grid place-items-center p-4 sm:p-10" onClick={close}>
          <div ref={shade} aria-hidden className="absolute inset-0 bg-ink/85 backdrop-blur-sm" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={big}
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            className="relative max-h-[86svh] w-auto max-w-full rounded-[10px] border-[3px] border-paper bg-white object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
            style={{ transformOrigin: "center" }}
          />
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            className="absolute top-5 right-5 flex items-center gap-2 rounded-full border border-paper/25 bg-ink/70 px-4 py-2 font-mono text-label tracking-[0.16em] text-paper uppercase transition-colors hover:border-signal hover:text-signal"
          >
            {copy.close}
            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
            </svg>
          </button>
        </div>,
        document.body,
      )}
    </section>
  );
}
