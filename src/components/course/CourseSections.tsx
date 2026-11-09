import { Reveal } from "@/components/motion/Reveal";
import { ScrollRead } from "@/components/motion/ScrollRead";
import { VslPlayer } from "@/components/media/VslPlayer";
import { LoopBand } from "@/components/media/LoopVideo";
import { AccordionItem } from "@/components/ui/Accordion";
import { Price } from "@/components/ui/Price";
import { Txt } from "@/components/ui/Text";
import { GlassPanel } from "@/components/ui/Glass";
import { SeatRow } from "@/components/ui/Seats";
import { DotField } from "@/components/ui/DotField";
import { UrgencyStrip } from "./Cta";
import { TestimonialRow } from "./Testimonials";
import { ApplyForm } from "./ApplyForm";
import { Countdown } from "./Countdown";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { applicationForm } from "@/content/form";
import type { Course } from "@/content/types";

const n2 = (i: number) => String(i).padStart(2, "0");

/** Red line that sweeps in along the top edge of a row on hover (parent needs `group relative`). */
function HoverLine({ tone = "signal" }: { tone?: "signal" }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-0 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-800 ease-primary group-hover:scale-x-100 ${
        tone === "signal" ? "bg-signal" : ""
      }`}
    />
  );
}

export function CourseHero({ course }: { course: Course }) {
  return (
    <section className="px-(--gutter) pt-28 pb-(--section-y) sm:pt-36">
      <div className="mx-auto max-w-(--container-page)">
        <h1 className="max-w-[17ch] font-display text-h1 font-semibold tracking-[-0.035em] text-balance">
          <ScrollRead text={course.heading} auto keep={course.headingKeep} />
        </h1>

        {/* VSL right under the headline */}
        <Reveal className="mt-16 sm:mt-24" delay={0.15}>
          <VslPlayer media={course.vsl.video} soundLabel={site.ui.watchWithSound} />
        </Reveal>

        <div className="mt-16 grid gap-10 sm:mt-24 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <p className="max-w-[44ch] text-lead text-mute-dark">{course.subheading}</p>
            <SeatRow label={site.ui.seatsLabel} className="mt-8" />
          </Reveal>
          <Reveal className="md:col-span-5 md:col-start-8" delay={0.1}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {course.facts.map((f) => (
                <div key={f.label} className="group relative border-t border-ink-line pt-3">
                  <HoverLine />
                  <dt className="eyebrow text-mute-dark transition-colors group-hover:text-signal">{f.label}</dt>
                  <dd className="mt-1 font-display font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Label + date for the countdown, taken from the course facts ("Next batch"). */
export function batchFact(course: Course) {
  const f = course.facts.find((x) => x.label === "Next batch");
  return { label: f?.label ?? "", date: f?.value ?? "" };
}

/** Big countdown band under the hero: time left, seats, CTA. */
export function CountdownBand({ course }: { course: Course }) {
  const b = batchFact(course);
  return (
    <section className="relative overflow-hidden border-y border-ink-line bg-black px-(--gutter) py-(--section-y)">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_15%_50%,rgb(227_16_27/0.14),transparent_70%)]" />
      <div className="relative mx-auto max-w-(--container-page)">
        <Countdown startsAt={course.startsAt} label={b.label} dateLabel={b.date} />
        <div className="mt-12 grid gap-8 border-t border-ink-line pt-8 md:grid-cols-2 md:items-end">
          <SeatRow label={site.ui.seatsLabel} />
          <UrgencyStrip text={course.urgency} />
        </div>
      </div>
    </section>
  );
}

export function AboutLoop({ course }: { course: Course }) {
  return (
    <>
      <LoopBand media={course.loopVideo} />
      <section className="section-pad">
        <div className="mx-auto grid max-w-(--container-page) gap-10 md:grid-cols-12">
          <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] text-balance md:col-span-6">
            <ScrollRead text={home.hero.heading} />
          </h2>
          <div className="md:col-span-5 md:col-start-8">
            <Reveal>
              <p className="text-mute-dark">{home.hero.body}</p>
            </Reveal>
            <ul className="mt-8">
              {home.beliefs.map((b, i) => (
                <Reveal as="li" key={b.title} delay={i * 0.07} className="group relative flex gap-4 border-t border-ink-line py-4">
                  <HoverLine />
                  <span className="font-mono text-small text-signal">{n2(i + 1)}</span>
                  <p>
                    <span className="font-display font-semibold transition-colors group-hover:text-signal">{b.title}</span>{" "}
                    <span className="text-mute-dark">{b.body}</span>
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export function WhatYouGet({ course }: { course: Course }) {
  const w = course.whatYouGet;
  return (
    <section className="on-paper section-pad relative">
      <DotField />
      <div className="relative mx-auto grid max-w-(--container-page) gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">
            <ScrollRead text={w.heading} />
          </h2>
          <ol className="mt-8 border-t border-ink">
            {w.items.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                className="group relative grid grid-cols-[3rem_1fr] gap-x-4 border-b border-paper-line py-5 transition-colors duration-450 hover:bg-paper-2 sm:grid-cols-[4rem_1fr_1.3fr] sm:gap-x-8"
              >
                <span aria-hidden className="absolute top-0 bottom-0 left-0 w-[3px] origin-top scale-y-0 bg-signal transition-transform duration-450 ease-primary group-hover:scale-y-100" />
                <span className="pl-3 font-mono text-small text-signal">{n2(i + 1)}</span>
                <h3 className="font-display text-h3 font-semibold tracking-[-0.02em] transition-colors group-hover:text-signal-deep">{item.title}</h3>
                <p className="col-start-2 mt-2 text-mute-light sm:col-start-3 sm:mt-0">{item.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
        <aside className="lg:col-span-5">
          <GlassPanel fast className="text-paper lg:sticky lg:top-24">
            <div className="p-8 sm:p-10">
              <p className="eyebrow text-paper/75">{course.name}</p>
              <Price amount={course.price.amount} className="mt-4 block font-display text-h1 font-semibold tracking-[-0.04em]" />
              <SeatRow label={site.ui.seatsLabel} className="mt-6" />
              <dl className="mt-8 space-y-3 border-t border-paper/15 pt-6">
                {course.facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 text-small">
                    <dt className="text-paper/65">{f.label}</dt>
                    <dd className="text-right font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </GlassPanel>
        </aside>
      </div>
    </section>
  );
}

export function AiAdvantage({ course }: { course: Course }) {
  const a = course.aiAdvantage;
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <h2 className="max-w-[18ch] font-display text-h2 font-semibold tracking-[-0.03em] text-balance">
          <ScrollRead text={a.heading} />
        </h2>
        <ol className="mt-12 grid gap-x-12 md:grid-cols-2">
          {a.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={(i % 2) * 0.08} className="group relative flex gap-6 border-t border-ink-line py-7">
              <HoverLine />
              <span className="font-display text-h2 leading-none font-light text-ink-line tabular-nums transition-colors duration-450 group-hover:text-signal">
                {n2(i + 1)}
              </span>
              <div>
                <h3 className="font-display text-h3 font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 max-w-[42ch] text-mute-dark">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Outcomes({ course }: { course: Course }) {
  const o = course.outcomes;
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-(--container-page)">
        <h2 className="font-display text-h2 font-semibold tracking-[-0.03em]">
          <ScrollRead text={o.heading} />
        </h2>
        <ol className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {o.items.map((item, i) => (
            <Reveal as="li" key={item} delay={(i % 3) * 0.06} className="group relative flex gap-4 border-t border-ink-line py-5">
              <HoverLine />
              <span className="font-mono text-small text-signal">{n2(i + 1)}</span>
              <span className="font-display text-[1.1875rem] leading-snug font-medium transition-colors group-hover:text-paper">{item}</span>
            </Reveal>
          ))}
        </ol>
        <p className="eyebrow mt-8 text-mute-dark">{o.footnote}</p>
      </div>
    </section>
  );
}

export function Testimonials({ course }: { course: Course }) {
  const t = course.testimonials;
  if (!t.items.length) return null;
  return (
    <section className="section-pad border-t border-ink-line">
      <div className="mx-auto max-w-(--container-page)">
        <h2 className="mb-10 font-display text-h2 font-semibold tracking-[-0.03em]">
          <Txt>{t.heading}</Txt>
        </h2>
        <TestimonialRow items={t.items} />
      </div>
    </section>
  );
}

export function Faqs({ course }: { course: Course }) {
  const q = course.faqs;
  return (
    <section className="on-paper section-pad">
      <div className="mx-auto grid max-w-(--container-page) gap-10 lg:grid-cols-12">
        <h2 className="font-display text-h2 font-semibold tracking-[-0.03em] lg:col-span-4">
          <ScrollRead text={q.heading} />
        </h2>
        <div className="border-t border-ink lg:col-span-8">
          {q.items.map((item) => (
            <AccordionItem
              key={item.q}
              head={<span className="font-display text-[1.25rem] font-semibold tracking-[-0.01em] transition-colors group-hover:text-signal-deep">{item.q}</span>}
            >
              <p className="max-w-[60ch] text-mute-light">
                <Txt>{item.a}</Txt>
              </p>
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Apply({ course }: { course: Course }) {
  return (
    <section id="apply" className="section-pad border-t border-ink-line">
      <div className="mx-auto grid max-w-(--container-page) gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 className="sr-only">{applicationForm.heading}</h2>
            {/* "You can do it." with the salesman leaning his forearm on the top line (sizes in em, so they scale together) */}
            <Reveal>
              <p aria-label={applicationForm.cheer.join(" ")} className="relative pt-[0.75em] pb-[0.4em] font-display text-[clamp(3.2rem,8vw,8rem)] leading-[0.9] font-semibold tracking-[-0.05em]">
                <span aria-hidden className="relative inline-block">
                  {applicationForm.cheer[0]}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/course/salesman-lean.webp"
                    alt=""
                    width={395}
                    height={1000}
                    className="pointer-events-none absolute top-[-0.66em] left-[calc(100%-0.4em)] h-[2.8em] w-auto max-w-none select-none"
                  />
                </span>
                <br />
                <span aria-hidden className="text-signal">{applicationForm.cheer[1]}</span>
              </p>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-7">
          <ApplyForm courseName={course.name} />
        </div>
      </div>
    </section>
  );
}
