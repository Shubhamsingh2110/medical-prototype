"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { ConsultationLanguage } from "../lib/types";

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type BrowserSpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: BrowserSpeechRecognitionResult[];
};

type BrowserSpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

function locale(language: ConsultationLanguage) {
  return language === "hindi" ? "hi-IN" : "en-IN";
}

export function useSpeechRecorder(onFinalTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const handleFinalTranscript = useEffectEvent(onFinalTranscript);

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
    setInterimText("");
  }, []);

  const start = useCallback(
    (language: ConsultationLanguage) => {
      const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

      if (!Recognition) {
        setError("Speech recognition is not available in this browser.");
        return;
      }

      stop();
      setError(null);

      const recognition = new Recognition();
      recognition.lang = locale(language);
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result[0]?.transcript?.trim();

          if (!transcript) {
            continue;
          }

          if (result.isFinal) {
            handleFinalTranscript(transcript);
          } else {
            interim = `${interim} ${transcript}`.trim();
          }
        }

        setInterimText(interim);
      };

      recognition.onerror = (event) => {
        setError(event.error ?? "Speech recognition failed.");
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText("");
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    },
    [handleFinalTranscript, stop],
  );

  return {
    supported,
    isRecording,
    interimText,
    error,
    start,
    stop,
  };
}

