import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

type JoinPayload = {
  consultationId: string;
  role: "doctor" | "patient";
};

type SignalPayload = {
  consultationId: string;
  data: unknown;
};

export function createSocketServer(server: HttpServer, origin: string) {
  const io = new Server(server, {
    cors: {
      origin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", ({ consultationId, role }: JoinPayload) => {
      const roomId = `consultation:${consultationId}`;
      socket.join(roomId);
      socket.data.consultationId = consultationId;
      socket.data.role = role;

      const participants = Array.from(io.sockets.adapter.rooms.get(roomId) ?? []).length;
      socket.emit("room-state", {
        consultationId,
        participants,
        role,
      });

      socket.to(roomId).emit("participant-joined", {
        role,
      });
    });

    socket.on("signal", ({ consultationId, data }: SignalPayload) => {
      const roomId = `consultation:${consultationId}`;
      socket.to(roomId).emit("signal", {
        senderRole: socket.data.role,
        data,
      });
    });

    socket.on("leave-room", ({ consultationId }: { consultationId: string }) => {
      const roomId = `consultation:${consultationId}`;
      socket.leave(roomId);
      socket.to(roomId).emit("participant-left", {
        role: socket.data.role,
      });
    });

    socket.on("disconnect", () => {
      const consultationId = socket.data.consultationId as string | undefined;
      if (!consultationId) {
        return;
      }

      socket.to(`consultation:${consultationId}`).emit("participant-left", {
        role: socket.data.role,
      });
    });
  });

  return io;
}
