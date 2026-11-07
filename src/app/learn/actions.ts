"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { matchWords } from "@/lib/speech";

type Payload =
  | { kind: "mcq"; choice: number }
  | { kind: "repeat"; transcript: string }
  | { kind: "written"; text: string }
  | { kind: "recording"; filePath: string };

/**
 * Save one attempt. Runs on the server: checks the attempt limit and works out the automatic
 * score itself, so a student can't award themselves points from the browser.
 */
export async function submitActivity(activityId: string, payload: Payload) {
  const me = await requireStudent();
  const admin = supabaseAdmin();
  const { data: act } = await admin.from("activities").select("*").eq("id", activityId).eq("published", true).single();
  // A "repeat" line may also be answered with a recording (browsers without speech recognition).
  const typeOk = act && (act.type === payload.kind || (act.type === "repeat" && payload.kind === "recording"));
  if (!act || !typeOk) return { ok: false as const, error: "Activity not found." };

  const { count } = await admin.from("submissions").select("id", { count: "exact", head: true }).eq("activity_id", activityId).eq("student_id", me.id);
  const used = count ?? 0;
  if (used >= act.attempts_allowed) return { ok: false as const, error: "No attempts left." };

  let answer: Record<string, unknown> = {};
  let auto: number | null = null;
  let status: "submitted" | "scored" = "submitted";
  let filePath: string | null = null;

  if (payload.kind === "mcq") {
    answer = { choice: payload.choice };
    auto = payload.choice === act.config?.answer ? act.max_points : 0;
    status = "scored";
  } else if (payload.kind === "repeat") {
    const transcript = payload.transcript.slice(0, 2000);
    const { ratio } = matchWords(act.config?.phrase ?? "", transcript);
    answer = { transcript };
    auto = Math.round(ratio * act.max_points * 10) / 10;
    status = "scored";
  } else if (payload.kind === "written") {
    answer = { text: payload.text.slice(0, 6000) };
  } else {
    // Must be inside the student's own folder (the storage rules enforce the same)
    if (!payload.filePath.startsWith(`${me.id}/`)) return { ok: false as const, error: "Upload failed." };
    filePath = payload.filePath;
  }

  const { error } = await admin.from("submissions").insert({
    activity_id: activityId,
    student_id: me.id,
    attempt: used + 1,
    answer,
    file_path: filePath,
    auto_score: auto,
    status,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/learn");
  return { ok: true as const, score: auto, max: act.max_points as number, attemptsLeft: act.attempts_allowed - used - 1 };
}
