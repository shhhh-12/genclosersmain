"use client";

/**
 * TESTING (owner 2026-11-19): a small switch (under the header on desktop, bottom right on phones so it
 * never covers the hero heading) that shows the whole site in Poppins
 * instead of Chillax. It sets <html data-font="poppins"> (globals.css swaps --font-display and
 * --font-body), remembers the choice in this browser, and `?font=poppins` / `?font=chillax` in a link
 * picks it too, so a test link can be shared. Remove this file, its two lines in app/layout.tsx and
 * the html[data-font] rule in globals.css once the font is decided.
 */

import { useSyncExternalStore } from "react";

const KEY = "gc-font";
type Font = "chillax" | "poppins";

/** Runs in <head> before the first paint: applies ?font= (then saves it and drops it from the URL, so the
 * switch wins on the next reload) or the saved choice. */
export const FONT_BOOT = `(function(){try{var q=new URLSearchParams(location.search).get("font");var f=q==="poppins"||q==="chillax"?q:localStorage.getItem("${KEY}");if(q){localStorage.setItem("${KEY}",q);var u=new URL(location.href);u.searchParams.delete("font");history.replaceState(history.state,"",u.pathname+u.search+u.hash);}if(f==="poppins")document.documentElement.dataset.font="poppins";}catch(e){}})();`;

// the <html data-font> attribute is the one source of truth (the boot script sets it before paint)
const read = (): Font => (document.documentElement.dataset.font === "poppins" ? "poppins" : "chillax");
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-font"] });
  return () => mo.disconnect();
};
function apply(f: Font) {
  const html = document.documentElement;
  if (f === "poppins") html.setAttribute("data-font", "poppins");
  else html.removeAttribute("data-font");
  try {
    localStorage.setItem(KEY, f);
  } catch {
    /* private mode: it just won't be remembered */
  }
}

export function FontSwitch() {
  const font = useSyncExternalStore(subscribe, read, () => "chillax" as Font);
  const pick = apply;

  return (
    <div
      role="group"
      aria-label="Test font"
      className="fixed right-3 bottom-24 z-[60] flex items-center lg:top-[5.25rem] lg:right-auto lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 gap-1 rounded-pill border border-ink-line bg-ink/85 p-1 font-mono text-label tracking-[0.08em] text-paper/70 uppercase shadow-[0_8px_24px_-12px_rgb(0_0_0/0.8)] backdrop-blur"
    >
      <span className="px-2">Font</span>
      {(["chillax", "poppins"] as const).map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={font === f}
          onClick={() => pick(f)}
          className={`cursor-pointer rounded-pill px-3 py-1.5 transition-colors duration-200 ${font === f ? "bg-signal text-signal-ink" : "hover:text-paper"}`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
