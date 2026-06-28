import OpenAI from "openai";
import { env } from "../config/env";
import type { ConsultationRecord, MedicalReport } from "../types/consultation";

let client: OpenAI | null = null;

function getClient() {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  return client;
}

function buildPrompt(consultation: ConsultationRecord) {
  const transcript = consultation.transcript
    .map((entry, index) => `${index + 1}. ${entry.speaker.toUpperCase()}: ${entry.text}`)
    .join("\n");

  return [
    "Create a structured medical consultation report in JSON using both doctor and patient transcript references.",
    `Language: ${consultation.language}`,
    `Doctor: ${consultation.doctorName}`,
    `Patient: ${consultation.patientName}`,
    `Call type: ${consultation.callType}`,
    `Chief concern: ${consultation.chiefConcern}`,
    "Base the report on the transcript from both sides of the consultation.",
    "Return valid JSON with keys: reportTitle, consultationSummary, chiefComplaint, historyOfPresentIllness, symptoms, doctorObservations, patientStatements, assessment, carePlan, followUpInstructions, redFlags, transcriptHighlights.",
    "Do not invent information that is not supported by the transcript.",
    "If details are missing, clearly say they require doctor confirmation.",
    "Keep the style professional and clinically readable.",
    "Transcript:",
    transcript,
  ].join("\n");
}

function buildFallbackReport(consultation: ConsultationRecord): MedicalReport {
  const patientLines = consultation.transcript
    .filter((entry) => entry.speaker === "patient")
    .map((entry) => entry.text);
  const doctorLines = consultation.transcript
    .filter((entry) => entry.speaker === "doctor")
    .map((entry) => entry.text);
  const patientText = patientLines.join(" ");

  return {
    reportTitle: `Medical Consultation Report - ${consultation.patientName}`,
    consultationSummary:
      patientText || `${consultation.patientName} consulted for ${consultation.chiefConcern}.`,
    chiefComplaint: consultation.chiefConcern,
    historyOfPresentIllness:
      patientText || "Transcript is limited. More patient history is needed for a complete report.",
    symptoms: patientLines.length > 0 ? patientLines : [consultation.chiefConcern],
    doctorObservations: doctorLines.length > 0 ? doctorLines : ["Doctor observations need confirmation."],
    patientStatements: patientLines.length > 0 ? patientLines : ["Patient narrative is limited in the transcript."],
    assessment: "Draft report generated from the available transcript. Doctor confirmation is required.",
    carePlan: [
      "Review the transcript for missing details.",
      "Confirm duration and severity of symptoms.",
      "Finalize treatment and follow-up instructions.",
    ],
    followUpInstructions: "Advise follow-up if symptoms worsen or do not improve as expected.",
    redFlags: [
      "Escalate if serious symptoms are present or newly reported.",
      "Doctor should verify missing clinical details before final use.",
    ],
    transcriptHighlights: consultation.transcript
      .slice(0, 5)
      .map((entry) => `${entry.speaker}: ${entry.text}`),
    generatedAt: new Date().toISOString(),
    model: "fallback-report-generator",
  };
}

function parseJsonReport(text: string): Omit<MedicalReport, "generatedAt" | "model"> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[0]) as {
      reportTitle?: string;
      consultationSummary?: string;
      chiefComplaint?: string;
      historyOfPresentIllness?: string;
      symptoms?: string[];
      doctorObservations?: string[];
      patientStatements?: string[];
      assessment?: string;
      carePlan?: string[];
      followUpInstructions?: string;
      redFlags?: string[];
      transcriptHighlights?: string[];
    };

    if (
      typeof parsed.reportTitle !== "string" ||
      typeof parsed.consultationSummary !== "string" ||
      typeof parsed.chiefComplaint !== "string" ||
      typeof parsed.historyOfPresentIllness !== "string" ||
      !Array.isArray(parsed.symptoms) ||
      !Array.isArray(parsed.doctorObservations) ||
      !Array.isArray(parsed.patientStatements) ||
      typeof parsed.assessment !== "string" ||
      !Array.isArray(parsed.carePlan) ||
      typeof parsed.followUpInstructions !== "string" ||
      !Array.isArray(parsed.redFlags) ||
      !Array.isArray(parsed.transcriptHighlights)
    ) {
      return null;
    }

    return {
      reportTitle: parsed.reportTitle,
      consultationSummary: parsed.consultationSummary,
      chiefComplaint: parsed.chiefComplaint,
      historyOfPresentIllness: parsed.historyOfPresentIllness,
      symptoms: parsed.symptoms,
      doctorObservations: parsed.doctorObservations,
      patientStatements: parsed.patientStatements,
      assessment: parsed.assessment,
      carePlan: parsed.carePlan,
      followUpInstructions: parsed.followUpInstructions,
      redFlags: parsed.redFlags,
      transcriptHighlights: parsed.transcriptHighlights,
    };
  } catch {
    return null;
  }
}

export async function generateMedicalReport(consultation: ConsultationRecord) {
  const openai = getClient();

  if (!openai) {
    return buildFallbackReport(consultation);
  }

  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    input: buildPrompt(consultation),
  });

  const outputText =
    "output_text" in response && typeof response.output_text === "string"
      ? response.output_text
      : "";
  const parsed = parseJsonReport(outputText);

  if (!parsed) {
    return buildFallbackReport(consultation);
  }

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    model: env.OPENAI_MODEL,
  };
}
