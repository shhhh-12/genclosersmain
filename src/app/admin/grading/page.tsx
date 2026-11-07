import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { panel } from "@/content/panel";
import { GradeForm } from "./GradeForm";

export default async function GradingPage() {
  await requireAdmin();
  const sb = await supabaseServer();
  const { data: subs } = await sb
    .from("submissions")
    .select("id, attempt, answer, file_path, ai_score, ai_feedback, created_at, student_id, activity_id, activities(title, type, prompt, config, max_points), profiles(full_name)")
    .eq("status", "submitted")
    .order("created_at");

  // Short-lived links so the admin can play recordings from the private bucket
  const storage = supabaseAdmin().storage.from("recordings");
  const urls = new Map<string, string>();
  const withFiles = (subs ?? []).filter((s) => s.file_path);
  if (withFiles.length) {
    const { data } = await storage.createSignedUrls(withFiles.map((s) => s.file_path as string), 60 * 60);
    for (const row of data ?? []) {
      const s = withFiles.find((x) => x.file_path === row.path);
      if (s && row.signedUrl) urls.set(s.id, row.signedUrl);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-h2 font-semibold tracking-[-0.03em]">{panel.admin.grading}</h1>
      {!subs?.length && <p className="mt-8 text-mute-dark">{panel.admin.nothingToGrade}</p>}
      <div className="mt-8 space-y-5">
        {(subs ?? []).map((s) => {
          const a = (Array.isArray(s.activities) ? s.activities[0] : s.activities) as { title: string; type: string; prompt: string; config: { rubric?: string }; max_points: number } | null;
          const who = (Array.isArray(s.profiles) ? s.profiles[0] : s.profiles) as { full_name: string } | null;
          const answer = s.answer as { text?: string; transcript?: string };
          const url = urls.get(s.id);
          return (
            <article key={s.id} className="rounded-soft border border-ink-line p-5">
              <p className="eyebrow text-mute-dark">
                {who?.full_name || "Student"} · attempt {s.attempt} · {new Date(s.created_at).toLocaleString("en-IN")}
              </p>
              <h2 className="mt-2 font-display text-h3 font-semibold">{a?.title}</h2>
              <p className="mt-1 text-small text-mute-dark">{a?.prompt}</p>
              {a?.config?.rubric && <p className="mt-2 text-small text-mute-dark">Look for: {a.config.rubric}</p>}
              {answer.text && <p className="mt-4 rounded-soft bg-ink-2 p-4 whitespace-pre-wrap">{answer.text}</p>}
              {url && (s.file_path?.endsWith(".mp4") || s.file_path?.includes("video") ? <video src={url} controls className="mt-4 w-full rounded-soft" /> : <audio src={url} controls className="mt-4 w-full" />)}
              {s.ai_score !== null && (
                <p className="mt-3 text-small">
                  AI suggests <span className="font-mono text-signal">{s.ai_score}</span> / {a?.max_points}
                  {s.ai_feedback ? ` · ${s.ai_feedback}` : ""}
                </p>
              )}
              <GradeForm id={s.id} max={a?.max_points ?? 10} suggested={s.ai_score ?? undefined} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
