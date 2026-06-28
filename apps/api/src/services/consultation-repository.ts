import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/db";
import type {
  ConsultationRecord,
  ConsultationStatus,
  MedicalReport,
  TranscriptEntry,
} from "../types/consultation";

type ConsultationDocument = Omit<ConsultationRecord, "id"> & {
  _id: ObjectId;
};

const COLLECTION_NAME = "consultations";

function toRecord(document: ConsultationDocument): ConsultationRecord {
  return {
    id: document._id.toString(),
    doctorName: document.doctorName,
    patientName: document.patientName,
    callType: document.callType,
    language: document.language,
    status: document.status,
    chiefConcern: document.chiefConcern,
    inviteToken: document.inviteToken,
    patientJoinedAt: document.patientJoinedAt,
    doctorJoinedAt: document.doctorJoinedAt,
    transcript: document.transcript ?? [],
    report: document.report ?? null,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

async function getCollection() {
  const database = await getDatabase();
  return database.collection<ConsultationDocument>(COLLECTION_NAME);
}

export async function createConsultation(input: {
  doctorName: string;
  patientName: string;
  callType: ConsultationRecord["callType"];
  language: ConsultationRecord["language"];
  chiefConcern: string;
}) {
  const collection = await getCollection();
  const timestamp = new Date().toISOString();

  const document: ConsultationDocument = {
    _id: new ObjectId(),
    doctorName: input.doctorName,
    patientName: input.patientName,
    callType: input.callType,
    language: input.language,
    chiefConcern: input.chiefConcern,
    status: "created",
    inviteToken: randomUUID(),
    patientJoinedAt: null,
    doctorJoinedAt: timestamp,
    transcript: [],
    report: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await collection.insertOne(document);
  return toRecord(document);
}

export async function listConsultations() {
  const collection = await getCollection();
  const documents = await collection.find().sort({ updatedAt: -1 }).limit(20).toArray();
  return documents.map(toRecord);
}

export async function findConsultationById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();
  const document = await collection.findOne({ _id: new ObjectId(id) });
  return document ? toRecord(document) : null;
}

export async function findConsultationByInviteToken(inviteToken: string) {
  const collection = await getCollection();
  const document = await collection.findOne({ inviteToken });
  return document ? toRecord(document) : null;
}

export async function markPatientJoined(inviteToken: string) {
  const collection = await getCollection();
  const timestamp = new Date().toISOString();
  const result = await collection.findOneAndUpdate(
    { inviteToken },
    {
      $set: {
        status: "patient_joined",
        patientJoinedAt: timestamp,
        updatedAt: timestamp,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toRecord(result) : null;
}

export async function updateConsultationStatus(id: string, status: ConsultationStatus) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: "after" },
  );

  return result ? toRecord(result) : null;
}

export async function appendTranscriptEntry(id: string, entry: TranscriptEntry) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();
  const timestamp = new Date().toISOString();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $push: {
        transcript: entry,
      },
      $set: {
        updatedAt: timestamp,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toRecord(result) : null;
}

export async function appendTranscriptEntries(id: string, entries: TranscriptEntry[]) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();
  const timestamp = new Date().toISOString();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $push: {
        transcript: {
          $each: entries,
        },
      },
      $set: {
        updatedAt: timestamp,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toRecord(result) : null;
}

export async function saveMedicalReport(id: string, report: MedicalReport) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();
  const timestamp = new Date().toISOString();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        report,
        status: "report_ready",
        updatedAt: timestamp,
      },
    },
    { returnDocument: "after" },
  );

  return result ? toRecord(result) : null;
}
