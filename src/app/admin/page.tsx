import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { Pill } from "@/components/panel/PanelShell";
import { panel } from "@/content/panel";

type Status = keyof typeof panel.admin.statuses;
const tone = { new: "mute", qualified: "warn", paid: "ok", not_paid: "signal" } as const;

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = (typeof sp.status === "string" ? sp.status : "") as Status | "";
  const sb = await supabaseServer();
  let q = sb.from("applications").select("id, created_at, full_name, whatsapp, email, occupation, readiness, utm_source, status").order("created_at", { ascending: false }).limit(500);
  if (filter) q = q.eq("status", filter);
  const { data: rows } = await q;
  const { data: all } = await sb.from("applications").select("status");
  const counts = (all ?? []).reduce<Record<string, number>>((m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {});

  return (
    <div>
      <h1 className="font-display text-h2 font-semibold tracking-[-0.03em]">{panel.admin.applications}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin" className={`rounded-pill border px-4 py-2 text-small ${!filter ? "border-paper text-paper" : "border-ink-line text-mute-dark hover:text-paper"}`}>
          All · {all?.length ?? 0}
        </Link>
        {(Object.keys(panel.admin.statuses) as Status[]).map((s) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            className={`rounded-pill border px-4 py-2 text-small ${filter === s ? "border-paper text-paper" : "border-ink-line text-mute-dark hover:text-paper"}`}
          >
            {panel.admin.statuses[s]} · {counts[s] ?? 0}
          </Link>
        ))}
      </div>

      {!rows?.length ? (
        <p className="mt-10 text-mute-dark">{panel.admin.noApplications}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-soft border border-ink-line">
          <table className="w-full min-w-[52rem] text-left text-small">
            <thead className="border-b border-ink-line text-mute-dark">
              <tr>
                {["Date", "Name", "WhatsApp", "Email", "Occupation", "Ready to invest", "Source", "Status"].map((h) => (
                  <th key={h} className="eyebrow px-4 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="group border-b border-ink-line/60 last:border-0 hover:bg-ink-2">
                  <td className="px-4 py-3 whitespace-nowrap text-mute-dark">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/applications/${r.id}`} className="group-hover:text-signal">
                      {r.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a href={`https://wa.me/${r.whatsapp.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}`} target="_blank" rel="noopener noreferrer" className="hover:text-signal">
                      {r.whatsapp}
                    </a>
                  </td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3 text-mute-dark">{r.occupation}</td>
                  <td className="max-w-[14rem] px-4 py-3 text-mute-dark">{r.readiness}</td>
                  <td className="px-4 py-3 text-mute-dark">{r.utm_source || "-"}</td>
                  <td className="px-4 py-3">
                    <Pill tone={tone[r.status as Status]}>{panel.admin.statuses[r.status as Status]}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
