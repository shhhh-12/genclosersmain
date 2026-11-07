import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { WhatsApp } from "@/components/ui/Icons";
import { site } from "@/content/site";
import { listedCourses } from "@/content/courses";

export function SiteFooter({ minimal = false }: { minimal?: boolean }) {
  return (
    <footer className="border-t border-ink-line px-(--gutter) pt-16 pb-10">
      <div className="mx-auto grid max-w-(--container-page) gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <LogoMark className="h-12 w-auto text-signal" title={site.name} />
          <p className="mt-6 max-w-[22ch] font-display text-h3 font-semibold tracking-[-0.02em]">{site.tagline}</p>
        </div>

        {!minimal && (
          <div>
            <p className="eyebrow text-mute-dark">Courses</p>
            <ul className="mt-4 space-y-2">
              {listedCourses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className="text-paper transition-colors hover:text-signal">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={minimal ? "md:col-start-3" : ""}>
          <p className="eyebrow text-mute-dark">Contact</p>
          <a
            href={site.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-paper transition-colors hover:text-signal"
          >
            <WhatsApp /> {site.whatsapp.display}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-(--container-page) flex-col gap-4 border-t border-ink-line pt-6 text-small text-mute-dark sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {site.copyrightYear} {site.name}
        </p>
        <ul className="flex gap-6">
          {site.footer.legal.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-paper">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
