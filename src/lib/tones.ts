/**
 * Soft flat tints the owner asked for on illustrated cards and story art (never gradients).
 * Red (signal) stays for progress, the active step, checks and the mark.
 */
export const TONES = ["#f3c969", "#9dcba4", "#8ec1e0", "#f2a07b", "#b9d98c", "#9fb3c8", "#a8d5cf"] as const;

/** A tone mixed into paper (pct = how much of the tone). */
export const tint = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, var(--color-paper))`;
