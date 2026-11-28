import pkg from "@next/env";
import pg from "pg";
import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import { mapRegistration } from "./gs-sync-mapping.mjs";

const { loadEnvConfig } = pkg;
const { Client } = pg;

loadEnvConfig(process.cwd(), true);

let mongo;
let postgres;
let transactionStarted = false;
let lockAcquired = false;

const projection = {
  _id: 1,
  firstName: 1,
  middleName: 1,
  surname: 1,
  grnumber: 1,
  registrationStatus: 1,
  branch: 1,
  gender: 1,
  role: 1,
  alsoParticipatesInCultural: 1,
  outdoorSports: 1,
  indoorSports: 1,
  jerseyNumber: 1,
  tshirt: 1,
  waist: 1,
  updatedAt: 1
};

try {
  const required = [
    "GS_MONGODB_URI",
    "GS_MONGODB_DB",
    "GS_MONGODB_COLLECTION",
    "GS_SYNC_DATABASE_URL"
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  const url = new URL(process.env.GS_SYNC_DATABASE_URL);

  for (const key of [
    "sslmode", "sslcert", "sslkey",
    "sslrootcert", "ssl"
  ]) {
    if (url.searchParams.has(key)) {
      throw new Error(`Unsafe SSL URL parameter: ${key}`);
    }
  }

  const ca = fs.readFileSync(
    path.join(
      process.cwd(),
      "certs",
      "gs-supabase-ca.crt"
    ),
    "utf8"
  );

  postgres = new Client({
    connectionString: process.env.GS_SYNC_DATABASE_URL,
    ssl: {
      ca,
      rejectUnauthorized: true
    },
    connectionTimeoutMillis: 30000,
    statement_timeout: 30000
  });

  await postgres.connect();

  const identity = await postgres.query(
    "SELECT current_user, session_user"
  );

  if (
    identity.rows[0].current_user !== "gs_sync_writer" ||
    identity.rows[0].session_user !== "gs_sync_writer"
  ) {
    throw new Error("Incorrect Supabase role");
  }

  console.log("PASS: Restricted Supabase connected");

  // Prevent simultaneous synchronization workers
  const lock = await postgres.query(
    "SELECT pg_try_advisory_lock(817204) AS locked"
  );

  if (!lock.rows[0].locked) {
    throw new Error("Another synchronization is running");
  }

  lockAcquired = true;

  // Keep dashboard access blocked
  const state = await postgres.query(`
    UPDATE public.sync_status
    SET status = 'syncing',
        last_attempt_at = NOW(),
        last_successful_sync = NULL,
        last_error = NULL,
        updated_at = NOW()
    WHERE sync_name = 'mongodb_registrations'
  `);

  if (state.rowCount !== 1) {
    throw new Error("Synchronization status missing");
  }

  mongo = new MongoClient(
    process.env.GS_MONGODB_URI,
    {
      serverSelectionTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false
    }
  );

  await mongo.connect();

  const db = mongo.db(process.env.GS_MONGODB_DB);

  const auth = await db.command({
    connectionStatus: 1
  });

  const users = auth.authInfo.authenticatedUsers;

  if (
    users.length !== 1 ||
    users[0].user !== "gs_sync_reader"
  ) {
    throw new Error("Incorrect MongoDB identity");
  }

  console.log("PASS: Restricted MongoDB connected");

  const collection = db.collection(
    process.env.GS_MONGODB_COLLECTION
  );

  const records = [];

  let total = 0;
  let excluded = 0;
  let unexpected = 0;

  for await (const doc of collection.find(
    {},
    { projection }
  )) {
    total++;

    const mapped = mapRegistration(doc);

    if (!mapped) {
      excluded++;

      if (
        typeof doc.branch === "string" &&
        doc.branch.trim()
      ) {
        unexpected++;
      }

      continue;
    }

    records.push(mapped);
  }

  if (unexpected > 0) {
    throw new Error("Unexpected mapping failures");
  }

  if (records.length === 0) {
    throw new Error("No eligible registrations found");
  }

  console.log("MongoDB documents:", total);
  console.log("Eligible registrations:", records.length);
  console.log("Excluded registrations:", excluded);

  await postgres.query("BEGIN");
  transactionStarted = true;

  const columns = [
    "mongo_id",
    "firstName",
    "middleName",
    "surname",
    "grnumber",
    "registrationStatus",
    "branch",
    "branch_id",
    "gender",
    "role",
    "alsoParticipatesInCultural",
    "outdoorSports",
    "indoorSports",
    "jerseyNumber",
    "tshirt",
    "waist",
    "source_updated_at"
  ];

  const columnNames = columns
    .map(c => `"${c}"`)
    .join(", ");

  const placeholders = columns
    .map((_, i) => `$${i + 1}`)
    .join(", ");

  const updates = columns
    .filter(c => c !== "mongo_id")
    .map(c => `"${c}" = EXCLUDED."${c}"`)
    .join(", ");

  const upsertQuery = `
    INSERT INTO public.registrations_viewer
      (${columnNames})
    VALUES (${placeholders})

    ON CONFLICT (mongo_id)
    DO UPDATE SET
      ${updates},
      synced_at = NOW()
  `;

  let processed = 0;

  for (const record of records) {
    const values = columns.map(
      column => record[column] ?? null
    );

    await postgres.query(upsertQuery, values);

    processed++;

    if (processed % 50 === 0) {
      console.log(
        `Processed ${processed}/${records.length}`
      );
    }
  }

  // Remove copies no longer eligible or present
  const validIds = records.map(r => r.mongo_id);

  const deleted = await postgres.query(`
    DELETE FROM public.registrations_viewer
    WHERE NOT (mongo_id = ANY($1::text[]))
  `, [validIds]);

  // Verify the final registration count
  const result = await postgres.query(`
    SELECT COUNT(*)::int AS total
    FROM public.registrations_viewer
  `);

  if (result.rows[0].total !== records.length) {
    throw new Error("Final registration count mismatch");
  }

  // Initial copy complete, but live sync not ready
  await postgres.query(`
    UPDATE public.sync_status
    SET status = 'offline',
        total_records = $1,
        records_deleted = $2,
        failed_records = 0,
        last_full_sync = NOW(),
        last_heartbeat_at = NOW(),
        last_successful_sync = NULL,
        resume_token = NULL,
        last_error = NULL,
        updated_at = NOW()
    WHERE sync_name = 'mongodb_registrations'
  `, [
    records.length,
    deleted.rowCount
  ]);

  await postgres.query("COMMIT");
  transactionStarted = false;

  console.log("\n--- INITIAL SYNC SUMMARY ---");

  console.table({
    sourceDocuments: total,
    eligibleRecords: records.length,
    excludedRecords: excluded,
    processedRecords: processed,
    removedCopies: deleted.rowCount,
    supabaseRecords: result.rows[0].total
  });

  console.log("PASS: Registration counts verified");
  console.log("PASS: Dashboard access remains blocked");
  console.log("INITIAL SYNC COMPLETED SUCCESSFULLY");

} catch (error) {
  if (postgres && transactionStarted) {
    await postgres.query("ROLLBACK").catch(() => {});
  }

  if (postgres && lockAcquired) {
    await postgres.query(`
      UPDATE public.sync_status
      SET status = 'error',
          last_successful_sync = NULL,
          last_error = 'Initial synchronization failed',
          updated_at = NOW()
      WHERE sync_name = 'mongodb_registrations'
    `).catch(() => {});
  }

  console.error("INITIAL SYNC FAILED:", {
    code: error.code ?? "UNKNOWN",
    message: "Check synchronization configuration"
  });

  process.exitCode = 1;

} finally {
  if (mongo) {
    await mongo.close();
  }

  if (postgres) {
    await postgres.end();
  }
}