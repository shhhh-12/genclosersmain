import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { site } from "@/content/site";
import { listedCourses } from "@/content/courses";

type Props =
  | { variant?: "full" }
  /** Ad landing pages: logo + price + one CTA, no exits. */
  | { variant: "landing"; price: number; ctaLabel: string; ctaHref: string };

export function SiteHeader(props: Props) {
  const primary = listedCourses[0];
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-(--gutter) pt-4">
      <div className="pointer-events-auto mx-auto flex h-14 max-w-(--container-page) items-center justify-between gap-4 rounded-pill border border-ink-line/70 bg-ink/80 pr-1.5 pl-5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 text-paper" aria-label={`${site.name} home`}>
          <LogoMark className="h-6 w-auto text-signal" title="" />
          <span className={`font-display text-[1.0625rem] font-semibold tracking-[-0.02em] ${props.variant === "landing" ? "hidden min-[420px]:inline" : ""}`}>
            {site.name}
          </span>
        </Link>

        {props.variant === "landing" ? (
          <div className="flex items-center gap-4">
            <span className="hidden font-display text-[1.0625rem] font-medium text-mute-dark sm:inline">
              <Price amount={props.price} />
            </span>
            <ButtonLink href={props.ctaHref} size="md" className="h-11! px-5! whitespace-nowrap">
              {props.ctaLabel}
            </ButtonLink>
          </div>
        ) : (
          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-3">
            {site.nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-pill px-3 py-2 text-small font-medium text-mute-dark transition-colors duration-200 hover:text-paper"
              >
                {n.label}
              </Link>
            ))}
            {primary && (
              <ButtonLink href={`/courses/${primary.slug}#apply`} className="h-11! px-5! whitespace-nowrap">
                <span className="hidden sm:inline">{primary.ctaLabel}</span>
                <span className="sm:hidden">Apply</span>
              </ButtonLink>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
