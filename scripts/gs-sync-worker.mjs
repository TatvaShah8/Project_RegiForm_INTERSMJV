import pkg from "@next/env";
import pg from "pg";
import { MongoClient, BSON } from "mongodb";
import fs from "node:fs";
import path from "node:path";

import {
  PROJECTION,
  upsertRegistration,
  processChange
} from "./gs-sync-operations.mjs";

import {
  mapRegistration
} from "./gs-sync-mapping.mjs";

import {
  loadResumeToken,
  requiresFullReconciliation,
  recordRecovery
} from "./gs-sync-recovery.mjs";

const { loadEnvConfig } = pkg;
const { Client } = pg;

loadEnvConfig(process.cwd(), true);

let mongo;
let postgres;
let stream;

let stopping = false;
let lockAcquired = false;
let transactionStarted = false;

const SYNC_NAME = "mongodb_registrations";
const LOCK_ID = 817204;

process.on("SIGINT", () => {
  stopping = true;
});

process.on("SIGTERM", () => {
  stopping = true;
});

async function saveCheckpoint(token) {
  if (!token) {
    throw new Error("Missing resume token");
  }

  const serialized = BSON.EJSON.stringify(
    token,
    { relaxed: false }
  );

  const result = await postgres.query(`
    UPDATE public.sync_status
    SET resume_token = $1::jsonb,
        last_checkpoint_at = NOW(),
        last_event_at = NOW(),
        last_heartbeat_at = NOW(),
        updated_at = NOW()
    WHERE sync_name = $2
  `, [serialized, SYNC_NAME]);

  if (result.rowCount !== 1) {
    throw new Error("Checkpoint could not be saved");
  }
}

  const serialized = BSON.EJSON.stringify(
    token,
    { relaxed: false }
  );

  const result = await postgres.query(`
    UPDATE public.sync_status
    SET resume_token = $1::jsonb,
        last_heartbeat_at = NOW(),
        updated_at = NOW()
    WHERE sync_name = $2
  `, [serialized, SYNC_NAME]);

  if (result.rowCount !== 1) {
    throw new Error("Checkpoint could not be saved");
  }


async function fullReconciliation(collection) {
  console.log("Starting full reconciliation...");

  const records = [];
  let excluded = 0;

  const cursor = collection.find({}, {
    projection: PROJECTION,
    readPreference: "primary",
    readConcern: { level: "majority" }
  });

  for await (const doc of cursor) {
    const mapped = mapRegistration(doc);

    if (!mapped) {
      excluded++;
      continue;
    }

    records.push(mapped);
  }

  await postgres.query("BEGIN");
  transactionStarted = true;

  for (const record of records) {
    await upsertRegistration(postgres, record);
  }

  const ids = records.map(r => r.mongo_id);

  await postgres.query(`
    DELETE FROM public.registrations_viewer
    WHERE NOT (mongo_id = ANY($1::text[]))
  `, [ids]);

  await postgres.query(`
    UPDATE public.sync_status
    SET total_records = $1,
        last_full_sync = NOW(),
        last_heartbeat_at = NOW(),
        updated_at = NOW()
    WHERE sync_name = $2
  `, [records.length, SYNC_NAME]);

  await postgres.query("COMMIT");
  transactionStarted = false;

  console.log("Reconciliation completed:", {
    eligible: records.length,
    excluded
  });
}

async function applyChange(collection, change) {
  await postgres.query("BEGIN");
  transactionStarted = true;

  const result = await processChange(
    postgres,
    collection,
    change
  );

  // Save the event checkpoint in the same
  // transaction as the registration change.
  await saveCheckpoint(change._id);

  await postgres.query(`
    UPDATE public.sync_status
    SET total_records = (
      SELECT COUNT(*)
      FROM public.registrations_viewer
    ),
    updated_at = NOW()
    WHERE sync_name = $1
  `, [SYNC_NAME]);

  await postgres.query("COMMIT");
  transactionStarted = false;

  console.log("Change processed:", result);
}

