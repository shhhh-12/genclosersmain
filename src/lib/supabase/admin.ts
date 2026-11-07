import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Full-access client (service role key). Server only, never sent to the browser.
 * Used for: saving applications, creating student logins, admin-only operations.
 * Every caller must check the user is an admin first (see requireAdmin in lib/auth.ts).
 */
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
