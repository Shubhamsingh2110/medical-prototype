export type CallType = "voice" | "video";
export type ConsultationLanguage = "english" | "hindi";
export type ConsultationStatus =
  | "created"
  | "patient_joined"
  | "in_progress"
  | "report_ready"
  | "completed";
export type TranscriptSpeaker = "doctor" | "patient";
export type TranscriptSource = "manual" | "speech";

export type TranscriptEntry = {
  id: string;
  speaker: TranscriptSpeaker;
  text: string;
  source: TranscriptSource;
  createdAt: string;
};

export type MedicalReport = {
  reportTitle: string;
  summary?: string;
  observation?: string;
  precaution?: string;
  consultationSummary?: string;
  doctorScript?: string;
  patientScript?: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  symptoms?: string[];
  doctorObservations?: string[];
  patientStatements?: string[];
  observationSummary?: string;
  assessment?: string;
  carePlan?: string[];
  precautions?: string[];
  followUpInstructions?: string;
  redFlags?: string[];
  transcriptHighlights?: string[];
  generatedAt: string;
  model: string;
};

export type ConsultationRecord = {
  id: string;
  doctorName: string;
  patientName: string;
  callType: CallType;
  language: ConsultationLanguage;
  status: ConsultationStatus;
  chiefConcern: string;
  inviteToken: string;
  patientJoinedAt: string | null;
  doctorJoinedAt: string | null;
  transcript: TranscriptEntry[];
  report: MedicalReport | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateConsultationInput = {
  doctorName: string;
  patientName: string;
  callType: CallType;
  language: ConsultationLanguage;
  chiefConcern: string;
};
