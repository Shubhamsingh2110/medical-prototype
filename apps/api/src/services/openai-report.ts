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
    "Create a concise AI medical consultation report from the transcript reference.",
    `Language: ${consultation.language}`,
    `Doctor: ${consultation.doctorName}`,
    `Patient: ${consultation.patientName}`,
    `Call type: ${consultation.callType}`,
    `Chief concern: ${consultation.chiefConcern}`,
    "Use the transcript only as source material. Do not copy the script or include speaker-by-speaker dialogue.",
    "Return valid JSON with exactly these keys: reportTitle, summary, observation, precaution.",
    "summary must be 2 to 4 concise sentences about the main consultation context.",
    "observation must be 2 to 4 clinically useful sentences based on what the patient reported and what the doctor noted.",
    "precaution must be 3 to 5 concise practical precautions or suggestions, written as a short paragraph.",
    "Do not invent information that is not supported by the transcript.",
    "If details are missing, clearly say they require doctor confirmation.",
    "Keep the report short, professional, and easy for a doctor to review.",
    "Transcript:",
    transcript,
  ].join("\n");
}

function buildFallbackReport(consultation: ConsultationRecord): MedicalReport {
  const hasPatientInput = consultation.transcript.some((entry) => entry.speaker === "patient");
  const hasDoctorInput = consultation.transcript.some((entry) => entry.speaker === "doctor");

  return {
    reportTitle: `Medical Consultation Report - ${consultation.patientName}`,
    summary: `${consultation.patientName} consulted for ${consultation.chiefConcern}. This draft is based on the saved transcript and requires doctor review before use.`,
    observation:
      hasPatientInput || hasDoctorInput
        ? "The transcript contains consultation details from the saved conversation, but AI generation was unavailable. A doctor should verify symptoms, duration, severity, and any missing clinical findings."
        : "The transcript is limited, so reliable clinical observation cannot be produced without more consultation detail.",
    precaution:
      "Follow the doctor's final advice, avoid self-medication unless explicitly recommended, monitor symptom changes, and seek urgent care if severe or worsening symptoms appear.",
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
      summary?: string;
      observation?: string;
      precaution?: string;
    };

    if (
      typeof parsed.reportTitle !== "string" ||
      typeof parsed.summary !== "string" ||
      typeof parsed.observation !== "string" ||
      typeof parsed.precaution !== "string"
    ) {
      return null;
    }

    return {
      reportTitle: parsed.reportTitle,
      summary: parsed.summary,
      observation: parsed.observation,
      precaution: parsed.precaution,
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
