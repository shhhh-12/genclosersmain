// The site's public address. Order: your own domain (NEXT_PUBLIC_SITE_URL), then the Vercel
// production / deployment address (set automatically by Vercel), then local dev.
const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/$/, "");
