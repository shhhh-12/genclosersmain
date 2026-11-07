"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { submitActivity } from "../../actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { matchWords } from "@/lib/speech";
import { buttonClasses } from "@/components/ui/Button";
import { areaClass } from "@/components/panel/PanelShell";
import { panel } from "@/content/panel";

type Activity = { id: string; type: "mcq" | "repeat" | "written" | "recording"; config: Record<string, unknown>; maxPoints: number; studentId: string };
type Result = { ok: true; score: number | null; max: number; attemptsLeft: number } | { ok: false; error: string };

const t = panel.student;

export function Player({ activity, attemptsLeft, nextAttempt }: { activity: Activity; attemptsLeft: number; nextAttempt: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);

  const send = (payload: Parameters<typeof submitActivity>[1]) =>
    start(async () => {
      const r = await submitActivity(activity.id, payload);
      setResult(r);
      router.refresh();
    });

  if (attemptsLeft <= 0) return <p className="text-mute-dark">{t.noAttempts}</p>;

  return (
    <div>
      {activity.type === "mcq" && <Mcq options={(activity.config.options as string[]) ?? []} onSubmit={(choice) => send({ kind: "mcq", choice })} pending={pending} />}
      {activity.type === "repeat" && <Repeat phrase={String(activity.config.phrase ?? "")} onSubmit={(transcript) => send({ kind: "repeat", transcript })} pending={pending} fallback={<Recorder studentId={activity.studentId} activityId={activity.id} attempt={nextAttempt} onSubmit={(filePath) => send({ kind: "recording", filePath })} pending={pending} />} />}
      {activity.type === "written" && <Written onSubmit={(text) => send({ kind: "written", text })} pending={pending} />}
      {activity.type === "recording" && (
        <Recorder studentId={activity.studentId} activityId={activity.id} attempt={nextAttempt} onSubmit={(filePath) => send({ kind: "recording", filePath })} pending={pending} />
      )}

      {result && (
        <div className={`mt-6 rounded-soft border p-4 ${result.ok ? "border-ink-line" : "border-signal"}`} role="status">
          {!result.ok ? (
            <p className="text-signal">{result.error}</p>
          ) : result.score === null ? (
            <p>{t.pending}</p>
          ) : (
            <p className="font-display text-h3 font-semibold">
              <span className={result.score >= result.max * 0.7 ? "text-emerald-300" : "text-signal"}>{result.score >= result.max ? t.correct : result.score > 0 ? `${result.score}` : t.wrong}</span>{" "}
              <span className="text-mute-dark">
                {result.score} / {result.max}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Mcq({ options, onSubmit, pending }: { options: string[]; onSubmit: (i: number) => void; pending: boolean }) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {options.map((o, i) => (
        <button
          key={i}
          onClick={() => setChoice(i)}
          className={`block w-full rounded-soft border px-5 py-4 text-left transition-colors ${choice === i ? "border-signal bg-signal/10" : "border-ink-line hover:border-mute-dark"}`}
        >
          <span className="mr-3 font-mono text-small text-signal">{String.fromCharCode(65 + i)}</span>
          {o}
        </button>
      ))}
      <button disabled={choice === null || pending} onClick={() => choice !== null && onSubmit(choice)} className={`${buttonClasses("signal", "lg")} mt-3 disabled:opacity-50`}>
        {t.submit}
      </button>
    </div>
  );
}

type SR = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

/** Duolingo-style: say the line, see each word light up as it's recognised. */
function Repeat({ phrase, onSubmit, pending, fallback }: { phrase: string; onSubmit: (transcript: string) => void; pending: boolean; fallback: ReactNode }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [said, setSaid] = useState("");
  const rec = useRef<SR | null>(null);

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    const ok = !!Ctor;
    const id = window.setTimeout(() => setSupported(ok), 0);
    if (Ctor) {
      const r = new Ctor();
      r.lang = "en-IN";
      r.interimResults = true;
      r.continuous = true;
      r.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + " ";
        setSaid(text.trim());
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      rec.current = r;
    }
    return () => window.clearTimeout(id);
  }, []);

  const m = matchWords(phrase, said);
  const shown = phrase.split(/\s+/);

  return (
    <div>
      <p className="font-display text-h3 leading-snug font-semibold">
        {shown.map((w, i) => (
          <span key={i} className={`transition-colors duration-200 ${said ? (m.hit[i] ? "text-emerald-300" : "text-mute-dark") : ""}`}>
            {w}{" "}
          </span>
        ))}
      </p>
      {supported === false ? (
        <div className="mt-6">
          <p className="mb-4 text-small text-amber-200">{t.noSpeech}</p>
          {fallback}
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              if (!rec.current) return;
              if (listening) rec.current.stop();
              else {
                setSaid("");
                rec.current.start();
                setListening(true);
              }
            }}
            className={`flex h-20 w-20 items-center justify-center rounded-pill transition-transform ${listening ? "scale-110 bg-signal shadow-[0_0_40px_rgb(227_16_27/0.6)]" : "bg-paper text-ink hover:scale-105"}`}
            aria-label={listening ? t.stop : t.speak}
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden>
              <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-2.1a7 7 0 0 0 6-6.9h-2Z" />
            </svg>
          </button>
          <span className="text-small text-mute-dark">{listening ? t.listening : t.speak}</span>
        </div>
      )}
      {said && (
        <div className="mt-6">
          <p className="eyebrow text-mute-dark">{t.youSaid}</p>
          <p className="mt-2">{said}</p>
          <p className="mt-2 font-mono text-small text-signal">{Math.round(m.ratio * 100)}%</p>
          <button disabled={pending || listening} onClick={() => onSubmit(said)} className={`${buttonClasses("signal", "lg")} mt-4 disabled:opacity-50`}>
            {t.submit}
          </button>
        </div>
      )}
    </div>
  );
}

