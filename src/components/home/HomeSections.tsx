import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Icons";
import { Price } from "@/components/ui/Price";
import { GlassPanel } from "@/components/ui/Glass";
import { SeatRow } from "@/components/ui/Seats";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollRead } from "@/components/motion/ScrollRead";
import { HeroWheel } from "./HeroWheel";
import { UrgencyStrip } from "@/components/course/Cta";
import { Countdown } from "@/components/course/Countdown";
import { batchFact } from "@/components/course/CourseSections";
import { home, introWords } from "@/content/home";
import { site } from "@/content/site";
import type { Course } from "@/content/types";

export function HomeHero({ course }: { course: Course }) {
  return (
    <HeroWheel words={introWords}>
      <div className="absolute inset-x-0 bottom-0 z-10 px-(--gutter) pb-8">
        <div className="mx-auto flex max-w-(--container-page) flex-wrap items-end justify-between gap-6">
          <p className="eyebrow flex items-center gap-3 text-mute-dark">
            <span className="h-px w-8 bg-signal" />
            {home.hero.eyebrow}
          </p>
          <ButtonLink href={`/courses/${course.slug}`} size="lg">
            {course.name}
          </ButtonLink>
        </div>
      </div>
    </HeroWheel>
  );
}

export function HomeAbout() {
  return (
    <section className="section-pad">
      <div className="mx-auto grid max-w-(--container-page) gap-10 md:grid-cols-12">
        <h2 className="font-display text-h1 font-semibold tracking-[-0.035em] text-balance md:col-span-8">
          <ScrollRead text={home.hero.heading} />
        </h2>
        <Reveal className="md:col-span-6 md:col-start-7" delay={0.1}>
          <p className="text-lead text-mute-dark">{home.hero.body}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function Beliefs() {
  return (
    <section className="on-paper section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <ol className="border-t border-ink">
          {home.beliefs.map((b, i) => (
            <Reveal
              as="li"
              key={b.title}
              className="group relative grid gap-3 border-b border-paper-line py-8 transition-colors duration-450 hover:bg-paper-2 md:grid-cols-12 md:items-baseline md:py-10"
            >
              <span className="absolute top-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-signal transition-transform duration-800 ease-primary group-hover:scale-x-100" />
              <span className="font-mono text-small text-signal md:col-span-1">0{i + 1}</span>
              <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] md:col-span-6">
                <ScrollRead text={b.title} />
              </h2>
              <p className="max-w-[34ch] text-lead text-mute-light md:col-span-4 md:col-start-9">{b.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Audience() {
  const a = home.audience;
  return (
    <section className="section-pad">
      <div className="mx-auto grid max-w-(--container-page) gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] text-balance md:sticky md:top-28">
            <ScrollRead text={a.heading} />
          </h2>
        </div>
        <ul className="md:col-span-7">
          {a.items.map((item) => (
            <Reveal as="li" key={item.title} className="group relative border-t border-ink-line py-6 last:border-b">
              <span className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-800 ease-primary group-hover:scale-x-100" />
              <div className="flex items-baseline gap-4">
                <span className="-translate-x-3 text-signal opacity-0 transition-[opacity,transform] duration-450 ease-primary group-hover:translate-x-0 group-hover:opacity-100">
                  <Arrow />
                </span>
                <div className="-ml-[1.2em] transition-transform duration-450 ease-primary group-hover:translate-x-[1.2em]">
                  <h3 className="font-display text-h3 font-semibold tracking-[-0.02em] transition-colors duration-450 group-hover:text-signal">{item.title}</h3>
                  <p className="mt-2 max-w-[44ch] text-mute-dark">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CoursesBlock({ courses }: { courses: Course[] }) {
  return (
    <section id="courses" className="section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">
            <ScrollRead text={home.coursesHeading} />
          </h2>
          <Link href="/courses" className="eyebrow text-mute-dark transition-colors hover:text-signal">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </Link>
        </div>
        <div className="mt-10 space-y-6">
          {courses.map((c) => (
            <CourseFeature key={c.slug} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CourseFeature({ course }: { course: Course }) {
  return (
    <Reveal>
      <GlassPanel className="group transition-transform duration-800 ease-primary hover:-translate-y-1">
        <article className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-paper/80">{course.eyebrow}</p>
            <h3 className="mt-4 font-display text-h1 font-semibold tracking-[-0.035em]">
              <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                {course.name}
              </Link>
            </h3>
            <p className="mt-4 max-w-[44ch] text-paper/80">{course.subheading}</p>
          </div>
          <div className="space-y-7 lg:col-span-5">
            <SeatRow label={site.ui.seatsLabel} />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-paper/15 pt-6">
              {course.facts.map((f) => (
                <div key={f.label}>
                  <dt className="eyebrow text-paper/60">{f.label}</dt>
                  <dd className="mt-1 font-display font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center justify-between gap-6 border-t border-paper/15 pt-6">
              <Price amount={course.price.amount} className="font-display text-h3 font-semibold" />
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-pill bg-paper text-ink transition-[transform,background-color,color] duration-450 ease-primary group-hover:translate-x-1 group-hover:bg-signal group-hover:text-signal-ink">
                <Arrow />
              </span>
            </div>
          </div>
        </article>
      </GlassPanel>
    </Reveal>
  );
}

export function FinalBand({ course }: { course: Course }) {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="mx-auto max-w-(--container-page)">
        <p className="font-display text-mega font-semibold tracking-[-0.045em] text-balance">
          <ScrollRead text={course.tagline} />
        </p>
        <div className="mt-12">
          <Countdown startsAt={course.startsAt} label={batchFact(course).label} dateLabel={batchFact(course).date} size="compact" />
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-end">
          <SeatRow label={site.ui.seatsLabel} />
          <div className="max-w-xl">
            <UrgencyStrip text={course.urgency} />
            <ButtonLink href={`/courses/${course.slug}#apply`} size="lg" className="mt-6">
              {course.ctaLabel}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
