import Link from "next/link";
import { Arrow } from "@/components/ui/Icons";
import { Price } from "@/components/ui/Price";
import { GlassPanel } from "@/components/ui/Glass";
import { SeatRow } from "@/components/ui/Seats";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollRead } from "@/components/motion/ScrollRead";
import { FriendStory } from "./FriendStory";
import { BeliefStrike } from "./BeliefStrike";
import { AudiencePolaroids } from "./AudiencePolaroids";
import { home } from "@/content/home";
import { listedCourses } from "@/content/courses";
import { emphasis } from "@/content/emphasis";
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
      scrollHint={home.story.scrollHint}
      skip={home.story.skip}
      idle={home.story.idle}
      night={home.story.night}
      about={{ heading: home.hero.heading, heavy: emphasis[home.hero.heading], body: home.hero.body, link: { href: `/courses/${listedCourses[0].slug}`, label: home.seeCourse } }}
    />
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
        <BeliefStrike items={home.beliefs} />
      </div>
    </section>
  );
}

export function Audience() {
  const a = home.audience;
  return (
    <section className="section-pad">
      <div className="mx-auto grid max-w-(--container-page) grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-4">
          <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] text-balance lg:sticky lg:top-28">
            <ScrollRead text={a.heading} />
          </h2>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <AudiencePolaroids items={a.items} sticker={a.sticker} dragHint={a.dragHint} />
        </div>
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
            {course.thumbnail && (
              <div className="mb-7 w-full max-w-[22rem] overflow-hidden rounded-2xl border border-paper/15 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.thumbnail.src}
                  alt={course.thumbnail.alt}
                  width={course.thumbnail.width}
                  height={course.thumbnail.height}
                  className="block h-auto w-full transition-transform duration-800 ease-primary group-hover:scale-[1.03]"
                />
              </div>
            )}
            <h3 className="font-display text-h1 font-semibold tracking-[-0.035em]">
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
