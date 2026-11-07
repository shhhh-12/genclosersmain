"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gradeSubmission } from "../actions";
import { areaClass, fieldClass } from "@/components/panel/PanelShell";
import { buttonClasses } from "@/components/ui/Button";
import { panel } from "@/content/panel";

export function GradeForm({ id, max, suggested }: { id: string; max: number; suggested?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [score, setScore] = useState(suggested ?? 0);
  const [feedback, setFeedback] = useState("");
  return (
    <form
      className="mt-5 grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await gradeSubmission(id, Math.min(max, Math.max(0, score)), feedback);
          router.refresh();
        });
      }}
    >
      <label className="text-small text-mute-dark">
        {panel.admin.score} / {max}
        <input type="number" min={0} max={max} value={score} onChange={(e) => setScore(Number(e.target.value))} className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-small text-mute-dark">
        {panel.student.feedback}
        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={1} className={`${areaClass} mt-1`} />
      </label>
      <button disabled={pending} className={buttonClasses("signal", "md")}>
        {panel.admin.save}
      </button>
    </form>
  );
}
