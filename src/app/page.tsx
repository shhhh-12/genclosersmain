import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { IntroTear } from "@/components/home/IntroTear";
import { HomeHero, HomeAbout, Beliefs, Audience, CoursesBlock } from "@/components/home/HomeSections";
import { introGateScript } from "@/lib/intro";
import { introShortWords } from "@/content/home";
import { listedCourses } from "@/content/courses";

export default function HomePage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
      <IntroTear words={introShortWords} stageId="home-stage" />
      <SiteHeader />
      <div id="home-stage">
        <main>
          <HomeHero />
          {/* Everything after the hero is one sheet that slides up over the hero's last screen.
              One layer above the hero, so no later section can fall underneath its sticky stage. */}
          <div className="relative z-10 -mt-[100svh] rounded-t-[2rem] border-t border-ink-line bg-ink motion-reduce:mt-0 motion-reduce:rounded-none">
            {/* with motion, the About words are on the curtain at the end of the story */}
            <div className="motion-safe:hidden">
              <HomeAbout />
            </div>
            {/* the course right after the story (owner 2026-11-10: course card up, loop video removed) */}
            <CoursesBlock courses={listedCourses} />
            <Beliefs />
            <Audience />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
