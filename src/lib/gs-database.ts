import "server-only";
import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

const connectionString = process.env.GS_DATABASE_URL;

if (!connectionString) {
  throw new Error("GS_DATABASE_URL is missing");
}

const ca = fs.readFileSync(
  path.join(
    process.cwd(),
    "certs",
    "gs-supabase-ca.crt"
  ),
  "utf8"
);

export const gsPool = new Pool({
  connectionString,

  ssl: {
    ca,
    rejectUnauthorized: true,
  },

  max: 3,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  statement_timeout: 10000,
});