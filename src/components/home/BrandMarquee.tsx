/**
 * The brand names our founders have worked with, running slowly from left to right in a loop
 * (CSS only: two copies of the list slide by half their width). Hover a name and it turns red; the
 * row keeps moving. Names are text, never logos.
 * Reduced motion: a still, wrapped row.
 */

export function BrandMarquee({ label, brands, compact = false }: { label?: string; brands: readonly string[]; compact?: boolean }) {
  const row = (copy: number) => (
    <ul aria-hidden={copy > 0 || undefined} className="brand-row flex shrink-0 items-center gap-x-12 pr-12 motion-reduce:flex-wrap motion-reduce:gap-y-3 motion-reduce:pr-0">
      {brands.map((b) => (
        <li key={b} className={`brand-name font-display ${compact ? "text-[clamp(1.25rem,1.9vw,1.6rem)]" : "text-h3"} font-semibold tracking-[-0.03em] whitespace-nowrap text-paper/55`}>
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
          {row(0)}
          {/* the second copy makes the loop seamless (hidden from screen readers and reduced motion) */}
          <div className="contents motion-reduce:hidden">{row(1)}</div>
        </div>
      </div>
    </div>
  );
}
