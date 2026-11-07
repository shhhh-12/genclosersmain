import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Handles links from Supabase emails:
 *  - invite / recovery links with ?token_hash=...&type=...  (invite template, see docs/stage2-plan.md)
 *  - PKCE links with ?code=...                                 (password reset started in the browser)
 * Signs the person in, then sends them on to `next` (default: set their password).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = url.searchParams.get("next") || "/set-password";
  const safeNext = next.startsWith("/") ? next : "/set-password";
  const sb = await supabaseServer();

  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");

  let ok = false;
  if (tokenHash && type) ok = !(await sb.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  else if (code) ok = !(await sb.auth.exchangeCodeForSession(code)).error;

  const dest = url.clone();
  dest.search = "";
  dest.pathname = ok ? safeNext : "/set-password";
  if (!ok) dest.searchParams.set("expired", "1");
  return NextResponse.redirect(dest);
}
