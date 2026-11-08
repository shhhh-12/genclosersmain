"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/LogoMark";
import { getLenis } from "@/lib/scroll";
import { site } from "@/content/site";

/**
 * Header logo + name. Always goes home; if you are already on the home page it glides back to the top
 * instead of doing nothing. The mark and the name carry data attributes so the home hero can fly its
 * own mark into this slot (components/home/HeaderFlyer.tsx).
 */
export function BrandLink() {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      data-header-brand
      aria-label={`${site.name} home`}
      onClick={(e) => {
        if (pathname !== "/") return;
        e.preventDefault();
        const l = getLenis();
        if (l) l.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex items-center gap-2.5 text-paper"
    >
      <span data-header-mark className="flex">
        <LogoMark className="h-6 w-auto text-signal" title="" />
      </span>
      <span
        data-header-text
        className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em]"
      >
        {site.name}
      </span>
    </Link>
  );
}
