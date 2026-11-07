import type { Metadata } from "next";
import { panel } from "@/content/panel";

export const metadata: Metadata = { title: "Access ended", robots: { index: false } };

export default function AccessExpired() {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center px-6">
      <div className="max-w-xl">
        <h1 className="font-display text-h2 font-semibold tracking-tight">{panel.expired.title}</h1>
        <p className="mt-4 text-body text-mute-dark">{panel.expired.body}</p>
        <form action="/auth/signout" method="post" className="mt-8">
          <button type="submit" className="font-mono text-label underline underline-offset-4">
            {panel.signOut}
          </button>
        </form>
      </div>
    </main>
  );
}
