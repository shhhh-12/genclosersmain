// About page copy. Sources (owner, 2026-11-19): the sample website (hero line), the Mission and Vision
// text and the two founder bios pasted in chat, and the photos sent the same day. Mak = Monish Aravind K
// (owner confirmed). Lines marked "UI copy" are short interface labels written for the site.

export const about = {
  title: "About", // UI copy (nav + page title)
  heading: "Building India's Sales Revolution.",
  keep: "Revolution.",
  body: "Born in Tamil Nadu. Built for India. Transforming sales education by empowering individuals and businesses with the skills, systems and psychology to win in sales.",

  mission: {
    title: "Mission",
    items: [
      "Help businesses sell without losing the reason they started.",
      "Install a full 90-day sales system that doesn't depend on one person.",
      "Train individuals into confident closers through the GenClosers Sales Program: real practice, feedback, and certification.",
    ],
  },
  vision: {
    title: "Vision",
    items: [
      "Prove that sales is a system anyone can learn, not a born talent.",
      "Build businesses that sell with structure instead of luck.",
      "Raise a new generation of closers who sell with skill and honesty.",
    ],
  },

  foundersHeading: "The people behind GenClosers.", // UI copy
  founders: [
    {
      name: "Monish Aravind K",
      knownAs: "Mak on the course", // UI copy: the course page's "Live 1:1 with Mak"
      role: "Co-Founder and Managing Partner, GenClosers",
      photo: { src: "/about/monish-aravind-k.webp", width: 328, height: 330 },
      highlight: "Ex Sales Lead and Best Performer, FitX120 (GamieFitX), 1.5Cr+ revenue generated", // one bio line for home
      bio: [
        "Founder, Vorth Media",
        "Sales Consultant: ScreelX, Zorrofit, Nuke Marketing",
        "Ex Sales Lead and Best Performer, FitX120 (GamieFitX), 1.5Cr+ revenue generated",
      ],
    },
    {
      name: "Sethuraman A",
      knownAs: "",
      role: "Co-Founder and Executive Partner, GenClosers",
      photo: { src: "/about/sethuraman-a.webp", width: 324, height: 358 },
      highlight: "Helped businesses generate 20Cr+ cumulative revenue across niches", // one bio line for home
      bio: [
        "Chief Revenue Officer, Green Sigma",
        "Ex Chief Operating Officer, FitX120",
        "Sales Consultant: ScreelX, Ashtag, Nuke Marketing",
        "Helped businesses generate 20Cr+ cumulative revenue across niches",
        "Mentored 100+ top-performing sales professionals",
      ],
    },
  ],

  // UI copy: the two ways on
  next: {
    heading: "Start with the course, or talk to us.",
    course: "See the course",
    talk: "Talk to us on WhatsApp",
  },
} as const;
