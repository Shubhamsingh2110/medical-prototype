import type {
  ConsultationRecord,
  CreateConsultationInput,
  ConsultationStatus,
  TranscriptSource,
  TranscriptSpeaker,
} from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Request failed.");
  }

  return (await response.json()) as T;
}

export function listConsultations() {
  return request<{ consultations: ConsultationRecord[] }>("/api/consultations");
}

export function createConsultation(input: CreateConsultationInput) {
  return request<ConsultationRecord>("/api/consultations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getConsultationById(consultationId: string) {
  return request<ConsultationRecord>(`/api/consultations/${consultationId}`);
}

export function getConsultationByInvite(inviteToken: string) {
  return request<ConsultationRecord>(`/api/consultations/invite/${inviteToken}`);
}

export function joinConsultation(inviteToken: string) {
  return request<ConsultationRecord>(`/api/consultations/invite/${inviteToken}/join`, {
    method: "POST",
  });
}

export function updateConsultationStatus(consultationId: string, status: ConsultationStatus) {
  return request<ConsultationRecord>(`/api/consultations/${consultationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function appendTranscript(
  consultationId: string,
  input: {
    speaker: TranscriptSpeaker;
    text: string;
    source: TranscriptSource;
  },
) {
  return request<ConsultationRecord>(`/api/consultations/${consultationId}/transcript`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function importTranscriptText(
  consultationId: string,
  input: {
    text: string;
    source: TranscriptSource;
  },
) {
  return request<ConsultationRecord>(`/api/consultations/${consultationId}/transcript/import`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function generateReport(consultationId: string) {
  return request<ConsultationRecord>(`/api/consultations/${consultationId}/report`, {
    method: "POST",
  });
}
