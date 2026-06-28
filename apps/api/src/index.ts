import { createServer } from "node:http";
import { createApp } from "./app";
import { closeDatabaseConnection } from "./config/db";
import { env } from "./config/env";
import { createSocketServer } from "./sockets/consultation-socket";

const app = createApp();
const server = createServer(app);
createSocketServer(server, env.FRONTEND_ORIGIN);

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${env.PORT} is already in use. Change PORT in apps/api/.env or stop the running process.`,
    );
    process.exit(1);
  }

  console.error("API server failed to start.", error);
  process.exit(1);
});

server.listen(env.PORT, () => {
  console.log(`Medical prototype API listening on port ${env.PORT}`);
});

async function shutdown() {
  await closeDatabaseConnection();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
