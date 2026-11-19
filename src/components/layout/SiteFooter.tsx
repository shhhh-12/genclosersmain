import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Instagram, Mail, WhatsApp } from "@/components/ui/Icons";
import { site } from "@/content/site";
import { listedCourses } from "@/content/courses";

export function SiteFooter({ minimal = false }: { minimal?: boolean }) {
  return (
    <footer className="border-t border-ink-line px-(--gutter) pt-16 pb-10">
      <div className="mx-auto grid max-w-(--container-page) gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <LogoMark className="h-12 w-auto text-signal" title={site.name} />
          <p className="mt-6 max-w-[22ch] font-display text-h3 font-semibold tracking-[-0.02em]">{site.footerLine}</p>
        </div>

        {!minimal && (
          <div>
            <p className="eyebrow text-mute-dark">{site.footer.explore}</p>
            <ul className="mt-3">
              {listedCourses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className="inline-flex min-h-11 items-center text-paper transition-colors hover:text-signal">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/courses" className="inline-flex min-h-11 items-center text-paper transition-colors hover:text-signal">
                  {site.footer.allCourses}
                </Link>
              </li>
              <li>
                <Link href={site.footer.about.href} className="inline-flex min-h-11 items-center text-paper transition-colors hover:text-signal">
                  {site.footer.about.label}
                </Link>
              </li>
            </ul>
          </div>
        )}

        <div className={minimal ? "md:col-start-3" : ""}>
          <p className="eyebrow text-mute-dark">Contact</p>
          <a
            href={site.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex min-h-11 items-center gap-2 text-paper transition-colors hover:text-signal"
          >
            <WhatsApp /> {site.whatsapp.display}
          </a>
          <a href={`mailto:${site.email}`} className="flex min-h-11 items-center gap-2 text-paper transition-colors hover:text-signal">
            <Mail /> {site.email}
          </a>
          <a href={site.instagram.link} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 text-paper transition-colors hover:text-signal">
            <Instagram /> {site.instagram.handle}
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
              <Link href={l.href} className="inline-flex min-h-11 items-center transition-colors hover:text-paper">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
