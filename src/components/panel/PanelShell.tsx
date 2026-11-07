import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { panel } from "@/content/panel";
import { site } from "@/content/site";

/** Frame for the student and admin panels: black, sidebar nav on desktop, top bar on phones. */
export function PanelShell({
  title,
  nav,
  who,
  children,
}: {
  title: string;
  nav: readonly { label: string; href: string }[];
  who: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-black md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-ink-line px-(--gutter) py-4 md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0 md:px-6 md:py-8">
        <div className="flex items-center justify-between gap-4 md:block">
          <Link href="/" className="flex items-center gap-2.5 text-paper">
            <LogoMark className="h-6 w-auto text-signal" title="" />
            <span className="font-display font-semibold">{site.name}</span>
          </Link>
          <p className="eyebrow text-signal md:mt-6">{title}</p>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto md:mt-8 md:flex-col" aria-label={title}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-pill px-4 py-2 text-small whitespace-nowrap text-mute-dark transition-colors hover:bg-ink-2 hover:text-paper md:rounded-soft"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 hidden md:absolute md:bottom-8 md:block">
          <p className="truncate text-small text-mute-dark">{who}</p>
          <form action="/auth/signout" method="post" className="mt-2">
            <button className="text-small text-paper underline-offset-4 hover:text-signal hover:underline">{panel.signOut}</button>
          </form>
        </div>
      </aside>
      <main className="px-(--gutter) py-8 md:px-10 md:py-10">
        {children}
        <form action="/auth/signout" method="post" className="mt-16 md:hidden">
          <button className="text-small text-mute-dark underline">{panel.signOut}</button>
        </form>
      </main>
    </div>
  );
}

/** Small coloured status pill. */
export function Pill({ children, tone = "mute" }: { children: ReactNode; tone?: "mute" | "signal" | "ok" | "warn" }) {
  const tones = {
    mute: "border-ink-line text-mute-dark",
    signal: "border-signal/60 bg-signal/10 text-signal",
    ok: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    warn: "border-amber-400/50 bg-amber-400/10 text-amber-200",
  } as const;
  return <span className={`eyebrow inline-flex rounded-pill border px-2.5 py-1 ${tones[tone]}`}>{children}</span>;
}

export const fieldClass =
  "block h-11 w-full rounded-soft border border-ink-line bg-ink-2 px-3 text-small text-paper focus:border-paper focus:outline-none";
export const areaClass =
  "block w-full rounded-soft border border-ink-line bg-ink-2 px-3 py-2.5 text-small text-paper focus:border-paper focus:outline-none";
