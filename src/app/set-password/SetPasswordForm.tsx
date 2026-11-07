"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { buttonClasses } from "@/components/ui/Button";
import { inputClass } from "@/components/panel/AuthCard";
import { panel } from "@/content/panel";

export function SetPasswordForm() {
  const t = panel.setPassword;
  const router = useRouter();
  const expired = useSearchParams().get("expired") === "1";
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [err, setErr] = useState<string | null>(expired ? t.error : null);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (a.length < 8) return setErr(t.tooShort);
    if (a !== b) return setErr(t.mismatch);
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: a });
    setBusy(false);
    if (error) return setErr(t.error);
    router.replace("/learn");
    router.refresh();
  };

  return (
    <form onSubmit={save} className="space-y-5">
      <label className="block text-small">
        {t.password}
        <input type="password" required autoComplete="new-password" value={a} onChange={(e) => setA(e.target.value)} className={inputClass} />
      </label>
      <label className="block text-small">
        {t.confirm}
        <input type="password" required autoComplete="new-password" value={b} onChange={(e) => setB(e.target.value)} className={inputClass} />
      </label>
      {err && <p className="text-small text-signal">{err}</p>}
      <button type="submit" disabled={busy} className={`${buttonClasses("signal", "lg")} w-full disabled:opacity-60`}>
        {t.submit}
      </button>
    </form>
  );
}
