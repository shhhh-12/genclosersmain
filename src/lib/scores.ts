// Shared scoring rules for both panels.

export type SubmissionRow = {
  activity_id: string;
  student_id: string;
  auto_score: number | null;
  ai_score: number | null;
  admin_score: number | null;
  status: string;
};

/** The score that counts for one submission: admin's if given, else AI, else automatic. */
export function finalScore(s: SubmissionRow) {
  return s.admin_score ?? s.ai_score ?? s.auto_score ?? null;
}

/** Best score per activity (of up to 3 attempts), as a map activity_id -> score. */
export function bestByActivity(subs: SubmissionRow[]) {
  const m = new Map<string, number>();
  for (const s of subs) {
    const v = finalScore(s);
    if (v === null) continue;
    m.set(s.activity_id, Math.max(m.get(s.activity_id) ?? 0, Number(v)));
  }
  return m;
}

/** Total of best scores. */
export function totalScore(subs: SubmissionRow[]) {
  let t = 0;
  for (const v of bestByActivity(subs).values()) t += v;
  return Math.round(t);
}
