"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteActivity, saveActivity, type ActivityInput } from "../actions";
import { areaClass, fieldClass, Pill } from "@/components/panel/PanelShell";
import { buttonClasses } from "@/components/ui/Button";
import { panel } from "@/content/panel";

export type EditorActivity = ActivityInput & { id: string; is_sample: boolean };

const TYPES = [
  { v: "mcq", label: "Multiple choice" },
  { v: "repeat", label: "Repeat the line (speech)" },
  { v: "written", label: "Written answer" },
  { v: "recording", label: "Audio / video recording" },
] as const;

/** Edit one activity, or create a new one (when `activity` is not given). */
export function ActivityEditor({ moduleId, activity, nextPosition = 1 }: { moduleId: string; activity?: EditorActivity; nextPosition?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const cfg = (activity?.config ?? {}) as { options?: string[]; answer?: number; phrase?: string; rubric?: string };
  const [f, setF] = useState({
    type: activity?.type ?? "mcq",
    title: activity?.title ?? "",
    prompt: activity?.prompt ?? "",
    options: (cfg.options ?? ["", "", "", ""]).join("\n"),
    answer: cfg.answer ?? 0,
    phrase: cfg.phrase ?? "",
    rubric: cfg.rubric ?? "",
    max_points: activity?.max_points ?? 10,
    attempts_allowed: activity?.attempts_allowed ?? 3,
    ai_scoring: activity?.ai_scoring ?? false,
    published: activity?.published ?? true,
    position: activity?.position ?? nextPosition,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  if (!open) {
    return activity ? (
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-between gap-3 rounded-soft bg-ink-2 px-4 py-3 text-left text-small hover:bg-ink-3">
        <span className="flex items-center gap-3">
          {activity.is_sample && <Pill tone="warn">{panel.student.sample}</Pill>}
          {!activity.published && <Pill>Hidden</Pill>}
          <span className="font-medium">{activity.title}</span>
        </span>
        <span className="text-mute-dark">
          {TYPES.find((t) => t.v === activity.type)?.label} · {activity.max_points} pts
        </span>
      </button>
    ) : (
      <button onClick={() => setOpen(true)} className="text-small text-signal hover:underline">
        + {panel.admin.newActivity}
      </button>
    );
  }

  const save = () =>
    start(async () => {
      const config =
        f.type === "mcq"
          ? { options: f.options.split("\n").map((s) => s.trim()).filter(Boolean), answer: Number(f.answer) }
          : f.type === "repeat"
            ? { phrase: f.phrase.trim() }
            : { rubric: f.rubric.trim() };
      const r = await saveActivity({
        id: activity?.id,
        module_id: moduleId,
        position: Number(f.position),
        type: f.type,
        title: f.title.trim(),
        prompt: f.prompt.trim(),
        config,
        max_points: Number(f.max_points),
        ai_scoring: f.ai_scoring,
        attempts_allowed: Number(f.attempts_allowed),
        published: f.published,
      });
      setErr(r.ok ? null : r.error ?? "Error");
      if (r.ok) {
        setOpen(false);
        router.refresh();
      }
    });

  return (
    <div className="space-y-3 rounded-soft border border-ink-line bg-ink-2/50 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
        <label className="text-small text-mute-dark">
          Title
          <input value={f.title} onChange={(e) => set("title", e.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="text-small text-mute-dark">
          Type
          <select value={f.type} onChange={(e) => set("type", e.target.value as typeof f.type)} className={`${fieldClass} mt-1`}>
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-small text-mute-dark">
        Instructions for the student
        <textarea value={f.prompt} onChange={(e) => set("prompt", e.target.value)} rows={2} className={`${areaClass} mt-1`} />
      </label>

      {f.type === "mcq" && (
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
          <label className="text-small text-mute-dark">
            Options (one per line)
            <textarea value={f.options} onChange={(e) => set("options", e.target.value)} rows={4} className={`${areaClass} mt-1`} />
          </label>
          <label className="text-small text-mute-dark">
            Correct option (1, 2, 3...)
            <input type="number" min={1} value={Number(f.answer) + 1} onChange={(e) => set("answer", Number(e.target.value) - 1)} className={`${fieldClass} mt-1`} />
          </label>
        </div>
      )}
      {f.type === "repeat" && (
        <label className="block text-small text-mute-dark">
          The line the student must say
          <textarea value={f.phrase} onChange={(e) => set("phrase", e.target.value)} rows={2} className={`${areaClass} mt-1`} />
        </label>
      )}
      {(f.type === "written" || f.type === "recording") && (
        <label className="block text-small text-mute-dark">
          What a good answer includes (shown to you when grading)
          <textarea value={f.rubric} onChange={(e) => set("rubric", e.target.value)} rows={2} className={`${areaClass} mt-1`} />
        </label>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <label className="text-small text-mute-dark">
          Points
          <input type="number" min={1} value={f.max_points} onChange={(e) => set("max_points", Number(e.target.value))} className={`${fieldClass} mt-1 w-24`} />
        </label>
        <label className="text-small text-mute-dark">
          Attempts
          <input type="number" min={1} max={10} value={f.attempts_allowed} onChange={(e) => set("attempts_allowed", Number(e.target.value))} className={`${fieldClass} mt-1 w-24`} />
        </label>
        <label className="text-small text-mute-dark">
          Order
          <input type="number" min={1} value={f.position} onChange={(e) => set("position", Number(e.target.value))} className={`${fieldClass} mt-1 w-24`} />
        </label>
        <label className="flex items-center gap-2 pb-3 text-small">
          <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="accent-[var(--color-signal)]" /> Visible to students
        </label>
        {f.type === "written" && (
          <label className="flex items-center gap-2 pb-3 text-small">
            <input type="checkbox" checked={f.ai_scoring} onChange={(e) => set("ai_scoring", e.target.checked)} className="accent-[var(--color-signal)]" /> AI suggests a score
          </label>
        )}
      </div>

      {err && <p className="text-small text-signal">{err}</p>}
      <div className="flex flex-wrap gap-4">
        <button disabled={pending || !f.title || !f.prompt} onClick={save} className={buttonClasses("signal", "md")}>
          {panel.admin.save}
        </button>
        <button onClick={() => setOpen(false)} className="text-small text-mute-dark hover:text-paper">
          Cancel
        </button>
        {activity && (
          <button
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete "${activity.title}"? Student answers for it are deleted too.`)) return;
              start(async () => {
                await deleteActivity(activity.id);
                router.refresh();
              });
            }}
            className="ml-auto text-small text-signal hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
