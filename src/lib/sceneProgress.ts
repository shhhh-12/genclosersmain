// The India scene's one progress number (0..1), shared by the map (which drives it), the hero
// text that reads itself and the numbers that count up, so all three move together with the scroll.

type Listener = (p: number) => void;
const listeners = new Set<Listener>();
let last = 0;

export const sceneProgress = {
  emit(p: number) {
    if (p === last) return;
    last = p;
    listeners.forEach((f) => f(p));
  },
  on(f: Listener) {
    listeners.add(f);
    f(last);
    return () => void listeners.delete(f);
  },
};

/** The first screen holds still (and drives everything) on desktops and laptops at least 700px tall
 * (owner 2026-11-19: laptops too). When it is a bit taller than the window it holds with its foot on
 * screen (IndiaDots sets --pin-top), so only top padding sits under the header. */
export const SCENE_PINNED_QUERY = "(min-width: 1024px) and (min-height: 700px)";
export const scenePinned = () => typeof window !== "undefined" && window.matchMedia(SCENE_PINNED_QUERY).matches;
