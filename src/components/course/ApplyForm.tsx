"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { applicationForm as f, type Field } from "@/content/form";
import { site } from "@/content/site";
import { WhatsApp } from "@/components/ui/Icons";
import { Txt } from "@/components/ui/Text";
import { buttonClasses } from "@/components/ui/Button";
import { ease, dur } from "@/lib/motion";

// Our own endpoint: saves to Supabase (admin panel) and copies to the Google Sheet.
const ENDPOINT = "/api/apply";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const UTM_STORE = "gc-utm";

type Values = Record<string, string>;

function validate(field: Field, value: string): string | null {
  const v = value.trim();
  if (!v) return field.type === "choice" ? "Please choose one." : "Please fill this in.";
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Please enter a valid email.";
  if (field.type === "tel" && v.replace(/\D/g, "").length < 10) return "Please enter a valid WhatsApp number.";
  return null;
}

/** Ad tracking: keep UTM tags from the landing URL for the whole visit. */
function readUtm(): Values {
  const out: Values = {};
  try {
    const stored = JSON.parse(sessionStorage.getItem(UTM_STORE) || "{}") as Values;
    Object.assign(out, stored);
  } catch {}
  const q = new URLSearchParams(window.location.search);
  let fresh = false;
  for (const k of UTM_KEYS) {
    const v = q.get(k);
    if (v) {
      out[k] = v;
      fresh = true;
    }
  }
  if (fresh) {
    try {
      sessionStorage.setItem(UTM_STORE, JSON.stringify(out));
    } catch {}
  }
  return out;
}

export function ApplyForm({ courseName }: { courseName: string }) {
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const utm = useRef<Values>({});
  const formRef = useRef<HTMLFormElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    utm.current = readUtm();
  }, []);

  const set = (id: string, v: string) => {
    setValues((s) => ({ ...s, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: null }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Record<string, string | null> = {};
    for (const field of f.fields) next[field.id] = validate(field, values[field.id] ?? "");
    setErrors(next);
    const firstBad = f.fields.find((x) => next[x.id]);
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad.id}"]`)?.focus();
      return;
    }
    if (!ENDPOINT) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const honeypot = (formRef.current?.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...values, ...utm.current, page: window.location.pathname, company: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      setStatus(data.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  const waLink = `${site.whatsapp.link}?text=${encodeURIComponent(`${f.success.whatsappText} ${courseName}.`)}`;

  if (status === "sent") {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, ease: ease.primary }}
        className="rounded-soft border border-ink-line bg-ink-2 p-8 sm:p-12"
        role="status"
      >
        <p className="font-display text-h2 font-semibold tracking-[-0.03em]">{f.success.heading}</p>
        <p className="mt-4 text-lead text-mute-dark">{f.success.body}</p>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className={`${buttonClasses("signal", "lg")} mt-8`}>
          <WhatsApp /> {f.success.whatsappLabel}
        </a>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-9" aria-describedby="form-status">
      {/* Spam trap, hidden from people */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {f.fields.map((field, idx) => {
        const err = errors[field.id];
        const errId = `${field.id}-err`;
        const label = (
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-[0.75rem] text-signal">{String(idx + 1).padStart(2, "0")}</span>
            <span className="font-display text-[1.125rem] font-medium">
              <Txt>{field.label}</Txt>
            </span>
          </span>
        );

        if (field.type === "choice") {
          return (
            <fieldset key={field.id} aria-invalid={!!err} aria-describedby={err ? errId : undefined}>
              <legend>{label}</legend>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {field.options.map((opt) => {
                  const checked = values[field.id] === opt;
                  return (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-start gap-3 rounded-soft border px-4 py-3.5 text-small transition-colors duration-200 ${
                        checked ? "border-signal bg-signal/10 text-paper" : "border-ink-line text-mute-dark hover:border-mute-dark hover:text-paper"
                      }`}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={checked}
                        onChange={() => set(field.id, opt)}
                        className="mt-[0.2em] h-4 w-4 shrink-0 accent-[var(--color-signal)]"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
              {err && (
                <p id={errId} className="mt-2 text-small text-signal">
                  {err}
                </p>
              )}
            </fieldset>
          );
        }

        return (
          <div key={field.id}>
            <label htmlFor={field.id}>{label}</label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              inputMode={field.type === "tel" ? "tel" : undefined}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={values[field.id] ?? ""}
              onChange={(e) => set(field.id, e.target.value)}
              onBlur={(e) => e.target.value && setErrors((s) => ({ ...s, [field.id]: validate(field, e.target.value) }))}
              aria-invalid={!!err}
              aria-describedby={err ? errId : undefined}
              className={`mt-3 block h-14 w-full rounded-soft border bg-ink-2 px-4 text-paper placeholder:text-mute-dark/70 transition-colors duration-200 focus:border-paper focus:outline-none ${
                err ? "border-signal" : "border-ink-line"
              }`}
            />
            {err && (
              <p id={errId} className="mt-2 text-small text-signal">
                {err}
              </p>
            )}
          </div>
        );
      })}

      <div className="space-y-4 border-t border-ink-line pt-8">
        <button type="submit" disabled={status === "sending"} className={`${buttonClasses("signal", "lg")} w-full disabled:opacity-60 sm:w-auto`}>
          {status === "sending" ? f.sendingLabel : f.submitLabel}
        </button>
        <div id="form-status" aria-live="polite">
          {status === "error" && (
            <p className="text-small text-signal">
              {f.error}{" "}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="underline">
                {site.whatsapp.display}
              </a>
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
