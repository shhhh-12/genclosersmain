"use client";

import Link from "next/link";
import { playTitleCard } from "./TitleCard";

/** A header link that changes page through the black title card (plain link for new tabs, same page, etc.). */
export function NavLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (window.location.pathname === href) return;
        if (playTitleCard(href, label)) e.preventDefault();
      }}
    >
      {label}
    </Link>
  );
}
