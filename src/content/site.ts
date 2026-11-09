import { SITE_URL } from "@/lib/site-url";
// Brand-wide copy and settings. Source: core content PDF + owner answers (2026-11-07).
// Lines marked "UI copy" are short interface labels written for the site, not from the PDF.

export const site = {
  name: "GenClosers",
  tagline: "Sales is not a talent. It is a system you can learn.",
  copyrightYear: 2026,
  // [[TODO: real domain]] Set NEXT_PUBLIC_SITE_URL in .env.local once you have one.
  url: SITE_URL,

  seo: {
    title: "GenClosers · Sales is not a talent. It is a system you can learn.",
    description:
      "Learn to take any conversation from hello to a closed deal, without pushing anyone. 21 modules, AI scored practice on every key skill, and a live 1:1 mock call to finish.",
  },

  whatsapp: {
    number: "917338970698",
    display: "+91 73389 70698",
    link: "https://wa.me/917338970698",
  },

  // UI copy: short interface labels
  ui: {
    watchWithSound: "Watch with sound",
    skipIntro: "Skip intro",
    seatsLabel: "10 seats per batch",
    stepsLabel: "Steps", // the "3 / 7" counter on the journey
    certified: "GenClosers Certified", // the certificate's name (core content: certificate)
    // UI copy: the sample certificate the journey sheet flips over to (course page)
    // UI copy: the curriculum shows a summary first (owner 2026-11-10)
    seeAllModules: (n: number) => `See all ${n} modules`,
    showSummary: "Show the summary",
    certificate: {
      title: "Certificate",
      subtitle: "of completion",
      presented: "Proudly presented to",
      name: "Your name",
      for: "for completing",
      date: "Date",
      signature: "Signature",
    },
    countdown: { days: "Days", hours: "Hours", minutes: "Mins", seconds: "Secs" },
  },

  nav: [
    // UI copy
    { label: "Courses", href: "/courses" },
  ],

  footer: {
    // UI copy
    legal: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
} as const;
