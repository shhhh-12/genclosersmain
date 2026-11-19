import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollRead } from "@/components/motion/ScrollRead";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow, WhatsApp } from "@/components/ui/Icons";
import { about } from "@/content/about";
import { listedCourses } from "@/content/courses";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: about.title,
  description: about.body,
};

/** About: who we are, mission and vision, the two founders, and the ways on. */
export default function AboutPage() {
  const course = listedCourses[0];
  return (
    <>
      <SiteHeader />
      <main>
        {/* who we are */}
        <section className="px-(--gutter) pt-36 pb-(--section-y) sm:pt-44">
          <div className="mx-auto max-w-(--container-page)">
            <h1 className="max-w-[14ch] font-display text-mega leading-[0.95] font-semibold tracking-[-0.045em] text-balance">
              <ScrollRead text={about.heading} auto keep={about.keep} />
            </h1>
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-[52ch] text-lead text-mute-dark">{about.body}</p>
            </Reveal>
          </div>
        </section>

        {/* mission and vision: two short lists on paper */}
        <section className="on-paper section-pad">
          <div className="mx-auto grid max-w-(--container-page) gap-16 md:grid-cols-2 md:gap-12">
            {[about.mission, about.vision].map((block, bi) => (
              <div key={block.title} className={bi === 1 ? "md:pt-24" : ""}>
                <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">
                  <ScrollRead text={block.title} />
                </h2>
                <ol className="mt-8 space-y-6">
                  {block.items.map((item, i) => (
                    <Reveal key={item} as="li" delay={i * 0.07} className="flex gap-5 border-t border-paper-line pt-5">
                      <span className="pt-1 font-mono text-label text-signal">{String(i + 1).padStart(2, "0")}</span>
                      <span className="max-w-[40ch] text-lead text-ink">{item}</span>
                    </Reveal>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* the founders: two people, offset (not two equal boxes) */}
        <section className="section-pad">
          <div className="mx-auto max-w-(--container-page)">
            <h2 className="max-w-[16ch] font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
              <ScrollRead text={about.foundersHeading} />
            </h2>
            <div className="mt-16 grid gap-20 md:grid-cols-2 md:gap-12">
              {about.founders.map((f, fi) => (
                <Reveal key={f.name} className={fi === 1 ? "md:mt-32" : ""}>
                  <article>
                    <div className="w-full max-w-[20rem] overflow-hidden rounded-2xl border border-ink-line bg-ink-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.photo.src} alt={f.name} width={f.photo.width} height={f.photo.height} className="block aspect-[4/5] w-full object-cover object-top grayscale" />
                    </div>
                    <h3 className="mt-7 font-display text-h2 font-semibold tracking-[-0.03em]">{f.name}</h3>
                    {f.knownAs && <p className="mt-2 font-display text-[1.125rem] font-semibold text-signal">{f.knownAs}</p>}
                    <p className="mt-3 text-small text-mute-dark">{f.role}</p>
                    <ul className="mt-6 space-y-3 border-t border-ink-line pt-6">
                      {f.bio.map((line) => (
                        <li key={line} className="flex gap-3 text-paper/85">
                          <span className="mt-1.5 shrink-0 text-signal">
                            <Arrow className="h-3 w-3.5" />
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* the ways on */}
        <section className="section-pad border-t border-ink-line">
          <div className="mx-auto flex max-w-(--container-page) flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[16ch] font-display text-h2 font-semibold tracking-[-0.03em] text-balance">
              <ScrollRead text={about.next.heading} />
            </h2>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link href={`/courses/${course.slug}`} className="group inline-flex items-center gap-3 font-display text-[1.125rem] font-medium text-paper">
                <span className="border-b border-paper/30 pb-0.5 transition-colors group-hover:border-signal group-hover:text-signal">{about.next.course}</span>
                <span className="text-signal transition-transform duration-450 ease-primary group-hover:translate-x-1">
                  <Arrow />
                </span>
              </Link>
              <a href={site.whatsapp.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-display text-[1.125rem] font-medium text-paper transition-colors hover:text-signal">
                <WhatsApp /> {about.next.talk}
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
