"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "../actions";
import { fieldClass } from "@/components/panel/PanelShell";
import { buttonClasses } from "@/components/ui/Button";
import { panel } from "@/content/panel";

export function NewBatch() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(10);
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-[1fr_11rem_6rem_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name || !date) return;
        start(async () => {
          // Batches start at midnight India time
          const r = await createBatch(name, `${date}T00:00:00+05:30`, seats);
          setErr(r.ok ? null : r.error ?? "Error");
          if (r.ok) {
            setName("");
            setDate("");
            router.refresh();
          }
        });
      }}
    >
      <label className="text-small text-mute-dark">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 1 January 2027" className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-small text-mute-dark">
        Starts
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-small text-mute-dark">
        Seats
        <input type="number" min={1} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className={`${fieldClass} mt-1`} />
      </label>
      <button disabled={pending} className={buttonClasses("signal", "md")}>
        {panel.admin.newBatch}
      </button>
      {err && <p className="text-small text-signal sm:col-span-4">{err}</p>}
    </form>
  );
}
