import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Space_Mono, Patrick_Hand } from "next/font/google";
import { site } from "@/content/site";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TitleCard } from "@/components/layout/TitleCard";
import "./globals.css";

// Chillax variable (weights 200 to 700), self-hosted from /Fonts, preloaded.
const chillax = localFont({
  src: "./fonts/Chillax-Variable.woff2",
  variable: "--font-chillax",
  weight: "200 700",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});

// Space Mono is downloaded at build time and served from this site (no Google requests from visitors).
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Hand lettering for the hero's speech balloons (comic style), self-hosted at build time.
const hand = Patrick_Hand({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.seo.title,
    template: `%s · ${site.name}`,
  },
  description: site.seo.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${chillax.variable} ${spaceMono.variable} ${hand.variable}`}>
      <body className="min-h-dvh bg-ink text-paper">
        <SmoothScroll />
        <TitleCard />
        {children}
      </body>
    </html>
  );
}
