import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CtaRow } from "@/components/course/Cta";
import { JourneyPinned } from "@/components/course/JourneyPinned";
import { MobileCtaBar } from "@/components/course/MobileCtaBar";
import {
  CourseHero,
  CountdownBand,
  AboutLoop,
  WhatYouGet,
  AiAdvantage,
  Curriculum,
  Outcomes,
  Testimonials,
  Faqs,
  Apply,
} from "@/components/course/CourseSections";
import { courses, getCourse } from "@/content/courses";

// Every course page is prerendered at build time (generateStaticParams) and is mostly reached
// directly from ads, so in-app navigations into it may wait for the URL params.
export const instant = false;

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c) return {};
  return {
    title: c.name,
    description: c.subheading,
    openGraph: { title: `${c.name} · ${c.tagline}`, description: c.subheading, images: [`${c.vsl.video.base}-poster.jpg`] },
  };
}

/** Course landing page. Built to receive ad traffic: one goal (apply), no menu exits. */
export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <>
      <SiteHeader variant="landing" price={course.price.amount} ctaLabel={course.ctaLabel} ctaHref="#apply" />
      <main>
        <CourseHero course={course} />
        <CountdownBand course={course} />
        <AboutLoop course={course} />
        <WhatYouGet course={course} />
        <AiAdvantage course={course} />
        <Curriculum course={course} />
        <div className="on-paper px-(--gutter) pb-(--section-y)">
          <CtaRow course={course} tone="light" />
        </div>
        <Outcomes course={course} />
        <Testimonials course={course} />
        <JourneyPinned heading={course.journey.heading} steps={course.journey.steps} />
        <div className="px-(--gutter) pb-(--section-y)">
          <CtaRow course={course} />
        </div>
        <Faqs course={course} />
        <Apply course={course} />
      </main>
      <SiteFooter minimal />
      <MobileCtaBar price={course.price.amount} label={course.ctaLabel} />
    </>
  );
}
