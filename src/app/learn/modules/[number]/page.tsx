import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { bestByActivity, type SubmissionRow } from "@/lib/scores";
import { Pill } from "@/components/panel/PanelShell";
import { panel } from "@/content/panel";

const TYPE: Record<string, string> = { mcq: "Quiz", repeat: "Say it", written: "Write", recording: "Record" };

export default async function ModulePage({ params }: PageProps<"/learn/modules/[number]">) {
  const { number } = await params;
  const me = await requireStudent();
  const t = panel.student;
  const sb = await supabaseServer();
  const { data: mod } = await sb.from("modules").select("id, number, title").eq("number", Number(number)).single();
  if (!mod) notFound();
  const [{ data: acts }, { data: subs }] = await Promise.all([
    sb.from("activities").select("id, title, type, max_points, attempts_allowed, is_sample").eq("module_id", mod.id).eq("published", true).order("position"),
    sb.from("submissions").select("activity_id, student_id, auto_score, ai_score, admin_score, status").eq("student_id", me.id),
  ]);
  const mine = (subs ?? []) as SubmissionRow[];
  const best = bestByActivity(mine);

  return (
    <div className="max-w-3xl">
      <Link href="/learn" className="eyebrow text-mute-dark hover:text-paper">
        ← {t.back}
      </Link>
      <p className="mt-6 font-mono text-small text-signal">M{String(mod.number).padStart(2, "0")}</p>
      <h1 className="mt-1 font-display text-h2 font-semibold tracking-[-0.03em]">{mod.title}</h1>

      {!acts?.length && <p className="mt-8 text-mute-dark">{t.noActivities}</p>}
      <ul className="mt-8 space-y-3">
        {(acts ?? []).map((a) => {
          const tries = mine.filter((s) => s.activity_id === a.id);
          const waiting = tries.some((s) => s.status === "submitted");
          const left = a.attempts_allowed - tries.length;
          return (
            <li key={a.id}>
              <Link href={`/learn/activities/${a.id}`} className="group flex flex-wrap items-center gap-3 rounded-soft border border-ink-line px-5 py-4 hover:border-signal">
                <Pill tone="signal">{TYPE[a.type]}</Pill>
                {a.is_sample && <Pill tone="warn">{t.sample}</Pill>}
                <span className="flex-1 font-display font-semibold group-hover:text-signal">{a.title}</span>
                <span className="text-small text-mute-dark">
                  {waiting ? t.pending : best.has(a.id) ? `${t.best} ${best.get(a.id)}/${a.max_points}` : `${a.max_points} pts`} · {left > 0 ? `${left} ${t.attemptsLeft}` : t.noAttempts}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
