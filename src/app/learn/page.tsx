import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { bestByActivity, totalScore, type SubmissionRow } from "@/lib/scores";
import { Countdown } from "@/components/course/Countdown";
import { Arrow } from "@/components/ui/Icons";
import { panel } from "@/content/panel";

export default async function Dashboard() {
  const me = await requireStudent();
  const t = panel.student;
  const sb = await supabaseServer();
  const [{ data: modules }, { data: acts }, { data: subs }, { data: enrol }] = await Promise.all([
    sb.from("modules").select("id, number, title").order("number"),
    sb.from("activities").select("id, module_id, max_points").eq("published", true),
    sb.from("submissions").select("activity_id, student_id, auto_score, ai_score, admin_score, status").eq("student_id", me.id),
    sb.from("enrolments").select("batch_id, access_until, batches(name, starts_at)").eq("student_id", me.id).limit(1),
  ]);
  const mine = (subs ?? []) as SubmissionRow[];
  const done = new Set(mine.map((s) => s.activity_id));
  const best = bestByActivity(mine);
  const total = acts?.length ?? 0;
  const maxPoints = (acts ?? []).reduce((s, a) => s + a.max_points, 0);
  const pct = total ? Math.round((done.size / total) * 100) : 0;
  const batch = enrol?.[0]?.batches as { name: string; starts_at: string } | { name: string; starts_at: string }[] | undefined;
  const b = Array.isArray(batch) ? batch[0] : batch;

  return (
    <div className="max-w-5xl">
      <p className="eyebrow text-signal">{t.greeting}</p>
      <h1 className="mt-2 font-display text-h1 font-semibold tracking-[-0.035em]">{me.full_name || me.email}</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-soft border border-ink-line p-6">
          <p className="eyebrow text-mute-dark">{t.progress}</p>
          <p className="mt-3 font-display text-h2 font-semibold">{pct}%</p>
          <div className="mt-4 h-1.5 rounded-pill bg-ink-line">
            <div className="h-1.5 rounded-pill bg-signal" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-small text-mute-dark">
            {done.size} / {total} {t.activities}
          </p>
        </div>
        <div className="rounded-soft border border-ink-line p-6">
          <p className="eyebrow text-mute-dark">{t.score}</p>
          <p className="mt-3 font-display text-h2 font-semibold">
            {totalScore(mine)} <span className="text-mute-dark">/ {maxPoints}</span>
          </p>
        </div>
      </div>

      {b && (
        <div className="mt-4 rounded-soft border border-ink-line p-6">
          <Countdown startsAt={b.starts_at} label="Batch starts" dateLabel={b.name} size="compact" />
        </div>
      )}

      <h2 className="mt-14 font-display text-h3 font-semibold">{t.modules}</h2>
      <ol className="mt-4 divide-y divide-ink-line rounded-soft border border-ink-line">
        {(modules ?? []).map((m) => {
          const list = (acts ?? []).filter((a) => a.module_id === m.id);
          const d = list.filter((a) => done.has(a.id)).length;
          const pts = list.reduce((s, a) => s + (best.get(a.id) ?? 0), 0);
          return (
            <li key={m.id}>
              <Link href={`/learn/modules/${m.number}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-ink-2">
                <span className="w-10 font-mono text-small text-signal">M{String(m.number).padStart(2, "0")}</span>
                <span className="flex-1 font-display font-semibold group-hover:text-signal">{m.title}</span>
                <span className="text-small text-mute-dark">
                  {list.length ? `${d}/${list.length} · ${Math.round(pts)} pts` : "-"}
                </span>
                <span className="text-mute-dark transition-transform group-hover:translate-x-1 group-hover:text-signal">
                  <Arrow />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
