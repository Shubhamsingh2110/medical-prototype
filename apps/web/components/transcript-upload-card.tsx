"use client";

import { useState } from "react";

type TranscriptUploadCardProps = {
  disabled?: boolean;
  onImport: (text: string) => Promise<void>;
};

const sampleTranscript = `Doctor: What brings you in today?
Patient: I have had fever and sore throat for three days.
Doctor: Are you also feeling fatigue or cough?
Patient: Yes, I feel weak and I have mild cough.
Doctor: Any breathing difficulty or chest pain?
Patient: No breathing difficulty and no chest pain.`;

export function TranscriptUploadCard({ disabled, onImport }: TranscriptUploadCardProps) {
  const [text, setText] = useState(sampleTranscript);

  async function handleImport() {
    if (!text.trim()) {
      return;
    }

    await onImport(text);
  }

  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Testing Upload
          </p>
          <h3 className="mt-2 text-xl font-semibold">Paste transcript text for AI report testing</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Use lines like `Doctor:` and `Patient:` so the backend can read both sides clearly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setText(sampleTranscript)}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
        >
          Load Sample
        </button>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        className="mt-5 min-h-64 w-full resize-y rounded-[1.1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 outline-none"
        placeholder="Doctor: ...&#10;Patient: ..."
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={disabled}
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Import Transcript Text
        </button>
      </div>
    </section>
  );
}
