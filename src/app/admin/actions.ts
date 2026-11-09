"use server";

import { SITE_URL } from "@/lib/site-url";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Status = "new" | "qualified" | "paid" | "not_paid";

async function origin() {
  const h = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL || h.get("origin") || SITE_URL;
}

/** Change an application's status (new / qualified / not paid). "Paid" goes through markPaid. */
export async function setStatus(id: string, status: Exclude<Status, "paid">) {
  await requireAdmin();
  const sb = await supabaseServer();
  const { error } = await sb.from("applications").update({ status, status_changed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin");
  return { ok: !error, error: error?.message };
}

export async function saveNotes(id: string, notes: string) {
  await requireAdmin();
  const sb = await supabaseServer();
  const { error } = await sb.from("applications").update({ notes: notes.slice(0, 4000) }).eq("id", id);
  return { ok: !error, error: error?.message };
}

/**
 * Mark paid: create the student's login for the application email, send the welcome email with a
 * set-password link (Supabase invite), enrol them in the chosen batch with 90 days of access.
 */
export async function markPaid(id: string, batchId: string) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const { data: app, error: e1 } = await admin.from("applications").select("*").eq("id", id).single();
  if (e1 || !app) return { ok: false, error: "Application not found." };
  if (!app.email) return { ok: false, error: "No email yet (they only finished step 1). Ask for it on WhatsApp first." };
  const { data: batch } = await admin.from("batches").select("*").eq("id", batchId).single();
  if (!batch) return { ok: false, error: "Choose a batch." };

  // Seats: count other students already in this batch (re-marking the same student is fine).
  const { count } = await admin
    .from("enrolments")
    .select("student_id", { count: "exact", head: true })
    .eq("batch_id", batchId)
    .neq("student_id", app.user_id ?? "00000000-0000-0000-0000-000000000000");
  if ((count ?? 0) >= batch.seats) return { ok: false, error: "Batch is full." };

  const redirectTo = `${await origin()}/auth/confirm?next=/set-password`;
  let userId: string | null = app.user_id;
  if (!userId) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(app.email, {
      redirectTo,
      data: { full_name: app.full_name, whatsapp: app.whatsapp },
    });
    if (error) return { ok: false, error: `Couldn't send the invite: ${error.message}` };
    userId = data.user.id;
  }

  const access = new Date(new Date(batch.starts_at).getTime() + 90 * 86400000).toISOString();
  await admin.from("enrolments").upsert({ student_id: userId, batch_id: batchId, access_until: access });
  await admin
    .from("applications")
    .update({ status: "paid", status_changed_at: new Date().toISOString(), user_id: userId, invited_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
  return { ok: true };
}

/** A fresh set-password link the admin can send on WhatsApp (if the email didn't arrive). */
export async function setPasswordLink(id: string) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const { data: app } = await admin.from("applications").select("email, user_id").eq("id", id).single();
  if (!app?.user_id) return { ok: false, error: "Mark the application as paid first." };
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: app.email });
  if (error || !data.properties?.hashed_token) return { ok: false, error: error?.message ?? "No link." };
  const link = `${await origin()}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/set-password`;
  return { ok: true, link };
}

export async function createBatch(name: string, startsAt: string, seats: number) {
  await requireAdmin();
  const sb = await supabaseServer();
  const { error } = await sb.from("batches").insert({ name, starts_at: startsAt, seats });
  revalidatePath("/admin/students");
  return { ok: !error, error: error?.message };
}

export type ActivityInput = {
  id?: string;
  module_id: string;
  position: number;
  type: "mcq" | "repeat" | "written" | "recording";
  title: string;
  prompt: string;
  config: Record<string, unknown>;
  max_points: number;
  ai_scoring: boolean;
  attempts_allowed: number;
  published: boolean;
};

export async function saveActivity(input: ActivityInput) {
  await requireAdmin();
  const sb = await supabaseServer();
  const row = { ...input, is_sample: false };
  const { error } = input.id ? await sb.from("activities").update(row).eq("id", input.id) : await sb.from("activities").insert(row);
  revalidatePath("/admin/activities");
  return { ok: !error, error: error?.message };
}

export async function deleteActivity(id: string) {
  await requireAdmin();
  const sb = await supabaseServer();
  const { error } = await sb.from("activities").delete().eq("id", id);
  revalidatePath("/admin/activities");
  return { ok: !error, error: error?.message };
}

export async function gradeSubmission(id: string, score: number, feedback: string) {
  await requireAdmin();
  const sb = await supabaseServer();
  const { error } = await sb
    .from("submissions")
    .update({ admin_score: score, admin_feedback: feedback.slice(0, 4000), status: "scored" })
    .eq("id", id);
  revalidatePath("/admin/grading");
  return { ok: !error, error: error?.message };
}
