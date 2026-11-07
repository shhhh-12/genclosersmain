import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";

// UI copy (not from the core content doc)
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="relative isolate flex min-h-[100svh] items-center overflow-hidden px-(--gutter)">
        <div className="mx-auto w-full max-w-(--container-page)">
          <p className="eyebrow text-signal">404</p>
          <h1 className="mt-5 max-w-[12ch] font-display text-h1 font-semibold tracking-[-0.035em]">This page doesn’t exist.</h1>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/">Go home</ButtonLink>
            <ButtonLink href="/courses" variant="ghost-dark">
              See courses
            </ButtonLink>
          </div>
        </div>
      </main>
    </>
  );
}
