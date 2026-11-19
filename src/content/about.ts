// About page copy. Sources (owner, 2026-11-19): the sample website (hero line), the Mission and Vision
// text and the two founder bios pasted in chat, and the photos sent the same day. Mak = Monish Aravind K
// (owner confirmed). Lines marked "UI copy" are short interface labels written for the site.

export const about = {
  title: "About", // UI copy (nav + page title)
  // owner 2026-11-19: a hero that isn't the home one. The line is the YouTube channel's own description.
  heading: "Driven by a vision to teach sales as a life skill for every single Indian.",
  keep: "a life skill",
  // the hero photo: the owner's workshop picture (same file as the home proof wall)
  photo: { src: "/proof/workshop-1.webp", width: 682, height: 579, alt: "A GenClosers session: people around a long table listening to the speaker at a screen.", caption: "Workshop" },
  body: "Born in Tamil Nadu. Built for India. Transforming sales education by empowering individuals and businesses with the skills, systems and psychology to win in sales.",

  mission: {
    title: "Mission",
    items: [
      "Help businesses sell without losing the reason they started.",
      "Install a full 90-day sales system that doesn't depend on one person.",
      "Train individuals into confident closers through the GenClosers Sales Program: real practice, feedback, and certification.",
    ],
  },
  // Mission = today, Vision = tomorrow, shown as pairs (owner 2026-11-19): [mission item, vision item]
  pairs: [
    [0, 1],
    [1, 0],
    [2, 2],
  ],
  pairsHeading: "Mission and Vision.", // UI copy
  today: "Today", // UI copy
  tomorrow: "Tomorrow", // UI copy
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
      // the companies named in his bio, as tags
      brands: ["Vorth Media", "ScreelX", "Zorrofit", "Nuke Marketing", "FitX120"],
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
      brands: ["Green Sigma", "FitX120", "ScreelX", "Ashtag", "Nuke Marketing"],
      bio: [
        "Chief Revenue Officer, Green Sigma",
        "Ex Chief Operating Officer, FitX120",
        "Sales Consultant: ScreelX, Ashtag, Nuke Marketing",
        "Helped businesses generate 20Cr+ cumulative revenue across niches",
        "Mentored 100+ top-performing sales professionals",
      ],
    },
  ],

  // "In the room": the workshop photos and a few of the messages people sent (home.proofWall items)
  room: { heading: "In the room.", items: [1, 2, 3, 5, 4] }, // UI copy heading; indexes into home.proofWall.items
  // the ending is the home closing band (home.closing)
} as const;
