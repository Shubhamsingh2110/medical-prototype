"use client";

import { useState } from "react";
import { useSpeechRecorder } from "../hooks/use-speech-recorder";
import type { ConsultationLanguage, ConsultationRecord, TranscriptSpeaker } from "../lib/types";

type TranscriptRecorderProps = {
  consultation: ConsultationRecord;
  speaker: TranscriptSpeaker;
  readOnly?: boolean;
  onAppend: (text: string, source: "manual" | "speech") => Promise<void>;
};

export function TranscriptRecorder({
  consultation,
  speaker,
  readOnly,
  onAppend,
}: TranscriptRecorderProps) {
  const [manualText, setManualText] = useState("");
  const speech = useSpeechRecorder((text) => {
    void onAppend(text, "speech");
  });

  async function addManualText() {
    if (!manualText.trim()) {
      return;
    }

    await onAppend(manualText, "manual");
    setManualText("");
  }

  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Recording To Text
          </p>
          <h3 className="mt-2 text-xl font-semibold">Capture the conversation transcript</h3>
        </div>
        <span className="rounded-full bg-[#10261f] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          {consultation.language}
        </span>
      </div>

      <textarea
        value={manualText}
        onChange={(event) => setManualText(event.target.value)}
        disabled={readOnly}
        placeholder={
          consultation.language === "hindi"
            ? "यहां बातचीत का टेक्स्ट लिखें"
            : "Type the spoken conversation here"
        }
        className="mt-5 min-h-28 w-full resize-none rounded-[1.1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addManualText}
          disabled={readOnly}
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add Text
        </button>
        <button
          type="button"
          onClick={() => speech.start(consultation.language as ConsultationLanguage)}
          disabled={readOnly || !speech.supported || speech.isRecording}
          className="rounded-full bg-[#10261f] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Start Recording
        </button>
        <button
          type="button"
          onClick={speech.stop}
          disabled={!speech.isRecording}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          Stop Recording
        </button>
      </div>

      {speech.interimText ? (
        <p className="mt-4 rounded-[1rem] bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Listening: {speech.interimText}
        </p>
      ) : null}
      {speech.error ? (
        <p className="mt-4 rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {speech.error}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {consultation.transcript.length === 0 ? (
          <div className="rounded-[1rem] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--muted)]">
            No transcript yet. Start recording or add manual text.
          </div>
        ) : null}
        {consultation.transcript.map((entry) => (
          <div
            key={entry.id}
            className="rounded-[1rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold capitalize">{entry.speaker}</span>
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {entry.source}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">{entry.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

