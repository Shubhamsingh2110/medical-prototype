import type { ConsultationRecord } from "../lib/types";

type ReportCardProps = {
  consultation: ConsultationRecord;
  canGenerate: boolean;
  busy: boolean;
  onGenerate: () => Promise<void>;
};

export function ReportCard({ consultation, canGenerate, busy, onGenerate }: ReportCardProps) {
  const summary =
    consultation.report?.summary ??
    consultation.report?.consultationSummary ??
    "Summary was not available in this report.";
  const observation =
    consultation.report?.observation ??
    consultation.report?.observationSummary ??
    consultation.report?.doctorObservations?.join(" ") ??
    "Observation was not available in this report.";
  const precaution =
    consultation.report?.precaution ??
    consultation.report?.precautions?.join(" ") ??
    consultation.report?.redFlags?.join(" ") ??
    "Precaution was not available in this report.";

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
      "Summary",
      summary,
      "",
      "Observation",
      observation,
      "",
      "Precaution",
      precaution,
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
          <h3 className="mt-2 text-xl font-semibold">Generate concise AI report</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The backend sends the saved transcript to AI and returns only summary, observation,
            and precaution.
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
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Model: {consultation.report.model}
            </p>
          </div>
          <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Summary
            </p>
            <p className="mt-2 text-sm leading-6">{summary}</p>
          </div>
          <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Observation
            </p>
            <p className="mt-2 text-sm leading-6">{observation}</p>
          </div>
          <div className="rounded-[1rem] bg-[var(--surface-strong)] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Precaution
            </p>
            <p className="mt-2 text-sm leading-6">{precaution}</p>
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
