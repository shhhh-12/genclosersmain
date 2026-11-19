import Link from "next/link";
import { Arrow, Play, Rupee, WhatsApp } from "@/components/ui/Icons";
import { about } from "@/content/about";
import { LogoMark } from "@/components/brand/LogoMark";
import { IndiaDots } from "./IndiaDots";
import { CountUp } from "./CountUp";
import { BrandMarquee } from "./BrandMarquee";
import { ServicesCall } from "./ServicesCall";
import { ProofWall } from "./ProofWall";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollRead } from "@/components/motion/ScrollRead";
import { FriendStory } from "./FriendStory";
import { BeliefStrike } from "./BeliefStrike";
import { AudiencePolaroids } from "./AudiencePolaroids";
import { home } from "@/content/home";
import { listedCourses } from "@/content/courses";
import { site } from "@/content/site";
import type { Course } from "@/content/types";

export function HomeHero() {
  // The story, on every screen size (phones get a closer frame; owner 2026-11-10).
  return (
    <FriendStory
      lines={home.story.lines}
      bubbles={home.story.bubbles}
      rewind={home.story.rewind}
      coffee={home.story.coffee}
      eyebrows={home.story.eyebrows}
      lead={home.lead}
      seat={home.story.seat}
      card={home.story.card}
      night={home.story.night}
      reveal={
        <div className="rounded-t-[2rem] border-t border-ink-line bg-ink">
          <CoursesBlock courses={listedCourses} copy />
        </div>
      }
    />
  );
}

/**
 * The India scene, one screen (owner 2026-11-19): the heading and the paragraph read themselves, the
 * map turns red from Tamil Nadu and the founders' numbers count up, all with the same scroll while
 * the screen holds (desktop). Phones and short screens: the same pieces in a normal scroll.
 */
