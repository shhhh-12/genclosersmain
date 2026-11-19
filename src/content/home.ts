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
  /** The first screen, readable at once (owner's sample site, 2026-11-19). The story plays only on demand. */
  // UI copy describing the story below it (owner 2026-11-19: the heading must match the café). Source of the
  // story: the founder's workshop notes (docs/workshop-module3-sales.txt).
  lead: {
    heading: "One café. One stranger. Two ways to sell.",
    accent: "Two ways to sell.",
    body: "A short story from our sales workshop about what selling really is. Take a seat at the table and watch.",
  },

  /** The About card at the end of the story (and the reduced-motion About section). */
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
    // the title card he shoves away when the film starts (owner 2026-11-19)
    card: { title: "Sales in 5 steps.", accent: "5 steps.", sub: "The GenClosers way" },
    // UI copy: the chair on the first screen. Hold it to play the story (owner 2026-11-19: "hold to have a seat")
    seat: {
      hold: "Hold to have a seat",
      again: "Hold to watch again",
      label: "Watch the story: hold the chair, or press Enter",
      close: "Close",
      hintDesktop: "Scroll to move through it · Esc to stop",
      hintPhone: "Swipe up or down to move · Swipe right to stop",
    },
    coffee: "Don't touch my coffee!", // just for fun: click the cup
    night: { toNight: "Night", toDay: "Day", label: "Switch the café between day and night" },
  },

  /**
   * Proof band with the dotted India map (components/home/IndiaDots.tsx).
   * Words: the owner's sample site (2026-11-19). Number labels: owner approved 2026-11-19 (they are
   * the founders' records, so they say so). Brands: every brand named in the founder bios as a
   * client or employer (owner: "show all brands"); the founders' own companies stay in their bios.
   */
  proof: {
    // the first screen of the page (owner 2026-11-19: India first). Words = the sample site's hero.
    heading: "Building India's Sales Revolution.",
    keep: "Revolution.", // stays red after the heading reads itself
    body: "Born in Tamil Nadu. Built for India. Transforming sales education by empowering individuals and businesses with the skills, systems and psychology to win in sales.",
    stats: [
      { rupee: true, value: 20, suffix: " Cr+", label: "in revenue our founders helped businesses generate" },
      { rupee: false, value: 100, suffix: "+", label: "sales professionals mentored" },
      { rupee: false, value: 10, suffix: "+", label: "successful projects" }, // owner 2026-11-19 (sample site)
    ],
    scrollCue: "Scroll", // UI copy: desktop, while the first screen holds
    brandsLabel: "Our founders have worked with",
    brands: ["FitX120", "ScreelX", "Zorrofit", "Nuke Marketing", "Ashtag"],
    mapLabel: "Map of India in dots, turning red from Tamil Nadu outward",
  },

  // What we do (owner's sample site, 2026-11-19). Consult and Done for you have no pages yet:
  // their links open WhatsApp.
  services: {
    heading: "At GenClosers",
    // UI copy for the interactive call (owner 2026-11-19: say who does what, "you do X, we do Y";
    // no percentages). Offer titles, bodies and links: the owner's sample site.
    ask: "Pick how we work together.",
    live: "On the call",
    lanes: { you: "You", us: "GenClosers" },
    items: [
      {
        key: "course", label: "Train", title: "",
        body: "Learn how real sales calls work, then practise until you can do it yourself.", link: "Master the Art of Sales",
        you: "Make the calls", us: "Make you a closer", line: "You make the calls. We make you a closer.",
      },
      {
        key: "whatsapp", label: "Consult", title: "Build your sales system.",
        body: "We fix your sales and build a repeatable sales system.", link: "Build with us",
        you: "Run the calls", us: "Build the system behind them", line: "You run the calls. We build the system behind them.",
      },
      {
        key: "whatsapp", label: "Done for you", title: "We run your sales.",
        body: "Our team builds and runs your sales system, so your business grows without you on every call.", link: "Work with us",
        you: "Run your business", us: "Run your sales", line: "You run your business. We run your sales.",
      },
    ],
  },

  // "Why we do this." (owner 2026-11-19): the owner's real proof, shown as polaroids. Photos: the
  // owner's workshop pictures. Messages: screenshots people sent (one sender's profile photo is
  // blurred). Line under the heading: the YouTube channel's own description. YouTube numbers as on
  // the channel page on 2026-11-19: update them when they change.
  proofWall: {
    heading: "Why we do this.",
    sub: "Driven by a vision to teach sales as a life skill for every single Indian.",
    dragHint: "Drag the cards", // UI copy
    youtube: {
      href: "https://www.youtube.com/@GenClosers",
      handle: "@GenClosers",
      stats: "1.18K subscribers · 10 videos",
      cta: "Watch on YouTube", // UI copy
      banner: { src: "/proof/youtube-banner.webp", width: 1264, height: 206 },
    },
    // Monish's Instagram profile (owner's screenshot, 2026-11-19): numbers and bio as shown that day
    instagram: {
      href: "https://www.instagram.com/monisharavind/",
      handle: "monisharavind",
      name: "Monish Aravind K | MAK",
      stats: "12.2k followers · 57 posts",
      bio: [{ text: "On a mission to teach Sales as a Life Skill to all Indians" }, { text: "Personally closed ₹2Cr+ in sales", rupee: true }],
      cta: "Follow on Instagram", // UI copy
      photo: "/proof/instagram-monish.webp",
    },
    // UI copy
    copy: { workshop: "Workshop", like: "Double-tap to like", liked: "Liked", close: "Close", preview: "Opens a closer view." },
    items: [
      { kind: "photo", src: "/proof/workshop-1.webp", width: 682, height: 579, alt: "A GenClosers session: people around a long table listening to the speaker at a screen." },
      { kind: "message", src: "/proof/dm-client.webp", width: 647, height: 463, alt: "A message in Tamil: after watching a GenClosers video, I signed a client. Thank you." },
      { kind: "photo", src: "/proof/workshop-2.webp", width: 680, height: 659, alt: "A GenClosers live session: the speaker explains a slide while people at the table take notes." },
      { kind: "message", src: "/proof/dm-muthu.webp", width: 560, height: 635, alt: "A message: I'm not a salesperson, but the concept of a Closer will be very useful for me, professionally and personally." },
      { kind: "message", src: "/proof/dm-follower.webp", width: 553, height: 699, alt: "A message: the way you simplify sales and marketing and genuinely help people learn is really inspiring." },
      { kind: "message", src: "/proof/dm-masterclass.webp", width: 641, height: 882, alt: "A message: watched the entire video, for me it's a masterclass. The what, how and why of sales are perfectly covered." },
      { kind: "message", src: "/proof/dm-voice-notes.webp", width: 643, height: 1014, alt: "Replies to voice notes from Monish: very useful and much-needed guidance; I got a lot of clarity." },
      { kind: "message", src: "/proof/dm-clarity.webp", width: 573, height: 734, alt: "A message: thanks Monish, I got clarity on where I should approach and pivot." },
    ],
  },

  // the founders, short (home); the full bios live on /about (content/about.ts)
  people: { link: "Our story" }, // UI copy
  // closing band (UI copy, owner 2026-11-19)
  closing: { heading: "Start with the course, or talk to us.", course: "See the course", work: "Work with us" },

  beliefs: [
    { title: "A system, not a talent.", body: "If you can learn steps, you can learn sales." },
    { title: "Help, don't push.", body: "Sales is helping someone who is in need make the right decision." },
    { title: "Practice, not theory.", body: "Watching is not learning. Every key skill is recorded, scored and improved." },
  ] satisfies Card[],

  audience: {
    heading: "Built for anyone who has to convince someone of something.",
    // UI copy (owner 2026-11-19): two ways on. "Work with us" opens WhatsApp until the business pages exist.
    cta: { work: "Work with us", courses: "See courses" },
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
  coursesHeading: "Start here", // owner 2026-11-19: one course for now
  seeCourse: "See the course", // UI copy: quiet link in the closing band
};
