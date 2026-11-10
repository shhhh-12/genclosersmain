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

  /**
   * Hero story (components/home/FriendStory.tsx): café → rewind → the real why → a friend.
   * Source: the founder's workshop notes (docs/workshop-module3-sales.txt, owner 2026-11-09):
   * the café stranger who judges your mood and pushes solutions ("yaara ivan?") vs the same stranger
   * who asks to sit and listens; "if your intention was to help, they can sense it"; the
   * "I want to lose weight" why-chain that ends at the kids; "sales is just helping out a friend
   * who is in need". "People buy with feeling" was approved by the owner as the scene-3 line.
   * `accent` = the word drawn in red. No course selling in the hero.
   * Older versions: .work/backup-story-hero-2026-11-09, .work/backup-friendstory-6scene-2026-11-09.
   */
  story: {
    lines: [
      { text: "Sales feels like this?", accent: "this?" },
      { text: "That stranger is you.", accent: "you." }, // owner approved 2026-11-09
      { text: "Same stranger." },
      { text: "Intention is helping, not selling.", accent: "helping," }, // owner 2026-11-10
      { text: "People buy with feeling.", accent: "feeling." },
      { text: "Sales is helping a friend in need.", accent: "friend" },
    ],
    // Words inside the art (speech bubbles), short on purpose
    bubbles: {
      push: "Buy my fat loss program!",
      react: "I don't need anything from you.",
      ask: "Can I sit here?",
      listen: "mm",
      want: "I want to lose weight.",
      why: "Why?",
      health: "For my health.",
      why2: "Why does it matter?",
      kids: "For my kids.",
      start: "When can I start?", // owner approved 2026-11-09: the same program, asked for this time
    },
    rewind: "Rewind", // UI label on the rewind moment
    // Small hand-lettered scene names over the six lines (no numbers: owner 2026-11-10)
    eyebrows: ["the push", "the twist", "the rewind", "the intention", "the real why", "a friend"],
    // The first screen: tells people there is a story and that scrolling plays it
    scrollHint: { text: "Scroll to understand sales in 5 steps.", tapText: "Tap to understand sales in 5 steps.", accent: "5 steps" },
    skip: "Skip story", // first screen only: jumps to the end card
    idle: { scroll: "Scroll", tap: "Tap here" }, // fades in 5 s after he starts typing, 3 s when stuck mid-story
    coffee: "Don't touch my coffee!", // just for fun: click the cup
    night: { toNight: "Night", toDay: "Day", label: "Switch the café between day and night" },
  },

  beliefs: [
    { title: "A system, not a talent.", body: "If you can learn steps, you can learn sales." },
    { title: "Help, don't push.", body: "Sales is helping someone who is in need make the right decision." },
    { title: "Practice, not theory.", body: "Watching is not learning. Every key skill is recorded, scored and improved." },
  ] satisfies Card[],

  audience: {
    heading: "Built for anyone who has to convince someone of something.",
    sticker: "That's me", // UI copy: the sticker on a polaroid you hover
    dragHint: "Drag the cards", // UI copy
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
  seeCourse: "See the course", // UI copy: quiet link in the closing band
};
