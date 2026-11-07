"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markPaid, saveNotes, setPasswordLink, setStatus } from "../../actions";
import { buttonClasses } from "@/components/ui/Button";
import { areaClass, fieldClass } from "@/components/panel/PanelShell";
import { panel } from "@/content/panel";

type Status = "new" | "qualified" | "paid" | "not_paid";

export function StatusControls({
  id,
  status,
  hasLogin,
  email,
  notes: initialNotes,
  batches,
}: {
  id: string;
  status: Status;
  hasLogin: boolean;
  email: string;
  notes: string;
  batches: { id: string; name: string }[];
}) {
  const t = panel.admin;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [batch, setBatch] = useState(batches[0]?.id ?? "");
  const [notes, setNotes] = useState(initialNotes);

  const run = (fn: () => Promise<{ ok: boolean; error?: string; link?: string }>, okMsg?: string) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? okMsg ?? null : r.error ?? "Something went wrong.");
      if (r.ok && r.link) {
        await navigator.clipboard.writeText(r.link).catch(() => {});
        setMsg(t.linkCopied);
      }
      router.refresh();
    });

  return (
    <div className="mt-8 rounded-soft border border-ink-line p-5 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {(["new", "qualified", "not_paid"] as const).map((s) => (
          <button
            key={s}
            disabled={pending || status === s}
            onClick={() => run(() => setStatus(id, s))}
            className={`rounded-pill border px-4 py-2 text-small transition-colors ${
              status === s ? "border-paper bg-paper text-ink" : "border-ink-line text-mute-dark hover:border-paper hover:text-paper"
            }`}
          >
            {t.statuses[s]}
          </button>
        ))}
        <button
          disabled={pending || status === "paid"}
          onClick={() => setConfirming(true)}
          className={`rounded-pill border px-4 py-2 text-small transition-colors ${
            status === "paid" ? "border-emerald-400 bg-emerald-400 text-ink" : "border-signal text-signal hover:bg-signal hover:text-signal-ink"
          }`}
        >
          {t.statuses.paid}
        </button>
        {hasLogin && (
          <button disabled={pending} onClick={() => run(() => setPasswordLink(id))} className="rounded-pill border border-ink-line px-4 py-2 text-small text-mute-dark hover:text-paper">
            {t.copyLink}
          </button>
        )}
      </div>

      {confirming && status !== "paid" && (
        <div className="mt-5 rounded-soft border border-signal/50 bg-signal/5 p-4">
          <p className="text-small">
            {t.confirmPaid} <strong>{email}</strong>?
          </p>
          <label className="mt-3 block max-w-xs text-small text-mute-dark">
            {t.batch}
            <select value={batch} onChange={(e) => setBatch(e.target.value)} className={`${fieldClass} mt-1`}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 flex gap-3">
            <button
              disabled={pending || !batch}
              onClick={() =>
                run(async () => {
                  const r = await markPaid(id, batch);
                  if (r.ok) setConfirming(false);
                  return r;
                }, t.sent)
              }
              className={buttonClasses("signal", "md")}
            >
              {t.statuses.paid}
            </button>
            <button onClick={() => setConfirming(false)} className="text-small text-mute-dark hover:text-paper">
              Cancel
            </button>
          </div>
        </div>
      )}

      {msg && <p className="mt-4 text-small text-paper">{msg}</p>}

      <label className="mt-6 block text-small text-mute-dark">
        {t.notes}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${areaClass} mt-1`} />
      </label>
      <button disabled={pending} onClick={() => run(() => saveNotes(id, notes), "Saved.")} className="mt-2 text-small text-paper hover:text-signal">
        {t.save}
      </button>
    </div>
  );
}
