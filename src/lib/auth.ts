import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export type Profile = { id: string; email: string; full_name: string; role: "student" | "admin" };

/** The signed-in user's profile, or null. */
export async function getProfile(): Promise<Profile | null> {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await sb.from("profiles").select("id, full_name, role").eq("id", data.user.id).single();
  if (!p) return null;
  return { id: p.id, full_name: p.full_name, role: p.role, email: data.user.email ?? "" };
}

export async function requireStudent() {
  const p = await getProfile();
  if (!p) redirect("/login?next=/learn");
  if (p.role !== "admin") {
    // 90-day access: one enrolment row must still be inside its window.
    const sb = await supabaseServer();
    const { data } = await sb
      .from("enrolments")
      .select("student_id")
      .eq("student_id", p.id)
      .gt("access_until", new Date().toISOString())
      .limit(1);
    if (!data?.length) redirect("/access-expired");
  }
  return p;
}

export async function requireAdmin() {
  const p = await getProfile();
  if (!p) redirect("/login?next=/admin");
  if (p.role !== "admin") redirect("/learn");
  return p;
}
