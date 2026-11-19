/**
 * The brand names our founders have worked with, running slowly from left to right in a loop
 * (CSS only: the track holds two identical halves and slides by half its width). Each half repeats
 * the names REPS times so it is wider than any screen; otherwise an empty edge slides into view.
 * Hover a name and it turns red; the row keeps moving. Names are text, never logos.
 * Reduced motion: one still, wrapped row. Screen readers get the names once.
 */

const REPS = 4; // 5 names are about 900px wide; four of them cover wide screens

export function BrandMarquee({ label, brands, compact = false }: { label?: string; brands: readonly string[]; compact?: boolean }) {
  const half = (h: number) => (
    <ul aria-hidden={h > 0 || undefined} className={`brand-row flex shrink-0 items-center gap-x-12 pr-12 motion-reduce:flex-wrap motion-reduce:gap-y-3 motion-reduce:pr-0 ${h > 0 ? "motion-reduce:hidden" : ""}`}>
      {Array.from({ length: REPS }, () => brands)
        .flat()
        .map((b, i) => (
          <li
            key={i}
            aria-hidden={i >= brands.length || undefined}
            className={`brand-name font-display ${compact ? "text-[clamp(1.25rem,1.9vw,1.6rem)]" : "text-h3"} font-semibold tracking-[-0.03em] whitespace-nowrap text-paper/55 ${i >= brands.length ? "motion-reduce:hidden" : ""}`}
          >
            {b}
          </li>
        ))}
    </ul>
  );
  return (
    <div>
      {label && <p className="text-small text-mute-dark">{label}</p>}
      <div className={`brand-marquee ${label ? "mt-4" : ""} overflow-hidden motion-reduce:overflow-visible`}>
        <div className="brand-track flex w-max motion-reduce:w-auto">
          {half(0)}
          {half(1)}
        </div>
      </div>
    </div>
  );
}