try {
  const required = [
    "GS_MONGODB_URI",
    "GS_MONGODB_DB",
    "GS_MONGODB_COLLECTION",
    "GS_SYNC_DATABASE_URL"
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(
        `Missing environment variable: ${key}`
      );
    }
  }

  const url = new URL(
    process.env.GS_SYNC_DATABASE_URL
  );

  for (const key of [
    "sslmode",
    "sslcert",
    "sslkey",
    "sslrootcert",
    "ssl"
  ]) {
    if (url.searchParams.has(key)) {
      throw new Error("Unsafe SSL configuration");
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
    connectionString:
      process.env.GS_SYNC_DATABASE_URL,

    ssl: {
      ca,
      rejectUnauthorized: true
    },

    connectionTimeoutMillis: 30000,
    statement_timeout: 30000
  });

  await postgres.connect();

  const identity = await postgres.query(`
    SELECT current_user, session_user
  `);

  if (
    identity.rows[0].current_user !== "gs_sync_writer" ||
    identity.rows[0].session_user !== "gs_sync_writer"
  ) {
    throw new Error("Incorrect Supabase role");
  }

  console.log("PASS: Restricted Supabase connected");

  const lock = await postgres.query(`
    SELECT pg_try_advisory_lock($1) AS locked
  `, [LOCK_ID]);

  if (!lock.rows[0].locked) {
    throw new Error(
      "Another synchronization worker is running"
    );
  }

  lockAcquired = true;

  await postgres.query(`
    UPDATE public.sync_status
    SET status = 'syncing',
        last_attempt_at = NOW(),
        last_successful_sync = NULL,
        last_error = NULL,
        updated_at = NOW()
    WHERE sync_name = $1
  `, [SYNC_NAME]);

  mongo = new MongoClient(
    process.env.GS_MONGODB_URI,
    {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      readPreference: "primary"
    }
  );

  await mongo.connect();

  const db = mongo.db(
    process.env.GS_MONGODB_DB
  );

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

  // Establish a starting point before scanning.
  const pipeline = [
  {
    $project: {
      _id: 1,
      operationType: 1,
      documentKey: 1,
      clusterTime: 1
    }
  }
];

let recovered = false;

const savedToken = await loadResumeToken(postgres);

// Attempt recovery from the saved checkpoint
if (savedToken) {
  console.log("Saved resume token found");

  try {
    stream = collection.watch(pipeline, {
      resumeAfter: savedToken,
      maxAwaitTimeMS: 2000
    });

    const firstChange = await stream.tryNext();

    if (firstChange) {
      await applyChange(collection, firstChange);
    }

    await recordRecovery(
      postgres,
      "resume_token"
    );

    recovered = true;

    console.log("PASS: Resumed from saved checkpoint");

  } catch (error) {
    if (stream) {
      await stream.close().catch(() => {});
      stream = null;
    }

    if (!requiresFullReconciliation(error)) {
      throw error;
    }

    console.log(
      "Checkpoint unavailable; full reconciliation required"
    );
  }
}

// Full reconciliation when recovery is unavailable
if (!recovered) {
  console.log("Starting fresh synchronization");

  // Invalidate the old checkpoint before rebuilding.
  await postgres.query(`
    UPDATE public.sync_status
    SET resume_token = NULL,
        last_successful_sync = NULL,
        updated_at = NOW()
    WHERE sync_name = $1
  `, [SYNC_NAME]);

  const session = mongo.startSession();

  let startTime;

  try {
    await collection.findOne({}, {
      session,
      projection: { _id: 1 },
      readConcern: { level: "majority" }
    });

    startTime = session.operationTime;

  } finally {
    await session.endSession();
  }

  if (!startTime) {
    throw new Error(
      "Missing MongoDB operation time"
    );
  }

  stream = collection.watch(pipeline, {
    startAtOperationTime: startTime,
    maxAwaitTimeMS: 2000
  });

  const firstChange = await stream.tryNext();

  await fullReconciliation(collection);

  if (firstChange) {
    await applyChange(collection, firstChange);
  }

  await recordRecovery(
    postgres,
    "full_reconciliation"
  );

  console.log("PASS: Full reconciliation completed");
}

// Keep dashboard blocked until freshness is verified
await postgres.query(`
  UPDATE public.sync_status
  SET status = 'offline',
      failed_records = 0,
      last_successful_sync = NULL,
      updated_at = NOW()
  WHERE sync_name = $1
`, [SYNC_NAME]);
  console.log("GS SYNC WORKER STARTED");
  console.log("Dashboard access remains blocked");
  console.log("Listening for MongoDB changes...");

  while (!stopping) {
    const change = await stream.tryNext();

    if (change) {
      await applyChange(collection, change);
    } else {
      await postgres.query(`
        UPDATE public.sync_status
        SET last_heartbeat_at = NOW(),
            updated_at = NOW()
        WHERE sync_name = $1
      `, [SYNC_NAME]);
    }
  }

  console.log("Synchronization worker stopping...");

} catch (error) {
  if (postgres && transactionStarted) {
    await postgres.query("ROLLBACK")
      .catch(() => {});

    transactionStarted = false;
  }

  if (postgres && lockAcquired) {
    await postgres.query(`
      UPDATE public.sync_status
      SET status = 'error',
          last_successful_sync = NULL,
          last_error = 'Synchronization worker failed',
          updated_at = NOW()
      WHERE sync_name = $1
    `, [SYNC_NAME]).catch(() => {});
  }

  console.error("GS SYNC WORKER FAILED", {
    code: error.code ?? "UNKNOWN"
  });

  process.exitCode = 1;

} finally {
  if (postgres && lockAcquired && !process.exitCode) {
    await postgres.query(`
      UPDATE public.sync_status
      SET status = 'offline',
          last_successful_sync = NULL,
          updated_at = NOW()
      WHERE sync_name = $1
    `, [SYNC_NAME]).catch(() => {});
  }

  if (stream) {
    await stream.close().catch(() => {});
  }

  if (mongo) {
    await mongo.close().catch(() => {});
  }

  if (postgres) {
    await postgres.end().catch(() => {});
  }
}