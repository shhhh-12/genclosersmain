"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for the browser (uses the public key; row-level security applies). */
export function supabaseBrowser() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
