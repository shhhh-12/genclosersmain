// Shapes for all editable site content. Copy lives in /src/content, never inside components.

export type Media = {
  /** Path under /public, without extension, e.g. "/media/vsl/vsl". Player picks .mp4/.webm and -poster.jpg. */
  base: string;
  width: number;
  height: number;
  /** Optional captions file (WebVTT) under /public. */
  captions?: string;
  label: string;
};

export type Card = { title: string; body: string };

export type Module = {
  number: number;
  title: string;
  points: [string, string, string];
};

export type CurriculumGroup = {
  /** e.g. "Part 3 · How to Do Sales" */
  part: string;
  /** e.g. "Section A · Trust" (optional) */
  section?: string;
  modules: Module[];
};

export type Faq = { q: string; a: string };

export type Testimonial = {
  id: string;
  name: string;
  role?: string;
  video: Media;
  /** true = placeholder for testing only; must be replaced before ads go live */
  isPlaceholder?: boolean;
};

export type Course = {
  slug: string;
  /** Hidden courses do not appear in listings (e.g. L1 stays off the site). */
  listed: boolean;
  name: string;
  shortName: string;
  tagline: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  price: { amount: number; currency: "INR"; display: string };
  /** Batch start, ISO with time zone. Drives the countdown; it hides itself once passed. */
  startsAt: string;
  facts: { label: string; value: string }[];
  vsl: { lineAbove: string; video: Media };
  loopVideo: Media;
  urgency: string;
  seatCounter?: { left: number; total: number } | null;
  ctaLabel: string;
  whatYouGet: { heading: string; items: Card[] };
  aiAdvantage: { heading: string; items: Card[] };
  curriculum: { heading: string; subline?: string; groups: CurriculumGroup[] };
  outcomes: { heading: string; items: string[]; footnote: string };
  testimonials: { heading: string; items: Testimonial[] };
  journey: { heading: string; steps: Card[] };
  faqs: { heading: string; items: Faq[] };
};
