import type { ReactNode } from "react";

/**
 * Slow red fluid: three soft red pools drifting on their own loops.
 * Transform-only animation; pauses for reduced motion (global rule).
 */
export function RedFluid({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`red-fluid pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <span className="red-fluid-a" />
      <span className="red-fluid-b" />
      <span className="red-fluid-c" />
    </div>
  );
}

/** Frosted glass panel sitting over red fluid. */
export function GlassPanel({
  children,
  className = "",
  tone = "dark",
  fast = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
  /** Livelier fluid (about twice the speed). */
  fast?: boolean;
}) {
  return (
    <div className={`relative isolate overflow-hidden rounded-soft ${className}`}>
      <RedFluid className={fast ? "red-fluid-fast" : ""} />
      <div className={`glass relative h-full ${tone === "light" ? "glass-light" : ""}`}>{children}</div>
    </div>
  );
}
