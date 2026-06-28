"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../lib/api";
import type { CallType } from "../lib/types";

type Role = "doctor" | "patient";

const rtcConfiguration: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export function useConsultationCall({
  consultationId,
  role,
  callType,
}: {
  consultationId: string | null;
  role: Role;
  callType: CallType;
}) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const resetConnectionState = useCallback(() => {
    setRemoteStream(null);
    setIsConnected(false);
  }, []);

  const cleanup = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;

    socketRef.current?.disconnect();
    socketRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    pendingCandidatesRef.current = [];
    setLocalStream(null);
    resetConnectionState();
    setIsStarting(false);
  }, [resetConnectionState]);

  const flushPendingCandidates = useCallback(async () => {
    const peer = peerRef.current;
    if (!peer || !peer.remoteDescription) {
      return;
    }

    const pendingCandidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    await Promise.all(
      pendingCandidates.map((candidate) => peer.addIceCandidate(new RTCIceCandidate(candidate))),
    );
  }, []);

  const ensurePeer = useCallback(
    (stream: MediaStream) => {
      if (peerRef.current) {
        return peerRef.current;
      }

      const peer = new RTCPeerConnection(rtcConfiguration);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        const [mediaStream] = event.streams;
        if (mediaStream) {
          setRemoteStream(mediaStream);
          setIsConnected(true);
          setIsStarting(false);
        }
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate || !consultationId) {
          return;
        }

        socketRef.current?.emit("signal", {
          consultationId,
          data: {
            candidate: event.candidate,
          },
        });
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") {
          setIsConnected(true);
          setIsStarting(false);
          return;
        }

        if (
          peer.connectionState === "failed" ||
          peer.connectionState === "closed" ||
          peer.connectionState === "disconnected"
        ) {
          resetConnectionState();
        }
      };

      peerRef.current = peer;
      return peer;
    },
    [consultationId, resetConnectionState],
  );

  const start = useCallback(async () => {
    if (!consultationId) {
      return;
    }

    if (socketRef.current || peerRef.current || localStreamRef.current) {
      return;
    }

    try {
      setError(null);
      setIsStarting(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      const peer = ensurePeer(stream);
      const socket = io(API_BASE_URL, {
        transports: ["websocket"],
      });
      socketRef.current = socket;

      const createAndSendOffer = async () => {
        if (!consultationId || peer.signalingState !== "stable") {
          return;
        }

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("signal", {
          consultationId,
          data: {
            offer,
          },
        });
      };

      socket.on("connect", () => {
        socket.emit("join-room", {
          consultationId,
          role,
        });
      });

      socket.on("room-state", async ({ participants }: { participants: number }) => {
        if (role === "doctor" && participants > 1) {
          await createAndSendOffer();
        }
      });

      socket.on("participant-joined", async ({ role: joinedRole }: { role: Role }) => {
        if (role === "doctor" && joinedRole === "patient") {
          await createAndSendOffer();
        }
      });

      socket.on(
        "signal",
        async ({
          data,
        }: {
          data: {
            offer?: RTCSessionDescriptionInit;
            answer?: RTCSessionDescriptionInit;
            candidate?: RTCIceCandidateInit;
          };
        }) => {
          if (data.offer) {
            await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
            await flushPendingCandidates();

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("signal", {
              consultationId,
              data: {
                answer,
              },
            });
            return;
          }

          if (data.answer) {
            await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
            await flushPendingCandidates();
            return;
          }

          if (data.candidate) {
            if (peer.remoteDescription) {
              await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else {
              pendingCandidatesRef.current.push(data.candidate);
            }
          }
        },
      );

      socket.on("participant-left", () => {
        resetConnectionState();
      });
    } catch (cause) {
      cleanup();
      setError(cause instanceof Error ? cause.message : "Could not start the call.");
      throw cause;
    }
  }, [API_BASE_URL, callType, cleanup, consultationId, ensurePeer, flushPendingCandidates, resetConnectionState, role]);

  const stop = useCallback(() => {
    if (consultationId) {
      socketRef.current?.emit("leave-room", {
        consultationId,
      });
    }

    cleanup();
  }, [cleanup, consultationId]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isStarting,
    error,
    start,
    stop,
  };
}
