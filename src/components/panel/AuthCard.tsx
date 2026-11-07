import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { GlassPanel } from "@/components/ui/Glass";
import { site } from "@/content/site";

/** Centered glass card on black for login / set-password. */
export function AuthCard({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-(--gutter) py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-2.5 text-paper">
          <LogoMark className="h-7 w-auto text-signal" title="" />
          <span className="font-display text-lg font-semibold">{site.name}</span>
        </Link>
        <GlassPanel>
          <div className="p-8 sm:p-10">
            <h1 className="font-display text-h2 font-semibold tracking-[-0.03em]">{title}</h1>
            <p className="mt-2 text-mute-dark">{intro}</p>
            <div className="mt-8">{children}</div>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}

export const inputClass =
  "mt-2 block h-12 w-full rounded-soft border border-ink-line bg-ink-2/80 px-4 text-paper placeholder:text-mute-dark/70 focus:border-paper focus:outline-none";
