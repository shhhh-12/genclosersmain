import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CourseFeature } from "@/components/home/HomeSections";
import { WordReveal } from "@/components/motion/Reveal";
import { listedCourses } from "@/content/courses";
import { home } from "@/content/home";

export const metadata: Metadata = {
  title: home.coursesHeading,
};

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-(--gutter) pt-36 pb-(--section-y) sm:pt-44">
        <div className="mx-auto max-w-(--container-page)">
          <div className="flex items-end justify-between gap-6 border-b border-ink-line pb-8">
            <h1 className="font-display text-mega font-semibold tracking-[-0.045em]">
              <WordReveal text={home.coursesHeading} />
            </h1>
            <p className="eyebrow pb-3 text-mute-dark">
              {listedCourses.length} {listedCourses.length === 1 ? "course" : "courses"}
            </p>
          </div>
          <div className="mt-12 space-y-6">
            {listedCourses.map((c) => (
              <CourseFeature key={c.slug} course={c} />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
