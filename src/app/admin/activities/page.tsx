import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { panel } from "@/content/panel";
import { ActivityEditor, type EditorActivity } from "./ActivityEditor";

export default async function ActivitiesPage() {
  await requireAdmin();
  const sb = await supabaseServer();
  const [{ data: modules }, { data: acts }] = await Promise.all([
    sb.from("modules").select("id, number, title").order("number"),
    sb.from("activities").select("*").order("position"),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-h2 font-semibold tracking-[-0.03em]">{panel.admin.activities}</h1>
      <p className="mt-2 text-small text-mute-dark">
        Types: multiple choice (scored instantly), repeat the line (scored by speech match), written answer and recording (you grade them in Grading). Items marked SAMPLE are placeholders.
      </p>
      <div className="mt-8 space-y-4">
        {(modules ?? []).map((m) => {
          const list = (acts ?? []).filter((a) => a.module_id === m.id) as EditorActivity[];
          return (
            <details key={m.id} className="group rounded-soft border border-ink-line" open={list.length > 0}>
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
                <span>
                  <span className="mr-3 font-mono text-small text-signal">M{String(m.number).padStart(2, "0")}</span>
                  <span className="font-display font-semibold">{m.title}</span>
                </span>
                <span className="text-small text-mute-dark">
                  {list.length} {panel.student.activities}
                </span>
              </summary>
              <div className="space-y-3 border-t border-ink-line p-5">
                {list.map((a) => (
                  <ActivityEditor key={a.id} moduleId={m.id} activity={a} />
                ))}
                <ActivityEditor moduleId={m.id} nextPosition={list.length + 1} />
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
