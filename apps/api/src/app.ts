import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { env } from "./config/env";
import { consultationsRouter } from "./routes/consultations";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/", (_request, response) => {
    response.json({
      name: "Medical Prototype API",
      message: "Consultation transcript and AI report orchestration service.",
    });
  });

  app.use("/health", healthRouter);
  app.use("/api/consultations", consultationsRouter);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        error: "Invalid request payload.",
        details: error.flatten(),
      });
      return;
    }

    response.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  });

  return app;
}
