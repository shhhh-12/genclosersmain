import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { IntroTear } from "@/components/home/IntroTear";
import { HomeHero, HomeAbout, Beliefs, Audience, CoursesBlock, FinalBand } from "@/components/home/HomeSections";
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
          <HomeHero course={primary} />
          <HomeAbout />
          <Beliefs />
          <Audience />
          <LoopBand media={primary.loopVideo} />
          <CoursesBlock courses={listedCourses} />
          <FinalBand course={primary} />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
