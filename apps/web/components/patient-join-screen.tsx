"use client";

import { useEffect, useState } from "react";
import {
  appendTranscript,
  getConsultationByInvite,
  joinConsultation,
  updateConsultationStatus,
} from "../lib/api";
import { CallStage } from "./call-stage";
import { TranscriptRecorder } from "./transcript-recorder";
import { useConsultationCall } from "../hooks/use-consultation-call";
import type { ConsultationRecord } from "../lib/types";

export function PatientJoinScreen({ inviteToken }: { inviteToken: string }) {
  const [consultation, setConsultation] = useState<ConsultationRecord | null>(null);
  const [joined, setJoined] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const call = useConsultationCall({
    consultationId: consultation?.id ?? null,
    role: "patient",
    callType: consultation?.callType ?? "video",
  });

  useEffect(() => {
    void loadConsultation();
  }, [inviteToken]);

  useEffect(() => {
    if (consultation?.patientJoinedAt || consultation?.status === "in_progress") {
      setJoined(true);
    }
  }, [consultation?.patientJoinedAt, consultation?.status]);

  useEffect(() => {
    if (!consultation?.id) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadConsultation();
    }, 3000);

    return () => window.clearInterval(timer);
  }, [consultation?.id]);

  async function loadConsultation() {
    try {
      const nextConsultation = await getConsultationByInvite(inviteToken);
      setConsultation(nextConsultation);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load invite.");
    }
  }

  async function handleJoin() {
    try {
      const nextConsultation = await joinConsultation(inviteToken);
      setConsultation(nextConsultation);
      setJoined(true);
      setFeedback("You joined the consultation. The doctor can begin the call.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not join consultation.");
    }
  }

  async function handleStartCall() {
    if (!consultation) {
      return;
    }

    try {
      await call.start();
      const updated = await updateConsultationStatus(consultation.id, "in_progress");
      setConsultation(updated);
      setJoined(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start call.");
    }
  }

  async function handleAppendTranscript(text: string, source: "manual" | "speech") {
    if (!consultation) {
      return;
    }

    const updated = await appendTranscript(consultation.id, {
      speaker: "patient",
      text,
      source,
    });
    setConsultation(updated);
  }

  if (!consultation) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-5 py-10">
        <div className="rounded-[1.6rem] border border-[var(--border)] bg-white/85 px-6 py-8 text-center shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
          <p className="text-sm text-[var(--muted)]">Loading invite...</p>
          {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-5 py-6 md:px-8 md:py-8">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="inline-flex rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--accent-strong)]">
          Patient invite
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Join your {consultation.callType} consultation with {consultation.doctorName}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Consultation language: {consultation.language}. Reason for visit: {consultation.chiefConcern}.
        </p>
        <div className="mt-5 rounded-[1.2rem] bg-[var(--surface-strong)] p-4">
          <p className="text-sm font-semibold">How to join</p>
          <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted)]">
            <p>1. Click `Join Consultation`.</p>
            <p>2. Allow microphone, and camera too if this is a video call.</p>
            <p>3. Click `Start Call` to connect with the doctor.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleJoin}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
          >
            Join Consultation
          </button>
        </div>
        {feedback ? <p className="mt-4 rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p> : null}
        {error ? <p className="mt-4 rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      </section>

      {joined ? (
        <>
          <CallStage
            callType={consultation.callType}
            localStream={call.localStream}
            remoteStream={call.remoteStream}
            isConnected={call.isConnected}
            isStarting={call.isStarting}
            onStart={handleStartCall}
            onStop={call.stop}
            error={call.error}
            title={`${consultation.patientName} consultation room`}
          />

          <TranscriptRecorder
            consultation={consultation}
            speaker="patient"
            readOnly={!joined}
            onAppend={handleAppendTranscript}
          />
        </>
      ) : (
        <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 text-sm leading-6 text-[var(--muted)] shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
          The call area and transcript recorder will appear after you join the consultation.
        </section>
      )}
    </main>
  );
}
