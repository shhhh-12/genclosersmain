import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollRead } from "@/components/motion/ScrollRead";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Icons";
import { Closing } from "@/components/home/HomeSections";
import { Develop } from "@/components/about/Develop";
import { AboutRoom } from "@/components/about/AboutRoom";
import { about } from "@/content/about";
import { home } from "@/content/home";

export const metadata: Metadata = {
  title: about.title,
  description: about.body,
};

/**
 * About (owner 2026-11-19, from the audit in docs/about-audit-2026-11-19.md). Sections alternate
 * black / white: hero with the workshop photo (black) -> Mission and Vision as
 * today -> tomorrow pairs (white) -> the founders, big polaroids that develop (black) -> In the room
 * (white) -> the home closing band (black).
 */
export default function AboutPage() {
  const proof = home.proofWall;
  return (
    <>
      <SiteHeader />
      <main>
        {/* who we are: the vision line and the room it happens in (owner 2026-11-19: no numbers band here) */}
        <section className="px-(--gutter) pt-32 pb-(--section-y) sm:pt-40">
          <div className="mx-auto grid max-w-(--container-page) items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-7">
              <h1 className="font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
                <ScrollRead text={about.heading} auto keep={about.keep} />
              </h1>
              <Reveal delay={0.15}>
                <p className="mt-8 max-w-[48ch] text-lead text-mute-dark">{about.body}</p>
              </Reveal>
            </div>
            <Reveal delay={0.25} className="lg:col-span-5">
              <figure className="mx-auto w-full max-w-[30rem] rotate-[3deg] rounded-[6px] border-[2.5px] border-ink bg-white p-3 pb-4 text-ink shadow-[10px_12px_0_0_rgba(0,0,0,0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={about.photo.src} alt={about.photo.alt} width={about.photo.width} height={about.photo.height} className="block h-auto w-full rounded-[3px]" />
                <figcaption className="mt-3 font-display text-[length:max(0.875rem,calc(1.1rem*var(--type-scale)))] font-semibold tracking-[-0.01em]">{about.photo.caption}</figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* mission = today, vision = tomorrow: three pairs, a red line draws across each as it scrolls in */}
        <section className="on-paper section-pad">
          <div className="mx-auto max-w-(--container-page)">
            <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">
              <ScrollRead text={about.pairsHeading} />
            </h2>
            <div aria-hidden className="mt-12 hidden grid-cols-[1fr_7rem_1fr] gap-6 border-b border-paper-line pb-4 md:grid">
              <p className="font-display text-[length:max(0.875rem,calc(1.25rem*var(--type-scale)))] font-semibold">
                {about.mission.title} <span className="text-mute-light">· {about.today}</span>
              </p>
              <span />
              <p className="font-display text-[length:max(0.875rem,calc(1.25rem*var(--type-scale)))] font-semibold">
                {about.vision.title} <span className="text-mute-light">· {about.tomorrow}</span>
              </p>
            </div>
            <ol className="mt-8 md:mt-0">
              {about.pairs.map(([m, v], i) => (
                <li key={i} className="pair grid gap-4 border-b border-paper-line py-8 md:grid-cols-[1fr_7rem_1fr] md:items-center md:gap-6 md:py-10">
                  <div>
                    <p className="font-display text-[length:max(0.875rem,calc(1rem*var(--type-scale)))] font-semibold text-mute-light md:hidden">
                      {about.mission.title} · {about.today}
                    </p>
                    <p className="mt-1 max-w-[34ch] text-lead text-ink md:mt-0">{about.mission.items[m]}</p>
                  </div>
                  {/* the line from today to tomorrow (down on phones, across on desktop) */}
                  <span aria-hidden className="pair-line flex items-center text-signal md:h-6">
                    <span className="pair-stroke block h-10 w-[2px] bg-signal md:h-[2px] md:w-full" />
                    <span className="pair-head hidden md:block">
                      <Arrow className="h-3.5 w-4" />
                    </span>
                  </span>
                  <div>
                    <p className="font-display text-[length:max(0.875rem,calc(1rem*var(--type-scale)))] font-semibold text-mute-light md:hidden">
                      {about.vision.title} · {about.tomorrow}
                    </p>
                    <p className="mt-1 max-w-[34ch] font-display text-[length:max(0.875rem,calc(clamp(1.35rem,1rem+1vw,1.75rem)*var(--type-scale)))] leading-snug font-semibold tracking-[-0.02em] text-ink md:mt-0">
                      {about.vision.items[v]}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* the founders: one row each, photo sides swapped, every line level */}
        <section className="section-pad">
          <div className="mx-auto max-w-(--container-page)">
            <h2 className="max-w-[16ch] font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
              <ScrollRead text={about.foundersHeading} />
            </h2>
            <div className="mt-16 space-y-20 md:space-y-28">
              {about.founders.map((f, fi) => (
                <article key={f.name} className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
                  <Develop className={`md:col-span-5 ${fi % 2 ? "md:order-2" : ""}`}>
                    <figure className={`relative mx-auto w-full max-w-[24rem] rounded-[6px] border-[2.5px] border-ink bg-white p-3 pb-10 shadow-[10px_12px_0_0_rgba(0,0,0,0.6)] ${fi % 2 ? "rotate-[2.5deg]" : "-rotate-[2.5deg]"}`}>
                      <div className="develop-photo overflow-hidden rounded-[3px] bg-paper-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.photo.src} alt={f.name} width={f.photo.width} height={f.photo.height} className="block aspect-square w-full object-cover object-top" />
                      </div>
                      {f.knownAs && (
                        <span className="absolute -top-6 -right-6 grid size-[5.5rem] rotate-[12deg] place-items-center rounded-full border-[2.5px] border-ink bg-signal-deep p-2 text-center font-display text-[length:max(0.875rem,calc(0.95rem*var(--type-scale)))] leading-[1.12] font-bold text-signal-ink">
                          {f.knownAs}
                        </span>
                      )}
                    </figure>
                  </Develop>
                  <div className={`min-w-0 md:col-span-7 ${fi % 2 ? "md:order-1" : ""}`}>
                    <h3 className="font-display text-h2 font-semibold tracking-[-0.03em]">{f.name}</h3>
                    <p className="mt-3 text-mute-dark">{f.role}</p>
                    <ul aria-label="Companies" className="mt-6 flex flex-wrap gap-2">
                      {f.brands.map((b) => (
                        <li key={b} className="rounded-pill border border-ink-line bg-ink-2 px-3.5 py-1.5 font-display text-small font-semibold text-paper/90">
                          {b}
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-7 space-y-3 border-t border-ink-line pt-6">
                      {f.bio.map((line) => (
                        <li key={line} className="flex gap-3 text-paper/85">
                          <span className="mt-1.5 shrink-0 text-signal">
                            <Arrow className="h-3 w-3.5" />
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* in the room: the workshops and what people wrote */}
        <section className="on-paper section-pad">
          <div className="mx-auto max-w-(--container-page)">
            <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">
              <ScrollRead text={about.room.heading} />
            </h2>
            <div className="mt-12">
              <AboutRoom items={about.room.items.map((i) => proof.items[i])} workshop={proof.copy.workshop} dragHint={proof.dragHint} />
            </div>
          </div>
        </section>

        <Closing dark />
      </main>
      <SiteFooter />
    </>
  );
}
