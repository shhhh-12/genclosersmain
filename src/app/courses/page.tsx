import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CourseFeature } from "@/components/home/HomeSections";
import { WordReveal } from "@/components/motion/Reveal";
import { listedCourses } from "@/content/courses";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.ui.allCourses,
  description: site.ui.allCoursesIntro,
};

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-(--gutter) pt-36 pb-(--section-y) sm:pt-44">
        <div className="mx-auto max-w-(--container-page)">
          <div className="flex items-end justify-between gap-6 border-b border-ink-line pb-8">
            <div>
              <h1 className="font-display text-mega font-semibold tracking-[-0.045em]">
                <WordReveal text={site.ui.allCourses} />
              </h1>
              <p className="mt-4 max-w-[48ch] text-lead text-mute-dark">{site.ui.allCoursesIntro}</p>
            </div>
            <p className="eyebrow pb-3 text-mute-dark">
              {listedCourses.length} {listedCourses.length === 1 ? "course" : "courses"}
            </p>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {listedCourses.map((c) => (
              <CourseFeature key={c.slug} course={c} showPrice />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
