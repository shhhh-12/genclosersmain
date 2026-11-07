import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FIELDS = [
  "fullName", "whatsapp", "email", "occupation", "goal", "experience", "seriousness", "decisionMaker", "readiness",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "page",
] as const;

const clip = (v: unknown, n = 500) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/**
 * Application form endpoint. Saves to Supabase (shown in the admin panel) and copies the
 * application to the Google Sheet as before. Succeeds if at least one of the two saves works.
 */
// Simple per-IP throttle: 5 submissions per 10 minutes (in memory, fine for one server).
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (throttled(ip)) return NextResponse.json({ ok: false, error: "too_many" }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true }); // spam trap

  const v = Object.fromEntries(FIELDS.map((k) => [k, clip(body[k])])) as Record<(typeof FIELDS)[number], string>;
  const email = v.email.toLowerCase();
  if (!v.fullName || !v.whatsapp || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || v.whatsapp.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  // Same email within 24 h: treat as already received.
  const since = new Date(Date.now() - 86400000).toISOString();
  const { data: dup } = await supabaseAdmin().from("applications").select("id").eq("email", email).gte("created_at", since).limit(1);
  if (dup?.length) return NextResponse.json({ ok: true });

  const [db, sheet] = await Promise.allSettled([
    supabaseAdmin()
      .from("applications")
      .insert({
        full_name: v.fullName, whatsapp: v.whatsapp, email,
        occupation: v.occupation, goal: v.goal, experience: v.experience, seriousness: v.seriousness,
        decision_maker: v.decisionMaker, readiness: v.readiness,
        utm_source: v.utm_source, utm_medium: v.utm_medium, utm_campaign: v.utm_campaign,
        utm_content: v.utm_content, utm_term: v.utm_term, page: v.page,
      })
      .then(({ error }) => {
        if (error) throw error;
      }),
    process.env.NEXT_PUBLIC_FORM_ENDPOINT
      ? fetch(process.env.NEXT_PUBLIC_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ ...v, email }),
        }).then((r) => r.json())
      : Promise.reject(new Error("no sheet")),
  ]);

  const ok = db.status === "fulfilled" || (sheet.status === "fulfilled" && (sheet.value as { ok?: boolean }).ok);
  if (db.status === "rejected") console.error("apply: supabase insert failed", db.reason);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
