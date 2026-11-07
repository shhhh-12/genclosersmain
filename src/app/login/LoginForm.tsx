"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { buttonClasses } from "@/components/ui/Button";
import { inputClass } from "@/components/panel/AuthCard";
import { panel } from "@/content/panel";

export function LoginForm() {
  const t = panel.login;
  const router = useRouter();
  const next = useSearchParams().get("next") || "/learn";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setMsg({ tone: "error", text: t.error });
    router.replace(next.startsWith("/") ? next : "/learn");
    router.refresh();
  };

  const forgot = async () => {
    if (!email.trim()) return setMsg({ tone: "error", text: t.needEmail });
    await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm?next=/set-password`,
    });
    setMsg({ tone: "ok", text: t.resetSent });
  };

  return (
    <form onSubmit={signIn} className="space-y-5">
      <label className="block text-small">
        {t.email}
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </label>
      <label className="block text-small">
        {t.password}
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </label>
      {msg && <p className={`text-small ${msg.tone === "error" ? "text-signal" : "text-paper"}`}>{msg.text}</p>}
      <button type="submit" disabled={busy} className={`${buttonClasses("signal", "lg")} w-full disabled:opacity-60`}>
        {t.submit}
      </button>
      <button type="button" onClick={forgot} className="block text-small text-mute-dark underline-offset-4 hover:text-paper hover:underline">
        {t.forgot}
      </button>
    </form>
  );
}
