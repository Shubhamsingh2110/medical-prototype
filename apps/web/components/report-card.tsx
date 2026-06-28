import type { ConsultationRecord } from "../lib/types";

type ReportCardProps = {
  consultation: ConsultationRecord;
  canGenerate: boolean;
  busy: boolean;
  onGenerate: () => Promise<void>;
};

export function ReportCard({ consultation, canGenerate, busy, onGenerate }: ReportCardProps) {
  function downloadReport() {
    if (!consultation.report) {
      return;
    }

    const content = [
      consultation.report.reportTitle,
      "",
      `Generated At: ${consultation.report.generatedAt}`,
      `Model: ${consultation.report.model}`,
      "",
      "Consultation Summary",
      consultation.report.consultationSummary,
      "",
      "Chief Complaint",
      consultation.report.chiefComplaint,
      "",
      "History of Present Illness",
      consultation.report.historyOfPresentIllness,
      "",
      "Symptoms",
      ...consultation.report.symptoms.map((item) => `- ${item}`),
      "",
      "Doctor Observations",
      ...consultation.report.doctorObservations.map((item) => `- ${item}`),
      "",
      "Patient Statements",
      ...consultation.report.patientStatements.map((item) => `- ${item}`),
      "",
      "Assessment",
      consultation.report.assessment,
      "",
      "Care Plan",
      ...consultation.report.carePlan.map((item) => `- ${item}`),
      "",
      "Follow-up Instructions",
      consultation.report.followUpInstructions,
      "",
      "Red Flags",
      ...consultation.report.redFlags.map((item) => `- ${item}`),
      "",
      "Transcript Highlights",
      ...consultation.report.transcriptHighlights.map((item) => `- ${item}`),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${consultation.patientName.replace(/\s+/g, "-").toLowerCase()}-medical-report.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            AI Medical Report
          </p>
          <h3 className="mt-2 text-xl font-semibold">Generate report from saved transcript</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This uses the stored consultation transcript and sends it to the backend AI wrapper,
            which calls OpenAI to format the medical report.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || busy}
          className="rounded-full bg-[#10261f] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {consultation.report ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                  Report Title
                </p>
                <p className="mt-2 text-lg font-semibold">{consultation.report.reportTitle}</p>
              </div>
              <button
                type="button"
                onClick={downloadReport}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
              >
                Download Report
              </button>
            </div>
            <p className="mt-4 text-sm leading-6">{consultation.report.consultationSummary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Model: {consultation.report.model}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Chief Complaint
              </p>
              <p className="mt-2 text-sm leading-6">{consultation.report.chiefComplaint}</p>
            </div>
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                HPI
              </p>
              <p className="mt-2 text-sm leading-6">{consultation.report.historyOfPresentIllness}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Symptoms
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {consultation.report.symptoms.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Doctor Observations
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {consultation.report.doctorObservations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Patient Statements
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-6">
              {consultation.report.patientStatements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Assessment
            </p>
            <p className="mt-2 text-sm leading-6">{consultation.report.assessment}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Care Plan
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {consultation.report.carePlan.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Follow-up
              </p>
              <p className="mt-2 text-sm leading-6">{consultation.report.followUpInstructions}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Red Flags
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {consultation.report.redFlags.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                Transcript Highlights
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {consultation.report.transcriptHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[1rem] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--muted)]">
          Generate the report after at least one transcript entry has been saved.
        </div>
      )}
    </section>
  );
}
