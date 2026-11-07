// All course copy. Source: core content/GenClosers Sales Program Landing Page .pdf
// plus owner answers in chat on 2026-11-07 (language, access, hours, batch date, price, WhatsApp).
// To add a course: copy the object below, change the slug and copy, set `listed: true`.
// Text in [[TODO: ...]] is missing information and shows on the page until replaced.

import type { Course } from "./types";

const salesProgram: Course = {
  slug: "sales-is-all-you-need",
  listed: true,
  // Renamed by the owner on 2026-11-08 (was "GenClosers Sales Program")
  name: "Sales is all you need",
  shortName: "Sales is all you need",
  tagline: "Sales is not a talent. It is a system you can learn.",
  eyebrow: "GenClosers · Only 10 seats per batch",
  heading: "Sales is not a talent. It is a system you can learn.",
  subheading:
    "Learn to take any conversation from hello to a closed deal, without pushing anyone. 21 modules, AI scored practice on every key skill, and a live 1:1 mock call to finish.",

  price: { amount: 20000, currency: "INR", display: "₹20,000" },

  // Owner: batch starts 1 December 2026. Start time not given; midnight India time assumed.
  startsAt: "2026-12-01T00:00:00+05:30",

  // Owner answers, 2026-11-07
  facts: [
    { label: "Next batch", value: "1 December 2026" },
    { label: "Seats", value: "10 per batch" },
    { label: "Length", value: "4 hours, 21 modules" },
    { label: "Language", value: "Tanglish" },
    { label: "Access", value: "90 days" },
  ],

  vsl: {
    // Source line is "Watch this before you decide. [X] minutes."; the current VSL file runs 30 seconds.
    lineAbove: "Watch this before you decide. 30 seconds.",
    video: {
      base: "/media/vsl/vsl",
      width: 1920,
      height: 1080,
      label: "Sales is all you need: program video",
    },
  },

  loopVideo: {
    base: "/media/course-loop/course-loop",
    width: 1920,
    height: 1092,
    label: "A search for how to learn sales, ending on GenClosers",
  },

  urgency:
    "Only 10 seats per batch. Every student gets real attention and a live 1:1, so once 10 seats are filled, this batch closes.",
  // Only switch this on if someone updates it as people join. A counter that never moves looks fake.
  seatCounter: null,
  ctaLabel: "Reserve My Seat",

  // Items below are all stated in the source copy; no values or prices are added.
  whatYouGet: {
    heading: "What you get",
    items: [
      { title: "21 modules", body: "One complete sales call. Built step by step." },
      { title: "AI scored practice", body: "Every recording is scored on tone, energy, clarity, confidence and flow, with 3 attempts per task." },
      { title: "WhatsApp doubt group", body: "Ask your doubts in the WhatsApp group for your first month." },
      { title: "Live 1:1 with Mak", body: "60 minutes, focused on your weak points from the recording." },
      { title: "GenClosers Certification", body: "Earn your GenClosers Certification through a graded final mock call." },
      { title: "One page desk PDF", body: "A rapid fire checklist for before, during and after the call." },
    ],
  },

  aiAdvantage: {
    heading: "You don't just watch. You practise, and you get scored.",
    items: [
      { title: "Record, don't just read", body: "After every key skill, you record yourself doing it on a real call scenario." },
      { title: "Instant AI feedback", body: "Every recording is scored on tone, energy, clarity, confidence and flow." },
      { title: "3 attempts per task", body: "Try it, see exactly what to fix, and try again." },
      { title: "One shared practice product", body: "Everyone practises on the same brief, so your scores actually mean something." },
      { title: "Your weak points, found early", body: "Your mentor sees your scores before your live 1:1, so the hour goes into what you actually need." },
      { title: "Learn at your own pace", body: "45 to 60 minutes a day. Like the gym, consistency beats intensity." },
    ],
  },

  curriculum: {
    heading: "21 modules. One complete sales call. Built step by step.",
    groups: [
      {
        part: "Getting Started",
        modules: [
          { number: 0, title: "Introduction", points: [
            "Why sales matters for your path, made for your role",
            "Why sales is a system anyone can learn, whatever your personality",
            "How to get the most out of this course in 45 to 60 minutes a day",
          ] },
        ],
      },
      {
        part: "Part 1 · What Is Sales",
        modules: [
          { number: 1, title: "What Sales Really Is", points: [
            "Why people think sales is manipulation, and the invisible shield they put up",
            "Why people can sense your intention, and why acting never lasts a full call",
            "The real definition: sales is helping a friend who is in need",
          ] },
          { number: 2, title: "How Your Practice Works", points: [
            "The types of tasks and how recordings work",
            "How AI scoring and your 3 attempts work",
            "Your practice product, and what to do if you get stuck",
          ] },
        ],
      },
      {
        part: "Part 2 · Why Sales Exists",
        modules: [
          { number: 3, title: "Why Sales Exists and How People Buy", points: [
            "The 20/20/60 split, and the 60% sales actually exists for",
            "Helping people decide, and why letting the wrong fit go brings them back",
            "The 4 layers of buying, and where each one shows up in a call",
          ] },
        ],
      },
      {
        part: "Part 3 · How to Do Sales",
        section: "Section A · Trust",
        modules: [
          { number: 4, title: "Trust and Liking", points: [
            "No trust, no pain shared, no sale",
            "Opening with their name and your energy, and reading a room you can't see",
            "Rescheduling without losing the upper hand",
          ] },
          { number: 5, title: "Tonality", points: [
            "Why a flat voice makes you sound like every other caller",
            "The 5 tones: energy, curiosity, impact, conviction and adaptive",
            "Which tone to use at which point of the call",
          ] },
          { number: 6, title: "Reciprocation", points: [
            "Why genuine help makes people want to give back",
            "Helping on the call without expecting anything in return",
            "Liking plus reciprocation equals trust",
          ] },
        ],
      },
      {
        part: "Part 3 · How to Do Sales",
        section: "Section B · The 7 Step Call Flow",
        modules: [
          { number: 7, title: "The Call Flow and Opening", points: [
            "The 7 steps every sales call follows",
            "Why the opening decides the next 6 steps",
            "The 5 things every opening needs",
          ] },
          { number: 8, title: "Qualification (PACT)", points: [
            "Pain, Authority, Capital, Timeline: is this person ready right now?",
            "Being selective, honestly, without faking scarcity",
            "Asking about money without sounding money minded",
          ] },
          { number: 9, title: "Finding the Real Need (PNS)", points: [
            "Problem, Need, Solution: why the first answer is never the real one",
            "Digging from the surface need to the root pain with what, why and how",
            "The 70/30 talk rule, and honest urgency over fake urgency",
          ] },
          { number: 10, title: "Giving Value", points: [
            "The step most salespeople skip",
            "Giving something useful before you ask for anything",
            "Why product and niche knowledge come before sales skill",
          ] },
          { number: 11, title: "Benefits", points: [
            "Sell the vacation, not the ticket",
            "Tying every benefit to their problem, in their own words",
            "Why stressing benefits kills trust",
          ] },
          { number: 12, title: "Objection Handling", points: [
            "The 4 objections you will hear in every industry",
            "Handling objections before they even come up",
            "Building your own objection response library",
          ] },
          { number: 13, title: "Closing and Follow Up", points: [
            "Staying most confident at the money part, and the 10X value rule",
            "Benefit stacking, revealing price without flinching, and collecting payment on the call",
            "Following up without \"just checking in\", and knowing when to let go",
          ] },
        ],
      },
      {
        part: "Part 3 · How to Do Sales",
        section: "Section C · The Full Picture",
        modules: [
          { number: 14, title: "The Sales Rope", points: [
            "The 9 checkpoints every sales call walks through",
            "Where deals fall, and what each fall costs you",
            "Using the rope to diagnose every lost deal",
          ] },
          { number: 15, title: "Before the Call, After the Sale, and Other Channels", points: [
            "Booking the call and preparing before you dial",
            "Onboarding that prevents regret and refunds",
            "Selling in person and over DMs",
          ] },
        ],
      },
      {
        part: "Part 3 · How to Do Sales",
        section: "Section D · Improving Yourself",
        modules: [
          { number: 16, title: "Building Your Own Script", points: [
            "A script is a map, not lines to memorise",
            "Building yours across all 7 steps",
            "Keeping it updated after every call",
          ] },
          { number: 17, title: "Tracking Your Numbers", points: [
            "Your funnel, from lead to payment collected",
            "Finding exactly where you are losing deals",
            "Reading trends, not single days",
          ] },
          { number: 18, title: "Reviewing Your Calls", points: [
            "Why closers study their calls like athletes study match footage",
            "Your call review checklist",
            "Making review a weekly habit",
          ] },
          { number: 19, title: "Key Points to Remember", points: [
            "A rapid fire checklist for before, during and after the call",
            "The words to swap on every call",
            "A one page PDF to keep by your desk",
          ] },
          { number: 20, title: "Final Mock Call", points: [
            "One full call that brings every skill together",
            "Your own script, used on the practice brief",
            "AI scored video, then a 60 minute live 1:1 mock with Mak",
          ] },
        ],
      },
    ],
  },

  outcomes: {
    heading: "By the end, you will be able to:",
    items: [
      "Open any call with confidence and earn trust in the first minute",
      "Qualify fast, so your time goes to people ready to decide",
      "Find the real reason someone wants to buy",
      "Handle the 4 common objections calmly",
      "Reveal the price and close without pushing",
      "Follow up in a way that actually gets replies",
      "Build your own script and keep improving it",
      "Track your numbers and review your calls like a pro",
      "Earn your GenClosers Certification through a graded final mock call",
    ],
    footnote: "We promise skill, not income. What you do with it is yours to build.",
  },

  // TEST PLACEHOLDERS ONLY. testimonial.mp4 is a promo reel, not a student testimonial.
  // Replace with real student videos before running ads.
  testimonials: {
    heading: "[[TODO: testimonials section heading]]",
    items: [1, 2, 3, 4].map((n) => ({
      id: `placeholder-${n}`,
      name: `[[TODO: student name ${n}]]`,
      isPlaceholder: true,
      video: {
        base: "/media/testimonials/testimonial",
        width: 720,
        height: 1280,
        label: `Testimonial video ${n} (placeholder)`,
      },
    })),
  },

  journey: {
    heading: "From your first module to your certificate.",
    steps: [
      { title: "Grab one of 10 seats.", body: "Get instant access to the course and the WhatsApp group." },
      { title: "Learn in order.", body: "45 to 60 minutes a day. Every module builds on the last." },
      { title: "Practise every key skill.", body: "Quick quizzes and recorded tasks, scored by AI, with 3 attempts each." },
      { title: "Get unstuck fast.", body: "Ask your doubts in the WhatsApp group for your first month." },
      { title: "Record your final mock.", body: "One full call, on video, using your own script." },
      { title: "Live 1:1 with Mak.", body: "60 minutes, focused on your weak points from the recording." },
      { title: "Get certified.", body: "Become GenClosers Certified." },
    ],
  },

  faqs: {
    heading: "FAQs",
    items: [
      { q: "Do I need any sales experience?", a: "No. The course starts from what sales actually is and builds up one step at a time." },
      { q: "I'm an introvert. Will this work for me?", a: "Yes. Sales is a system, not a personality. The steps work whether you are loud or quiet." },
      { q: "How much time do I need?", a: "45 to 60 minutes a day. Total course length is 4 hours." },
      { q: "Is it live or recorded?", a: "The lessons are recorded so you can learn at your pace. You also get a WhatsApp doubt group for one month and one 60 minute live 1:1 mock call with Mak." },
      { q: "How does the AI scoring work?", a: "After key modules, you record yourself doing that skill. The AI scores your tone, energy, clarity, confidence and flow, and shows you what to fix. You get 3 attempts per task." },
      { q: "What do I practise on?", a: "Everyone practises on the same simple fitness program brief. It is easy to understand and keeps scores fair and comparable." },
      { q: "Will this get me a job?", a: "The program teaches and certifies the skill. It does not include a job or placement. We are building toward a placement pathway in the future." },
      { q: "Do I get a certificate?", a: "Yes. You become GenClosers Certified after you complete the course and your graded final mock call." },
      { q: "Why are seats limited?", a: "We take only 10 people per batch. Every student gets serious attention and a live 1:1 with Mak, and we can only do that properly for 10 people at a time. Once 10 seats are filled, the batch closes and the rest go to the next batch." },
      { q: "What language is the course in?", a: "Tanglish." },
      { q: "How long do I have access?", a: "90 days." },
      { q: "What is the refund policy?", a: "[[TODO: refund policy]]" },
    ],
  },
};

export const courses: Course[] = [salesProgram];

export const listedCourses = courses.filter((c) => c.listed);

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