export function Proof() {
  const pr = home.proof;
  return (
    <section className="section-pad relative flex min-h-svh flex-col justify-center gap-10 pt-24 pb-8 sm:pt-28 lg:gap-8">
      <div className="mx-auto grid w-full max-w-(--container-page) items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-7">
          <h1 className="font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
            <ScrollRead text={pr.heading} keep={pr.keep} scene={[0, 0.4]} soft />
          </h1>
          <p className="mt-6 max-w-[48ch] text-lead text-mute-dark">
            <ScrollRead text={pr.body} scene={[0.3, 0.85]} soft />
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/courses/${listedCourses[0].slug}`}
              className="group inline-flex items-center gap-3 rounded-pill bg-signal px-7 py-3.5 font-display text-[1.125rem] font-semibold text-signal-ink shadow-[0_14px_40px_-14px_rgb(227_16_27/0.7)] transition-[background-color,transform] duration-450 ease-primary hover:-translate-y-0.5 hover:bg-signal-deep"
            >
              {home.seeCourse}
              <span className="transition-transform duration-450 ease-primary group-hover:translate-x-1">
                <Arrow />
              </span>
            </Link>
            {/* for businesses (owner 2026-11-19, from the sample's two hero buttons): the course stays the main one */}
            <a
              href={site.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-pill border border-paper/25 px-7 py-3.5 font-display text-[1.125rem] font-semibold text-paper transition-colors duration-450 hover:border-signal hover:text-signal"
            >
              <WhatsApp /> {home.closing.work}
            </a>
          </div>
        </div>
        <IndiaDots label={pr.mapLabel} className="mx-auto w-full max-w-[26rem] lg:col-span-5" />
      </div>
      {/* the numbers, as a band at the foot of the same screen */}
      <NumbersBand />
      {/* desktop, while the screen holds: how to move on (fades once India is red) */}
      <p aria-hidden className="dots-cue pointer-events-none absolute top-28 right-(--gutter) hidden flex-col items-center gap-2 font-mono text-label tracking-[0.2em] text-mute-dark uppercase [@media(min-width:1024px)_and_(min-height:700px)]:flex">
        <svg viewBox="0 0 24 36" className="h-8 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1.5" y="1.5" width="21" height="33" rx="10.5" />
          <circle className="dots-cue-wheel" cx="12" cy="10" r="2.2" fill="currentColor" stroke="none" />
        </svg>
        {home.proof.scrollCue}
      </p>
    </section>
  );
}

/** The founders' numbers as a band (count up in view): the foot of the India screen, and the About hero. */
export function NumbersBand() {
  const pr = home.proof;
  return (
    <dl className="mx-auto grid w-full max-w-(--container-page) grid-cols-2 border-y border-ink-line sm:grid-cols-3">
      {pr.stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col-reverse justify-end py-6 ${
            i === 0 ? "col-span-2 sm:col-span-1 sm:pr-8" : i === 1 ? "border-t border-ink-line pr-4 sm:border-t-0 sm:border-l sm:px-8" : "border-t border-l border-ink-line pl-5 sm:border-t-0 sm:px-8"
          }`}
        >
          <dt className="mt-2 max-w-[24ch] text-small text-mute-dark">{s.label}</dt>
          <dd className="font-display text-[clamp(2.5rem,4.2vw,4rem)] leading-[0.9] font-bold tracking-[-0.045em] whitespace-nowrap">
            {s.rupee && (
              <>
                <span className="sr-only">₹</span>
                <Rupee className="mr-[0.04em] inline-block h-[0.72em] w-auto align-[0.02em] text-signal" />
              </>
            )}
            <CountUp to={s.value} suffix={s.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The brand names as their own band: it divides the India scene from "Who it's for". */
export function BrandStrip() {
  const pr = home.proof;
  return (
    <section aria-label={pr.brandsLabel} className="brand-strip border-y border-ink-line px-(--gutter) py-8">
      <div className="mx-auto max-w-(--container-page)">
        <BrandMarquee brands={pr.brands} compact />
      </div>
    </section>
  );
}

/** What we believe: the About heading on top, the three strike beliefs under it (owner 2026-11-19: merged). */
export function Beliefs() {
  return (
    <section className="on-paper section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <h2 className="mb-12 max-w-[20ch] font-display text-h2 font-semibold tracking-[-0.03em] text-balance md:mb-16">
          <ScrollRead text={home.hero.heading} />
        </h2>
        <BeliefStrike items={home.beliefs} />
      </div>
    </section>
  );
}

export function Audience() {
  const a = home.audience;
  return (
    <section className="on-paper section-pad">
      {/* the line above it all (owner 2026-11-19) */}
      <figure className="mx-auto mb-10 max-w-(--container-page) border-b border-paper-line pb-10 lg:mb-14 lg:pb-14">
        <blockquote className="max-w-[20ch] font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
          <span aria-hidden>&ldquo;</span>
          <ScrollRead text={a.quote} />
          <span aria-hidden>&rdquo;</span>
        </blockquote>
      </figure>
      {/* the heading and the polaroids hold together for about one scroll while the cards land (owner 2026-11-19) */}
      <div data-aud-scene>
      <div className="aud-stage mx-auto grid max-w-(--container-page) grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <div className="aud-inner lg:sticky lg:top-28">
            <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] text-balance">
              <ScrollRead text={a.heading} />
            </h2>
            <p className="mt-6 max-w-[32ch] text-lead text-mute-light">{a.sub}</p>
            {/* two ways on (owner 2026-11-19) */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="group inline-flex items-center gap-2.5 rounded-pill bg-signal px-6 py-3 font-display font-semibold text-signal-ink transition-colors duration-450 hover:bg-signal-deep">
                {a.cta.courses}
                <span className="transition-transform duration-450 ease-primary group-hover:translate-x-1">
                  <Arrow />
                </span>
              </Link>
              <a href={site.whatsapp.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded-pill border border-ink/25 px-6 py-3 font-display font-semibold text-ink transition-colors duration-450 hover:border-signal hover:text-signal">
                <WhatsApp /> {a.cta.work}
              </a>
            </div>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <AudiencePolaroids items={a.items} sticker={a.sticker} dragHint={a.dragHint} />
        </div>
      </div>
      <div aria-hidden className="aud-spacer" />
      </div>
    </section>
  );
}

export function CoursesBlock({ courses, copy = false }: { courses: Course[]; /** the story's curtain shows a copy: no id */ copy?: boolean }) {
  return (
    <section id={copy ? undefined : "courses"} className="section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">
            <ScrollRead text={home.coursesHeading} still />
          </h2>
          <Link href="/courses" className="eyebrow text-mute-dark transition-colors hover:text-signal">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </Link>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseFeature key={c.slug} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * A course as a video thumbnail (owner 2026-11-19: minimal, like a YouTube card): the picture with a
 * length badge, then the name and one quiet line. Everything else lives on the course page.
 */
export function CourseFeature({ course, showPrice = false }: { course: Course; showPrice?: boolean }) {
  const fact = (label: string) => course.facts.find((f) => f.label === label)?.value;
  const length = fact("Length")?.split(",")[0];
  const meta = [site.name, fact("Language"), fact("Next batch") && `Next batch ${fact("Next batch")}`].filter(Boolean).join(" · ");
  return (
    <Reveal>
      <Link href={`/courses/${course.slug}`} className="group block focus-visible:outline-none">
        <div className="relative overflow-hidden rounded-2xl border border-ink-line bg-ink-2 shadow-[0_18px_40px_-22px_rgb(0_0_0/0.7)] transition-[border-color] duration-450 group-hover:border-paper/25 group-focus-visible:border-signal">
          {course.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail.src}
              alt={course.thumbnail.alt}
              width={course.thumbnail.width}
              height={course.thumbnail.height}
              className="block h-auto w-full transition-transform duration-800 ease-primary group-hover:scale-[1.04]"
            />
          )}
          {/* play: appears on hover, like a video */}
          <span aria-hidden className="absolute inset-0 grid place-items-center bg-ink/0 transition-colors duration-450 group-hover:bg-ink/25">
            <span className="grid size-14 scale-75 place-items-center rounded-full bg-signal text-signal-ink opacity-0 transition-[opacity,scale] duration-450 ease-primary group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-0.5 size-5" />
            </span>
          </span>
          {length && (
            <span className="absolute right-2.5 bottom-2.5 rounded-md bg-ink/85 px-2 py-0.5 font-mono text-label tracking-[0.06em] text-paper">{length}</span>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <span aria-hidden className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-paper">
            <LogoMark className="h-4 w-auto text-signal" title="" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-h3 leading-tight font-semibold tracking-[-0.02em] transition-colors group-hover:text-signal">{course.name}</h3>
            <p className="mt-1 text-small text-mute-dark">{meta}</p>
            {showPrice && (
              <p className="mt-0.5 text-small text-mute-dark">
                <Price amount={course.price.amount} className="text-paper/85" />
              </p>
            )}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/** The people behind it, short: photo, name, role, one line each, and a link to the full story. */
export function People() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[16ch] font-display text-h2 font-semibold tracking-[-0.03em] text-balance">
            <ScrollRead text={about.foundersHeading} still />
          </h2>
          <Link href="/about" className="group inline-flex items-center gap-3 font-display text-[1.125rem] font-medium text-paper">
            <span className="border-b border-paper/30 pb-0.5 transition-colors group-hover:border-signal group-hover:text-signal">{home.people.link}</span>
            <span className="text-signal transition-transform duration-450 ease-primary group-hover:translate-x-1">
              <Arrow />
            </span>
          </Link>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
          {about.founders.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.07} className={`flex gap-5 border-t border-ink-line pt-6 ${i === 1 ? "md:mt-12" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.photo.src} alt={f.name} width={f.photo.width} height={f.photo.height} loading="lazy" className="size-24 shrink-0 rounded-2xl border border-ink-line object-cover object-top grayscale sm:size-28" />
              <div className="min-w-0">
                <h3 className="font-display text-h3 font-semibold tracking-[-0.02em]">{f.name}</h3>
                {f.knownAs && <p className="mt-1 font-display text-small font-semibold text-signal">{f.knownAs}</p>}
                <p className="mt-2 text-small text-mute-dark">{f.role}</p>
                <p className="mt-3 text-paper/85">{f.highlight}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing band: one line and the two ways on. */
export function Closing({ dark = false }: { /** on ink (About page, to keep black / white alternating) */ dark?: boolean }) {
  const c = home.closing;
  return (
    <section className={`section-pad ${dark ? "border-t border-ink-line" : "on-paper"}`}>
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-[14ch] font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
          <ScrollRead text={c.heading} />
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/courses/${listedCourses[0].slug}`} className="group inline-flex items-center gap-2.5 rounded-pill bg-signal px-7 py-3.5 font-display text-[1.125rem] font-semibold text-signal-ink transition-colors duration-450 hover:bg-signal-deep">
            {c.course}
            <span className="transition-transform duration-450 ease-primary group-hover:translate-x-1">
              <Arrow />
            </span>
          </Link>
          <a href={site.whatsapp.link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2.5 rounded-pill border px-7 py-3.5 font-display text-[1.125rem] font-semibold transition-colors duration-450 hover:border-signal hover:text-signal ${dark ? "border-paper/25 text-paper" : "border-ink/25 text-ink"}`}>
            <WhatsApp /> {c.work}
          </a>
        </div>
      </div>
    </section>
  );
}

/** What we do: the statement, then Train / Consult / Done for you as clicky tabs (components/home/ServicesCall.tsx). */
export function Services() {
  const sv = home.services;
  const course = listedCourses[0];
  return (
    <ServicesCall
      statement={sv.statement}
      keep={sv.statementKeep}
      heading={sv.heading}
      ask={sv.ask}
      lanes={sv.lanes}
      items={sv.items.map((it) => ({
        label: it.label,
        title: it.title || course.name,
        body: it.body,
        you: it.you,
        us: it.us,
        line: it.line,
        link: it.link,
        href: it.key === "course" ? `/courses/${course.slug}` : site.whatsapp.link,
        external: it.key !== "course",
      }))}
    />
  );
}

/** "Why we do this.": the real proof as polaroids (components/home/ProofWall.tsx). */
export function Proofs() {
  const pw = home.proofWall;
  return <ProofWall heading={pw.heading} sub={pw.sub} dragHint={pw.dragHint} youtube={pw.youtube} instagram={pw.instagram} copy={pw.copy} items={pw.items.map((it) => ({ ...it, kind: it.kind as "photo" | "message" }))} />;
}
