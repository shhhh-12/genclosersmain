import { SITE_URL } from "@/lib/site-url";
// Brand-wide copy and settings. Source: core content PDF + owner answers (2026-11-07).
// Lines marked "UI copy" are short interface labels written for the site, not from the PDF.

export const site = {
  name: "GenClosers",
  tagline: "Sales is not a talent. It is a system you can learn.",
  // the footer line (owner 2026-11-19: one tagline across the home page and footer)
  footerLine: "Building India's Sales Revolution.",
  copyrightYear: 2026,
  // [[TODO: real domain]] Set NEXT_PUBLIC_SITE_URL in .env.local once you have one.
  url: SITE_URL,

  seo: {
    title: "GenClosers · Building India's Sales Revolution",
    description:
      "Learn to take any conversation from hello to a closed deal, without pushing anyone. 21 modules, AI scored practice on every key skill, and a live 1:1 mock call to finish.",
  },

  // owner's sample site (2026-11-19)
  email: "genclosers@gmail.com",
  instagram: { handle: "@genclosers", link: "https://www.instagram.com/genclosers/" },

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
      subtitle: "of achievement", // owner 2026-11-19: only for people who pass, so not "completion"
      presented: "Proudly presented to",
      name: "Your name",
      for: "for passing",
      onlyPassed: "Given only to students who pass the graded final mock call",
      date: "Date",
      signature: "Signature",
    },
    countdown: { days: "Days", hours: "Hours", minutes: "Mins", seconds: "Secs" },
    // UI copy (owner 2026-11-19: people mixed up the course list and a course's own page)
    allCourses: "All courses",
    allCoursesIntro: "Pick a course to open its page: the video, what you get, the price and how to apply.",
    breadcrumbLabel: "Breadcrumb",
  },

  nav: [
    // UI copy
    { label: "Courses", href: "/courses" },
    { label: "About", href: "/about" }, // owner 2026-11-19
  ],

  footer: {
    explore: "Explore", // UI copy: footer column
    allCourses: "All courses", // UI copy
    about: { label: "About", href: "/about" }, // UI copy
    // UI copy
    legal: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
} as const;
