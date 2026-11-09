export const INTRO_KEY = "gc-intro";

/**
 * TESTING: true = the intro plays on every page load.
 * Set to false before launch so it plays once per visit.
 */
export const INTRO_EVERY_LOAD = true;

/** Runs before first paint on the home page: decides whether the intro plays (never for reduced motion). */
export const introGateScript = `(function(){try{var d=document.documentElement;var every=${INTRO_EVERY_LOAD};var seen=!every&&sessionStorage.getItem('${INTRO_KEY}')==='1';var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.intro=(seen||rm)?'done':'play';}catch(e){document.documentElement.dataset.intro='done';}})();`;
