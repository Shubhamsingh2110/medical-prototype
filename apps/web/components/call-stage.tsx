"use client";

import { useEffect, useRef } from "react";
import type { CallType } from "../lib/types";

type CallStageProps = {
  callType: CallType;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isStarting: boolean;
  onStart: () => Promise<void>;
  onStop: () => void;
  error: string | null;
  title: string;
};

export function CallStage({
  callType,
  localStream,
  remoteStream,
  isConnected,
  isStarting,
  onStart,
  onStop,
  error,
  title,
}: CallStageProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current && callType === "voice") {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [callType, remoteStream]);

  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Live Call
          </p>
          <h3 className="mt-2 text-xl font-semibold">{title}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
            isConnected
              ? "bg-emerald-100 text-emerald-800"
              : isStarting
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-200 text-slate-700"
          }`}
        >
          {isConnected ? "Connected" : isStarting ? "Connecting" : "Waiting"}
        </span>
      </div>

      <div className={`mt-5 grid gap-4 ${callType === "video" ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
        <div className="rounded-[1.4rem] bg-[#10261f] p-4 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f5c58b]">
            Your feed
          </p>
          {callType === "video" ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="mt-3 aspect-video w-full rounded-[1rem] bg-black object-cover"
            />
          ) : (
            <div className="mt-3 rounded-[1rem] bg-white/10 p-6 text-sm text-white/80">
              Microphone is used in voice-call mode.
            </div>
          )}
        </div>
        <div className="rounded-[1.4rem] bg-[var(--surface-strong)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Other participant
          </p>
          {callType === "video" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="mt-3 aspect-video w-full rounded-[1rem] bg-slate-200 object-cover"
            />
          ) : (
            <div className="mt-3 rounded-[1rem] bg-white p-6 text-sm text-[var(--muted)]">
              Audio will connect here after both sides join.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={isStarting || isConnected}
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
        >
          {isConnected ? "Call Connected" : isStarting ? "Connecting..." : "Start Call"}
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!localStream && !remoteStream}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold disabled:opacity-50"
        >
          Leave Call
        </button>
      </div>

      {callType === "voice" ? <audio ref={remoteAudioRef} autoPlay playsInline /> : null}

      {error ? (
        <p className="mt-4 rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
    </section>
  );
}
