import type { Ref } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { WHEEL } from "@/lib/wheel";

/** Mark + letters, no positioning. Shared by the in-wheel lockup and the slice copies. */
export function LockupInner({ text = "GENCLOSERS" }: { text?: string }) {
  return (
    <>
      <span className="brand-logo block h-[0.72em]" style={{ width: `${WHEEL.arrowWidthEm}em` }}>
        <LogoMark className="h-full w-auto" title="" />
      </span>
      <span className="brand-text ml-[0.27em] block text-[0.62em] font-bold tracking-[0.01em] whitespace-nowrap sm:text-[0.8em]">{text}</span>
    </>
  );
}

/**
 * GenClosers mark + GENCLOSERS, sized to sit in a WheelScene: the mark takes the arrow's slot,
 * the letters start where the active word starts. Moved to the centre / zoomed by the hero and journey.
 */
export function BrandLockup({ lockRef, text = "GENCLOSERS" }: { lockRef?: Ref<HTMLDivElement>; text?: string }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: `${WHEEL.arrowLeftEm}em`, top: "var(--cap-off, 0px)", transform: "translateY(-50%)", color: WHEEL.redHex }}
    >
      <div ref={lockRef} className="brand-lock flex origin-center items-center font-display leading-none font-bold opacity-0 will-change-transform">
        <LockupInner text={text} />
      </div>
    </div>
  );
}

/** Horizontal distance that puts the lockup's centre on the centre of `frame`. */
export function centreOffset(lock: HTMLElement, frame: HTMLElement) {
  const prev = lock.style.transform;
  lock.style.transform = "none";
  const r = lock.getBoundingClientRect();
  lock.style.transform = prev;
  const f = frame.getBoundingClientRect();
  return f.left + f.width / 2 - (r.left + r.width / 2);
}
