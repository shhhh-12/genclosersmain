import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { applicationForm } from "@/content/form";
import { StatusControls } from "./StatusControls";

const LABELS: Record<string, string> = Object.fromEntries(applicationForm.fields.map((f) => [f.id, f.label]));
const COLS: [string, string][] = [
  ["fullName", "full_name"], ["whatsapp", "whatsapp"], ["email", "email"], ["occupation", "occupation"], ["goal", "goal"],
  ["experience", "experience"], ["seriousness", "seriousness"], ["decisionMaker", "decision_maker"], ["readiness", "readiness"],
];

export default async function ApplicationDetail({ params }: PageProps<"/admin/applications/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: a } = await sb.from("applications").select("*").eq("id", id).single();
  if (!a) notFound();
  const { data: batches } = await sb.from("batches").select("id, name, starts_at").order("starts_at");

  return (
    <div className="max-w-4xl">
      <Link href="/admin" className="eyebrow text-mute-dark hover:text-paper">
        ← Applications
      </Link>
      <h1 className="mt-4 font-display text-h2 font-semibold tracking-[-0.03em]">{a.full_name}</h1>
      <p className="mt-1 text-small text-mute-dark">
        {new Date(a.created_at).toLocaleString("en-IN")} · {a.utm_source || "direct"}
        {a.utm_campaign ? ` / ${a.utm_campaign}` : ""}
      </p>

      <StatusControls
        id={a.id}
        status={a.status}
        hasLogin={!!a.user_id}
        email={a.email}
        notes={a.notes ?? ""}
        batches={(batches ?? []).map((b) => ({ id: b.id, name: b.name }))}
      />

      <dl className="mt-10 grid gap-px overflow-hidden rounded-soft border border-ink-line bg-ink-line sm:grid-cols-2">
        {COLS.map(([formId, col]) => (
          <div key={col} className="bg-black p-5">
            <dt className="eyebrow text-mute-dark">{LABELS[formId]}</dt>
            <dd className="mt-2">{a[col] || "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