function Written({ onSubmit, pending }: { onSubmit: (text: string) => void; pending: boolean }) {
  const [text, setText] = useState("");
  return (
    <div>
      <label className="block text-small text-mute-dark">
        {t.write}
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className={`${areaClass} mt-2 text-body`} />
      </label>
      <button disabled={pending || text.trim().length < 3} onClick={() => onSubmit(text)} className={`${buttonClasses("signal", "lg")} mt-4 disabled:opacity-50`}>
        {t.submit}
      </button>
    </div>
  );
}

/** Record audio (or pick an audio/video file), upload to the private bucket, then submit. */
function Recorder({ studentId, activityId, attempt, onSubmit, pending }: { studentId: string; activityId: string; attempt: number; onSubmit: (path: string) => void; pending: boolean }) {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const mr = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | undefined>(undefined);

  const choose = (b: Blob) => {
    setBlob(b);
    setUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(b);
    });
  };

  const startRec = async () => {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        choose(new Blob(chunks.current, { type: r.mimeType || "audio/webm" }));
        setRecording(false);
      };
      r.start();
      mr.current = r;
      setRecording(true);
      timer.current = window.setTimeout(() => r.state === "recording" && r.stop(), 120000); // 2 minutes max
    } catch {
      setErr("Microphone access was blocked.");
    }
  };

  const upload = async () => {
    if (!blob) return;
    setBusy(true);
    const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("video") ? "webm" : blob.type.includes("mpeg") ? "mp3" : "webm";
    const path = `${studentId}/${activityId}/${attempt}-${Date.now()}.${ext}`;
    const { error } = await supabaseBrowser().storage.from("recordings").upload(path, blob, { contentType: blob.type || "audio/webm" });
    setBusy(false);
    if (error) return setErr(error.message);
    onSubmit(path);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <button onClick={() => (recording ? mr.current?.stop() : startRec())} className={buttonClasses(recording ? "signal" : "ghost-dark", "lg")}>
          {recording ? t.stop : t.record}
        </button>
        <label className="cursor-pointer text-small text-mute-dark underline-offset-4 hover:text-paper hover:underline">
          {t.upload}
          <input type="file" accept="audio/*,video/*" className="sr-only" onChange={(e) => e.target.files?.[0] && choose(e.target.files[0])} />
        </label>
      </div>
      {url && (blob?.type.startsWith("video") ? <video src={url} controls className="mt-6 w-full rounded-soft" /> : <audio src={url} controls className="mt-6 w-full" />)}
      {err && <p className="mt-4 text-small text-signal">{err}</p>}
      {blob && (
        <button disabled={busy || pending} onClick={upload} className={`${buttonClasses("signal", "lg")} mt-6 disabled:opacity-50`}>
          {busy ? t.uploading : t.submit}
        </button>
      )}
    </div>
  );
}
