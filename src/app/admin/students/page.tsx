import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { totalScore, type SubmissionRow } from "@/lib/scores";
import { panel } from "@/content/panel";
import { NewBatch } from "./NewBatch";

export default async function StudentsPage() {
  await requireAdmin();
  const sb = await supabaseServer();
  const [{ data: students }, { data: enrol }, { data: batches }, { data: subs }, { data: acts }] = await Promise.all([
    sb.from("profiles").select("id, full_name, whatsapp, created_at").eq("role", "student").order("created_at", { ascending: false }),
    sb.from("enrolments").select("student_id, batch_id, access_until"),
    sb.from("batches").select("id, name, starts_at, seats").order("starts_at"),
    sb.from("submissions").select("activity_id, student_id, auto_score, ai_score, admin_score, status"),
    sb.from("activities").select("id, max_points").eq("published", true),
  ]);
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));
  const maxTotal = (acts ?? []).reduce((t, a) => t + a.max_points, 0);
  const activityCount = acts?.length ?? 0;

  return (
    <div>
      <h1 className="font-display text-h2 font-semibold tracking-[-0.03em]">{panel.admin.students}</h1>

      <div className="mt-8 overflow-x-auto rounded-soft border border-ink-line">
        <table className="w-full min-w-[44rem] text-left text-small">
          <thead className="border-b border-ink-line text-mute-dark">
            <tr>
              {["Name", "WhatsApp", "Batch", "Access until", "Activities done", "Score"].map((h) => (
                <th key={h} className="eyebrow px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((s) => {
              const mine = (subs ?? []).filter((x) => x.student_id === s.id) as SubmissionRow[];
              const done = new Set(mine.map((x) => x.activity_id)).size;
              const e = (enrol ?? []).find((x) => x.student_id === s.id);
              return (
                <tr key={s.id} className="border-b border-ink-line/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{s.full_name || "-"}</td>
                  <td className="px-4 py-3">{s.whatsapp || "-"}</td>
                  <td className="px-4 py-3">{e ? batchName.get(e.batch_id) : "-"}</td>
                  <td className="px-4 py-3 text-mute-dark">{e?.access_until ? new Date(e.access_until).toLocaleDateString("en-IN") : "-"}</td>
                  <td className="px-4 py-3">
                    {done} / {activityCount}
                  </td>
                  <td className="px-4 py-3 font-mono text-signal">
                    {totalScore(mine)} / {maxTotal}
                  </td>
                </tr>
              );
            })}
            {!students?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-mute-dark">
                  No students yet. Mark an application as paid to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 font-display text-h3 font-semibold">{panel.admin.batches}</h2>
      <ul className="mt-4 space-y-2">
        {(batches ?? []).map((b) => {
          const n = (enrol ?? []).filter((x) => x.batch_id === b.id).length;
          return (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-soft border border-ink-line px-4 py-3 text-small">
              <span className="font-medium">{b.name}</span>
              <span className="text-mute-dark">
                {new Date(b.starts_at).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {n} / {b.seats} seats
              </span>
            </li>
          );
        })}
      </ul>
      <NewBatch />
    </div>
  );
}
