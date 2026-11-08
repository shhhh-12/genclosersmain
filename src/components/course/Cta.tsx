import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import type { Course } from "@/content/types";
import { SeatRow } from "@/components/ui/Seats";
import { site } from "@/content/site";

/** Urgency line that sits above every CTA button (per the copy doc). */
export function UrgencyStrip({ text, tone = "dark" }: { text: string; tone?: "dark" | "light" }) {
  return (
    <p className={`flex items-start gap-3 text-small ${tone === "dark" ? "text-mute-dark" : "text-mute-light"}`}>
      <span className="relative mt-[0.45em] flex h-2 w-2 shrink-0">
        <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />
        <span className="relative h-2 w-2 rounded-full bg-signal" />
      </span>
      <span>{text}</span>
    </p>
  );
}

/** Repeated CTA block: urgency strip, then price and button. */
export function CtaRow({ course, tone = "dark" }: { course: Course; tone?: "dark" | "light" }) {
  return (
    <div data-cta className={`mx-auto flex max-w-(--container-page) flex-col gap-6 border-t pt-8 md:flex-row md:items-end md:justify-between ${tone === "dark" ? "border-ink-line" : "border-paper-line"}`}>
      <div className="max-w-md">
        <SeatRow label={site.ui.seatsLabel} left={course.seatCounter?.left} className="mb-5" />
        <UrgencyStrip text={course.urgency} tone={tone} />
        {course.seatCounter && (
          <p className="eyebrow mt-3 text-signal">
            {course.seatCounter.left} of {course.seatCounter.total} seats left
          </p>
        )}
      </div>
      <div className="flex items-center gap-6">
        <Price amount={course.price.amount} className="font-display text-h3 font-semibold" />
        <ButtonLink href="#apply" size="lg">
          {course.ctaLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
