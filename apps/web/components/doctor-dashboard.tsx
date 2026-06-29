"use client";

import { useEffect, useMemo, useState } from "react";
import {
  appendTranscript,
  createConsultation,
  generateReport,
  getConsultationById,
  importTranscriptText,
  listConsultations,
  updateConsultationStatus,
} from "../lib/api";
import { CallStage } from "./call-stage";
import { ReportCard } from "./report-card";
import { TranscriptRecorder } from "./transcript-recorder";
import { TranscriptUploadCard } from "./transcript-upload-card";
import { useConsultationCall } from "../hooks/use-consultation-call";
import type { ConsultationRecord, CreateConsultationInput } from "../lib/types";

const initialForm: CreateConsultationInput = {
  doctorName: "Dr. Mehta",
  patientName: "Ananya Singh",
  callType: "video",
  language: "english",
  chiefConcern: "Fever, sore throat, and fatigue",
};

export function DoctorDashboard() {
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationRecord | null>(null);
  const [form, setForm] = useState<CreateConsultationInput>(initialForm);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const call = useConsultationCall({
    consultationId: activeConsultation?.id ?? null,
    role: "doctor",
    callType: activeConsultation?.callType ?? "video",
  });

  useEffect(() => {
    void loadConsultations();
  }, []);

  useEffect(() => {
    if (!activeConsultation) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshConsultation(activeConsultation.id);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [activeConsultation?.id]);

  const inviteLink = useMemo(() => {
    if (!activeConsultation || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/join/${activeConsultation.inviteToken}`;
  }, [activeConsultation]);

  async function loadConsultations() {
    try {
      const response = await listConsultations();
      setConsultations(response.consultations);
      if (!activeConsultation && response.consultations.length > 0) {
        setActiveConsultation(response.consultations[0]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load consultations.");
    }
  }

  async function refreshConsultation(consultationId: string) {
    try {
      const consultation = await getConsultationById(consultationId);
      setActiveConsultation(consultation);
      setConsultations((current) =>
        current.map((item) => (item.id === consultation.id ? consultation : item)),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not refresh consultation.");
    }
  }

  async function handleCreate() {
    try {
      setBusy("create");
      setError(null);
      const consultation = await createConsultation(form);
      setActiveConsultation(consultation);
      setConsultations((current) => [consultation, ...current]);
      setFeedback("Invite created. Copy the patient link and share it.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create consultation.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyInvite() {
    if (!inviteLink) {
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
    setFeedback("Invite link copied.");
  }

  async function handleShareInvite() {
    if (!inviteLink) {
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: "Medical consultation invite",
        text: `Join your consultation with ${activeConsultation?.doctorName ?? "the doctor"}.`,
        url: inviteLink,
      });
      setFeedback("Invite shared.");
      return;
    }

    await handleCopyInvite();
  }

  async function handleStartCall() {
    if (!activeConsultation) {
      return;
    }

    try {
      await call.start();
      const updated = await updateConsultationStatus(activeConsultation.id, "in_progress");
      setActiveConsultation(updated);
      setFeedback("Call started.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start call.");
    }
  }

  async function handleAppendTranscript(text: string, source: "manual" | "speech") {
    if (!activeConsultation) {
      return;
    }

    const updated = await appendTranscript(activeConsultation.id, {
      speaker: "doctor",
      text,
      source,
    });
    setActiveConsultation(updated);
    setConsultations((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  async function handleGenerateReport() {
    if (!activeConsultation) {
      return;
    }

    try {
      setBusy("report");
      const updated = await generateReport(activeConsultation.id);
      setActiveConsultation(updated);
      setConsultations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setFeedback("Medical report generated and saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate report.");
    } finally {
      setBusy(null);
    }
  }

  async function handleImportTranscriptText(text: string) {
    if (!activeConsultation) {
      return;
    }

    try {
      setBusy("import");
      setError(null);
      const updated = await importTranscriptText(activeConsultation.id, {
        text,
        source: "manual",
      });
      setActiveConsultation(updated);
      setConsultations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setFeedback("Transcript text imported. You can now generate the AI report.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not import transcript text.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-6 md:px-8 md:py-8">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--accent-strong)]">
              Doctor workspace
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Create an invite, start the consultation, record to text, and generate the report.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              This UI keeps the workflow simple: one doctor creates the link, one patient joins,
              and the transcript is saved in MongoDB before OpenAI prepares the medical report.
            </p>
          </div>

          <div className="rounded-[1.4rem] bg-[#10261f] px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-[#f5c58b]">Saved consultations</p>
            <p className="mt-2 text-3xl font-semibold">{consultations.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.44fr_0.56fr]">
        <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Create Invite
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              value={form.doctorName}
              onChange={(event) => setForm((current) => ({ ...current, doctorName: event.target.value }))}
              className="rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
              placeholder="Doctor name"
            />
            <input
              value={form.patientName}
              onChange={(event) => setForm((current) => ({ ...current, patientName: event.target.value }))}
              className="rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
              placeholder="Patient name"
            />
            <select
              value={form.callType}
              onChange={(event) =>
                setForm((current) => ({ ...current, callType: event.target.value as CreateConsultationInput["callType"] }))
              }
              className="rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="video">Video call</option>
              <option value="voice">Voice call</option>
            </select>
            <select
              value={form.language}
              onChange={(event) =>
                setForm((current) => ({ ...current, language: event.target.value as CreateConsultationInput["language"] }))
              }
              className="rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
          <textarea
            value={form.chiefConcern}
            onChange={(event) => setForm((current) => ({ ...current, chiefConcern: event.target.value }))}
            className="mt-4 min-h-28 w-full resize-none rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
            placeholder="Chief concern or reason for consultation"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy === "create"}
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy === "create" ? "Creating..." : "Create Invite"}
            </button>
            {inviteLink ? (
              <button
                type="button"
                onClick={handleCopyInvite}
                className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold"
              >
                Copy Invite Link
              </button>
            ) : null}
          </div>

          {inviteLink ? (
            <div className="mt-4 rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold">Patient invite link</p>
              <p className="mt-2 break-all text-sm text-[var(--muted)]">{inviteLink}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={inviteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#f2f7f6] px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Patient Page
                </a>
                <button
                  type="button"
                  onClick={handleShareInvite}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
                >
                  Share Invite
                </button>
              </div>
            </div>
          ) : null}
          {feedback ? <p className="mt-4 rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p> : null}
          {error ? <p className="mt-4 rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        </section>

        <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Recent Consultations
          </p>
          <div className="mt-4 space-y-3">
            {consultations.length === 0 ? (
              <div className="rounded-[1rem] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--muted)]">
                No consultations yet.
              </div>
            ) : null}
            {consultations.map((consultation) => (
              <button
                type="button"
                key={consultation.id}
                onClick={() => {
                  setError(null);
                  setFeedback(null);
                  setActiveConsultation(consultation);
                  void refreshConsultation(consultation.id);
                }}
                className={`w-full rounded-[1rem] border px-4 py-4 text-left transition ${
                  activeConsultation?.id === consultation.id
                    ? "border-[var(--accent)] bg-[var(--surface-strong)]"
                    : "border-[var(--border)] bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {consultation.patientName} with {consultation.doctorName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {consultation.callType} call in {consultation.language}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#10261f] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    {consultation.status.replace("_", " ")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>

      {activeConsultation ? (
        <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                How Patient Joins
              </p>
              <h3 className="mt-2 text-xl font-semibold">Simple patient flow</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                <p>1. Create the consultation invite.</p>
                <p>2. Copy or share the patient invite link.</p>
                <p>3. Patient opens the link, clicks `Join Consultation`, then clicks `Start Call`.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] bg-[var(--surface-strong)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Patient joined</p>
                <p className="mt-2 text-sm font-semibold">
                  {activeConsultation.patientJoinedAt ? "Yes" : "Waiting"}
                </p>
              </div>
              <div className="rounded-[1rem] bg-[var(--surface-strong)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Current status</p>
                <p className="mt-2 text-sm font-semibold capitalize">
                  {activeConsultation.status.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeConsultation ? (
        <>
          <CallStage
            callType={activeConsultation.callType}
            localStream={call.localStream}
            remoteStream={call.remoteStream}
            isConnected={call.isConnected}
            isStarting={call.isStarting}
            onStart={handleStartCall}
            onStop={call.stop}
            error={call.error}
            title={`${activeConsultation.patientName} consultation`}
          />

          <section className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
            <TranscriptRecorder
              consultation={activeConsultation}
              speaker="doctor"
              onAppend={handleAppendTranscript}
            />
            <ReportCard
              consultation={activeConsultation}
              canGenerate={activeConsultation.transcript.length > 0}
              busy={busy === "report"}
              onGenerate={handleGenerateReport}
            />
          </section>

          <TranscriptUploadCard
            disabled={busy === "import"}
            onImport={handleImportTranscriptText}
          />
        </>
      ) : null}
    </main>
  );
}
