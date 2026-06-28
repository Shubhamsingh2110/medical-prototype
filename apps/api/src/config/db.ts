import { MongoClient } from "mongodb";
import { env } from "./env";

let client: MongoClient | null = null;

function getDatabaseName() {
  if (env.MONGODB_DB_NAME) {
    return env.MONGODB_DB_NAME;
  }

  try {
    const parsed = new URL(env.MONGODB_URI);
    const databaseName = parsed.pathname.replace("/", "").trim();
    return databaseName || "medical_prototype";
  } catch {
    return "medical_prototype";
  }
}

export async function getDatabase() {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
  }

  return client.db(getDatabaseName());
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
  }
}
