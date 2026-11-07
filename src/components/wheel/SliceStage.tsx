import type { ReactNode, Ref } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { WHEEL } from "@/lib/wheel";

/**
 * The arrow-slice effect, reusable. Renders `children` twice (top half and bottom half,
 * clipped along a horizontal cut line), plus the glowing slit and the flying arrow (blade).
 * Both halves are solid black (like the intro), so whatever sits underneath stays hidden
 * until the halves peel away, and is then revealed with a dolly zoom.
 * Children are placed by the caller with `left: var(--sx); top: var(--sy)` (set by layoutSlice).
 * Animated with addSlice() from lib/slice.ts.
 */
export function SliceStage({ stageRef, children }: { stageRef?: Ref<HTMLDivElement>; children: ReactNode }) {
  return (
    <div ref={stageRef} aria-hidden className="slice-stage pointer-events-none absolute inset-0 z-10 opacity-0">
      <div className="slice-dolly absolute inset-0 [perspective:1400px]">
        <div className="slice-top absolute inset-0 bg-black will-change-transform">{children}</div>
        <div className="slice-bottom absolute inset-0 bg-black will-change-transform">{children}</div>
      </div>
      <div className="slice-slit absolute left-0 h-[2px] w-full origin-left -translate-y-1/2 scale-x-0 bg-white shadow-[0_0_22px_3px_#ff0000,0_0_3px_1px_#fff]" />
      <div className="slice-blade absolute opacity-0" style={{ width: `${WHEEL.arrowWidthEm}em` }}>
        <span className="block -translate-y-1/2 drop-shadow-[0_0_14px_#ff0000]" style={{ color: WHEEL.redHex }}>
          <LogoMark className="block h-[0.72em] w-auto" title="" />
        </span>
      </div>
    </div>
  );
}
