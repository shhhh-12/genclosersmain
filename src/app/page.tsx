import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { IntroTear } from "@/components/home/IntroTear";
import { HomeHero, Proof, BrandStrip, Beliefs, Audience, Services, CoursesBlock, People, Proofs, Closing } from "@/components/home/HomeSections";
import { WheelBand } from "@/components/home/WheelBand";
import { introGateScript } from "@/lib/intro";
import { introShortWords, introWords } from "@/content/home";
import { listedCourses } from "@/content/courses";

export default function HomePage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
      <IntroTear words={introShortWords} stageId="home-stage" sliceOnly />
      <SiteHeader />
      <div id="home-stage">
        <main>
          {/* TESTING (owner 2026-11-19): the India band first, the café story under it */}
          {/* desktop (tall enough to show the whole band): it holds on screen for a short scroll while India turns red, then moves on */}
          {/* the hold is about one scroll: IndiaDots sets the scene height (stage + 33svh) and --pin-top */}
          <div data-dots-scene className="bg-ink [@media(min-width:1024px)_and_(min-height:700px)]:h-[133svh]">
            <div className="[@media(min-width:1024px)_and_(min-height:700px)]:sticky [@media(min-width:1024px)_and_(min-height:700px)]:[top:var(--pin-top,0px)]">
              <Proof />
            </div>
          </div>
          {/* the brand names: a band that divides the India scene from what follows (owner 2026-11-19) */}
          <BrandStrip />
          {/* Sections alternate black and white (owner 2026-11-19): India (black) → Who it's for (white)
              → At GenClosers (black) → the café (light) → Start here (black) → messages wall (white)
              → People (black) → What we believe + Closing (white) → the wheel and the footer (black) */}
          <Audience />
          {/* what we do: Train / Consult / Done for you (owner 2026-11-19, from the sample site) */}
          <div className="bg-ink">
            <Services />
          </div>
          <HomeHero />
          {/* one ink sheet after the story; the film's ending curtain glides straight into it */}
          <div className="relative z-10 rounded-t-[2rem] border-t border-ink-line bg-ink motion-reduce:rounded-none">
            <CoursesBlock courses={listedCourses} />
            {/* the real proof right after the offer, as in the owner's sample (owner 2026-11-19) */}
            <Proofs />
            <People />
            {/* what we believe, then the ways on, on one white stretch */}
            <Beliefs />
            <Closing />
          </div>
          {/* the spoke wheel from the intro, turning through the steps of a sale (owner 2026-11-19) */}
          <WheelBand words={introWords} />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
