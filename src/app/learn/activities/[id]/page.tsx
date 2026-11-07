import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { finalScore, type SubmissionRow } from "@/lib/scores";
import { Pill } from "@/components/panel/PanelShell";
import { panel } from "@/content/panel";
import { Player } from "./Player";

export default async function ActivityPage({ params }: PageProps<"/learn/activities/[id]">) {
  const { id } = await params;
  const me = await requireStudent();
  const t = panel.student;
  const sb = await supabaseServer();
  const { data: a } = await sb.from("activities").select("*, modules(number, title)").eq("id", id).eq("published", true).single();
  if (!a) notFound();
  const { data: subs } = await sb
    .from("submissions")
    .select("id, attempt, activity_id, student_id, auto_score, ai_score, admin_score, admin_feedback, ai_feedback, status, created_at")
    .eq("activity_id", id)
    .eq("student_id", me.id)
    .order("attempt");
  const mod = (Array.isArray(a.modules) ? a.modules[0] : a.modules) as { number: number; title: string };
  const tries = subs ?? [];

  // Never send the quiz answer to the browser
  const config = { ...(a.config ?? {}) } as Record<string, unknown>;
  delete config.answer;

  return (
    <div className="max-w-3xl">
      <Link href={`/learn/modules/${mod.number}`} className="eyebrow text-mute-dark hover:text-paper">
        ← M{String(mod.number).padStart(2, "0")} {mod.title}
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {a.is_sample && <Pill tone="warn">{t.sample}</Pill>}
        <span className="eyebrow text-mute-dark">
          {a.max_points} pts · {Math.max(0, a.attempts_allowed - tries.length)} {t.attemptsLeft}
        </span>
      </div>
      <h1 className="mt-3 font-display text-h2 font-semibold tracking-[-0.03em]">{a.title}</h1>
      <p className="mt-3 text-lead text-mute-dark">{a.prompt}</p>

      <div className="mt-10">
        <Player
          activity={{ id: a.id, type: a.type, config, maxPoints: a.max_points, studentId: me.id }}
          attemptsLeft={a.attempts_allowed - tries.length}
          nextAttempt={tries.length + 1}
        />
      </div>

      {tries.length > 0 && (
        <ol className="mt-12 space-y-2">
          {tries.map((s) => {
            const v = finalScore(s as SubmissionRow);
            const fb = s.admin_feedback || s.ai_feedback;
            return (
              <li key={s.id} className="rounded-soft border border-ink-line px-4 py-3 text-small">
                <span className="text-mute-dark">Attempt {s.attempt}</span> ·{" "}
                {s.status === "submitted" ? <span className="text-amber-200">{t.pending}</span> : <span className="font-mono text-signal">{v} / {a.max_points}</span>}
                {fb && <p className="mt-1 text-mute-dark">{t.feedback}: {fb}</p>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
