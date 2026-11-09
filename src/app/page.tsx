import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { IntroTear } from "@/components/home/IntroTear";
import { HomeHero, HomeAbout, Beliefs, Audience, CoursesBlock } from "@/components/home/HomeSections";
import { LoopBand } from "@/components/media/LoopVideo";
import { introGateScript } from "@/lib/intro";
import { introShortWords } from "@/content/home";
import { listedCourses } from "@/content/courses";

export default function HomePage() {
  const primary = listedCourses[0];
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
            <Beliefs />
            <Audience />
            <LoopBand media={primary.loopVideo} />
            <CoursesBlock courses={listedCourses} />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
