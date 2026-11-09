import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FIELDS = [
  "fullName", "whatsapp", "email", "occupation", "goal", "experience", "seriousness", "readiness",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "page",
] as const;

const clip = (v: unknown, n = 500) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/**
 * Application form endpoint, two steps.
 * - step 1 (name + WhatsApp): saved to Supabase at once so a half-finished form is still a lead
 *   (admin shows it as "Step 1 only"). Returns the row id. Never blocks the visitor if it fails.
 * - step 2 (everything): completes that row (or inserts a new one if step 1 didn't save) and copies
 *   the full application to the Google Sheet. Succeeds if at least one of the two saves works.
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

const WINDOW = 86400000; // 24 h

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
  if (!v.fullName || v.whatsapp.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  const since = new Date(Date.now() - WINDOW).toISOString();
  const utm = {
    utm_source: v.utm_source, utm_medium: v.utm_medium, utm_campaign: v.utm_campaign,
    utm_content: v.utm_content, utm_term: v.utm_term, page: v.page,
  };

  // ---- step 1: save the lead now
  if (body.step === 1) {
    try {
      const sb = supabaseAdmin();
      // same WhatsApp, unfinished, within 24 h: carry on with that row
      const { data: open } = await sb
        .from("applications").select("id")
        .eq("whatsapp", v.whatsapp).eq("email", "").gte("created_at", since)
        .order("created_at", { ascending: false }).limit(1);
      if (open?.length) return NextResponse.json({ ok: true, id: open[0].id });
      const { data, error } = await sb
        .from("applications")
        .insert({ full_name: v.fullName, whatsapp: v.whatsapp, email: "", ...utm })
        .select("id").single();
      if (error) throw error;
      return NextResponse.json({ ok: true, id: data.id });
    } catch (e) {
      console.error("apply step 1: save failed", e);
      return NextResponse.json({ ok: true, id: null }); // step 2 will insert the full row instead
    }
  }

  // ---- step 2: the full application
  const email = v.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  const id = typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
  const answers = {
    full_name: v.fullName, whatsapp: v.whatsapp, email,
    occupation: v.occupation, goal: v.goal, experience: v.experience, seriousness: v.seriousness,
    readiness: v.readiness,
  };

  const saveDb = async () => {
    const sb = supabaseAdmin();
    // Same email within 24 h: already received (drop the step-1 row so it isn't listed twice)
    const { data: dup } = await sb.from("applications").select("id").eq("email", email).gte("created_at", since).limit(1);
    if (dup?.length) {
      if (id) await sb.from("applications").delete().eq("id", id).eq("email", "");
      return;
    }
    if (id) {
      // only a fresh, unfinished step-1 row can be completed this way
      const { data, error } = await sb
        .from("applications").update(answers)
        .eq("id", id).eq("email", "").gte("created_at", since)
        .select("id");
      if (error) throw error;
      if (data?.length) return;
    }
    const { error } = await sb.from("applications").insert({ ...answers, ...utm });
    if (error) throw error;
  };

  const [db, sheet] = await Promise.allSettled([
    saveDb(),
    process.env.NEXT_PUBLIC_FORM_ENDPOINT
      ? fetch(process.env.NEXT_PUBLIC_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ ...v, email }),
        }).then((r) => r.json())
      : Promise.reject(new Error("no sheet")),
  ]);

  const ok = db.status === "fulfilled" || (sheet.status === "fulfilled" && (sheet.value as { ok?: boolean }).ok);
  if (db.status === "rejected") console.error("apply: supabase save failed", db.reason);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
