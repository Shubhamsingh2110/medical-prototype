import { randomUUID } from "node:crypto";
import type { TranscriptEntry, TranscriptSpeaker, TranscriptSource } from "../types/consultation";

type ParsedLine = {
  speaker: TranscriptSpeaker;
  text: string;
};

const speakerPatterns: Array<{
  speaker: TranscriptSpeaker;
  pattern: RegExp;
}> = [
  { speaker: "doctor", pattern: /^(doctor|dr\.?|doc|d|डॉक्टर)\s*[:\-]\s*/i },
  { speaker: "patient", pattern: /^(patient|pt|p|मरीज|रोगी)\s*[:\-]\s*/i },
];

function detectSpeaker(line: string, previousSpeaker: TranscriptSpeaker): ParsedLine {
  const trimmedLine = line.trim();

  for (const entry of speakerPatterns) {
    if (entry.pattern.test(trimmedLine)) {
      return {
        speaker: entry.speaker,
        text: trimmedLine.replace(entry.pattern, "").trim(),
      };
    }
  }

  return {
    speaker: previousSpeaker,
    text: trimmedLine,
  };
}

export function parseTranscriptText(rawText: string, source: TranscriptSource = "manual") {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries: TranscriptEntry[] = [];
  let previousSpeaker: TranscriptSpeaker = "patient";

  for (const line of lines) {
    const parsed = detectSpeaker(line, previousSpeaker);
    previousSpeaker = parsed.speaker;

    if (!parsed.text) {
      continue;
    }

    entries.push({
      id: randomUUID(),
      speaker: parsed.speaker,
      text: parsed.text.replace(/\s+/g, " ").trim(),
      source,
      createdAt: new Date().toISOString(),
    });
  }

  return entries;
}
