// Home page copy. Source: core content PDF sections 4, 5 and 6 (brand level, not course detail).

import type { Card } from "./types";

/** Words on the spoke wheel, in order of arrival after "Sales" (matches the reference Lottie). "Sales" is the red word. */
export const introWords = [
  "lead",
  "Prospect",
  "Connect",
  "Discover",
  "Pitch",
  "Handle",
  "Negotiate",
  "Close",
  "Convert",
  "Retain",
  "Up-Selling",
  "Sales",
] as const;

/**
 * The intro's shorter wheel (6 words). It opens on "Sales", turns one full circle and
 * lands on "Sales" again before the slice. The hero wheel shows all 12.
 */
export const introShortWords = ["Prospect", "Connect", "Pitch", "Negotiate", "Close", "Sales"] as const;

export const home = {
  hero: {
    eyebrow: "GenClosers",
    heading: "Sales is a human conversation, not a manipulation game.",
    body: "Most people learn sales by failing on real calls, or from people who teach pressure. GenClosers teaches it as a system: a clear set of steps that works for any personality, any product and any industry. Everything in this program comes from real calls our team has made and the sales systems we build for growing businesses.",
  },

  beliefs: [
    { title: "A system, not a talent.", body: "If you can learn steps, you can learn sales." },
    { title: "Help, don't push.", body: "Sales is helping someone who is in need make the right decision." },
    { title: "Practice, not theory.", body: "Watching is not learning. Every key skill is recorded, scored and improved." },
  ] satisfies Card[],

  audience: {
    heading: "Built for anyone who has to convince someone of something.",
    items: [
      { title: "Students", body: "Learn the one skill college never taught you, before your career starts." },
      { title: "Aspiring entrepreneurs", body: "Your idea needs customers. Learn how to talk to them before you launch." },
      { title: "Business owners", body: "Stop guessing on sales calls. Understand selling well enough to do it and to lead the people who do it for you." },
      { title: "Freelancers", body: "Turn enquiries into paid projects without dropping your rate or chasing clients." },
      { title: "Salespeople", body: "Swap pressure and memorised lines for a process that holds up on every call." },
    ] satisfies Card[],
  },

  // UI copy
  coursesHeading: "Courses",
};
