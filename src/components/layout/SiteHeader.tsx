import { NavLink } from "./NavLink";
import { BrandLink } from "./BrandLink";
import { site } from "@/content/site";

type Props = {
  /** "landing" = ad landing pages: logo only, no exits but home. */
  variant?: "full" | "landing";
};

/** Calm header: logo (always home) and Courses. Booking lives in the page and the bottom bar, not here. */
export function SiteHeader({ variant = "full" }: Props) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-(--gutter) pt-4">
      <div className="pointer-events-auto relative mx-auto flex h-14 max-w-(--container-page) items-center justify-between gap-4 pr-2 pl-5">
        {/* The bar itself, on its own layer behind the logo and links */}
        <span
          aria-hidden
          data-header-pill
          className="absolute inset-0 -z-10 rounded-pill border border-ink-line/70 bg-ink/80 backdrop-blur-md"
        />
        <BrandLink />
        {variant === "full" && (
          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-3">
            {site.nav.map((n) => (
              <NavLink
                key={n.href}
                href={n.href}
                label={n.label}
                className="rounded-pill px-4 py-2 text-small font-medium text-mute-dark transition-colors duration-200 hover:text-paper"
              />
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
