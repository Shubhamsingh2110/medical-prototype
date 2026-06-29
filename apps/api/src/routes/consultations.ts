import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import {
  appendTranscriptEntry,
  appendTranscriptEntries,
  createConsultation,
  findConsultationById,
  findConsultationByInviteToken,
  listConsultations,
  markPatientJoined,
  saveMedicalReport,
  updateConsultationStatus,
} from "../services/consultation-repository";
import { generateMedicalReport } from "../services/openai-report";
import { parseTranscriptText } from "../services/transcript-import";

const createConsultationSchema = z.object({
  doctorName: z.string().min(1),
  patientName: z.string().min(1),
  callType: z.enum(["voice", "video"]),
  language: z.enum(["english", "hindi"]),
  chiefConcern: z.string().min(1),
});

const addTranscriptSchema = z.object({
  speaker: z.enum(["doctor", "patient"]),
  text: z.string().min(1),
  source: z.enum(["manual", "speech"]),
});

const importTranscriptSchema = z.object({
  text: z.string().min(1),
  source: z.enum(["manual", "speech"]).default("manual"),
});

const updateStatusSchema = z.object({
  status: z.enum(["created", "patient_joined", "in_progress", "report_ready", "completed"]),
});

export const consultationsRouter = Router();

consultationsRouter.get("/", async (_request, response, next) => {
  try {
    const consultations = await listConsultations();
    response.status(200).json({ consultations });
  } catch (error) {
    next(error);
  }
});

consultationsRouter.post("/", async (request, response, next) => {
  try {
    const payload = createConsultationSchema.parse(request.body);
    const consultation = await createConsultation(payload);
    response.status(201).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.get("/invite/:inviteToken", async (request, response, next) => {
  try {
    const consultation = await findConsultationByInviteToken(request.params.inviteToken);

    if (!consultation) {
      response.status(404).json({ error: "Invite not found." });
      return;
    }

    response.status(200).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.post("/invite/:inviteToken/join", async (request, response, next) => {
  try {
    const consultation = await markPatientJoined(request.params.inviteToken);

    if (!consultation) {
      response.status(404).json({ error: "Invite not found." });
      return;
    }

    response.status(200).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.get("/:consultationId", async (request, response, next) => {
  try {
    const consultation = await findConsultationById(request.params.consultationId);

    if (!consultation) {
      response.status(404).json({ error: "Consultation not found." });
      return;
    }

    response.status(200).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.patch("/:consultationId/status", async (request, response, next) => {
  try {
    const payload = updateStatusSchema.parse(request.body);
    const consultation = await updateConsultationStatus(request.params.consultationId, payload.status);

    if (!consultation) {
      response.status(404).json({ error: "Consultation not found." });
      return;
    }

    response.status(200).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.post("/:consultationId/transcript", async (request, response, next) => {
  try {
    const payload = addTranscriptSchema.parse(request.body);
    const consultation = await appendTranscriptEntry(request.params.consultationId, {
      id: randomUUID(),
      speaker: payload.speaker,
      text: payload.text.replace(/\s+/g, " ").trim(),
      source: payload.source,
      createdAt: new Date().toISOString(),
    });

    if (!consultation) {
      response.status(404).json({ error: "Consultation not found." });
      return;
    }

    response.status(200).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.post("/:consultationId/transcript/import", async (request, response, next) => {
  try {
    const payload = importTranscriptSchema.parse(request.body);
    const entries = parseTranscriptText(payload.text, payload.source);

    if (entries.length === 0) {
      response.status(400).json({ error: "No usable transcript lines were found in the uploaded text." });
      return;
    }

    const consultation = await appendTranscriptEntries(request.params.consultationId, entries);

    if (!consultation) {
      response.status(404).json({ error: "Consultation not found." });
      return;
    }

    response.status(200).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.post("/:consultationId/report", async (request, response, next) => {
  try {
    const consultation = await findConsultationById(request.params.consultationId);

    if (!consultation) {
      response.status(404).json({ error: "Consultation not found." });
      return;
    }

    if (consultation.transcript.length === 0) {
      response.status(400).json({ error: "Add transcript entries before generating a report." });
      return;
    }

    const report = await generateMedicalReport(consultation);
    const updated = await saveMedicalReport(consultation.id, report);
    response.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});
