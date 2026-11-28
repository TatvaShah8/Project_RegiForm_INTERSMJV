
import pkg from "@next/env";
import pg from "pg";
import { MongoClient, BSON } from "mongodb";
import fs from "node:fs";
import path from "node:path";

import { SYNC_CONFIG } from "./gs-sync-config.mjs";

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

import {
  verifySynchronization
} from "./gs-sync-verification.mjs";

const { loadEnvConfig } = pkg;
const { Client } = pg;

loadEnvConfig(process.cwd(), true);

const {
  SYNC_NAME,
  LOCK_ID,
  RECONCILIATION_INTERVAL_MS
} = SYNC_CONFIG;

const VERIFICATION_INTERVAL_MS = 30000;

let mongo;
let postgres;
let stream;

let stopping = false;
let lockAcquired = false;
let transactionStarted = false;

let lastReconciliation = Date.now();
let lastVerification = 0;

process.on("SIGINT", () => {
  stopping = true;
});

process.on("SIGTERM", () => {
  stopping = true;
});

// ==========================================
// CHANGE STREAM PIPELINE
// ==========================================

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

// ==========================================
// DASHBOARD SAFETY
// ==========================================

async function markOffline() {
  await postgres.query(`
    UPDATE public.sync_status
    SET status = 'offline',
        last_successful_sync = NULL,
        last_caught_up_at = NULL,
        updated_at = NOW()
    WHERE sync_name = $1
  `, [SYNC_NAME]);
}

// ==========================================
// CHECKPOINT MANAGEMENT
// ==========================================

async function saveCheckpoint(
  token,
  isEvent = true
) {
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
        last_event_at = CASE
          WHEN $3::boolean THEN NOW()
          ELSE last_event_at
        END,
        last_heartbeat_at = NOW(),
        updated_at = NOW()
    WHERE sync_name = $2
  `, [
    serialized,
    SYNC_NAME,
    isEvent
  ]);

  if (result.rowCount !== 1) {
    throw new Error("Checkpoint save failed");
  }
}

// ==========================================
// FULL RECONCILIATION
// ==========================================

async function fullReconciliation(collection) {
  console.log("Starting full reconciliation...");

  await postgres.query(`
    UPDATE public.sync_status
    SET status = 'syncing',
        last_successful_sync = NULL,
        last_caught_up_at = NULL,
        reconciliation_started_at = NOW(),
        updated_at = NOW()
    WHERE sync_name = $1
  `, [SYNC_NAME]);

  const records = [];

  let excluded = 0;
  let unexpected = 0;

  const cursor = collection.find({}, {
    projection: PROJECTION,
    readPreference: "primary",
    readConcern: { level: "majority" }
  });

  try {
    for await (const doc of cursor) {
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
  } finally {
    await cursor.close();
  }

  if (unexpected > 0) {
    throw new Error(
      "Unexpected mapping failures"
    );
  }

  if (records.length === 0) {
    throw new Error(
      "No eligible registrations found"
    );
  }

  await postgres.query("BEGIN");

  transactionStarted = true;

  for (const record of records) {
    await upsertRegistration(
      postgres,
      record
    );
  }

  const ids = records.map(
    record => record.mongo_id
  );

  const deleted = await postgres.query(`
    DELETE FROM public.registrations_viewer
    WHERE NOT (mongo_id = ANY($1::text[]))
  `, [ids]);

  const verification = await postgres.query(`
    SELECT COUNT(*)::int AS total
    FROM public.registrations_viewer
  `);

  if (
    verification.rows[0].total !==
    records.length
  ) {
    throw new Error(
      "Reconciliation count mismatch"
    );
  }

  await postgres.query(`
    UPDATE public.sync_status
    SET total_records = $1,
        excluded_records = $2,
        records_deleted =
          records_deleted + $3,
        reconciliation_count =
          reconciliation_count + 1,
        reconciliation_completed_at = NOW(),
        last_full_sync = NOW(),
        last_heartbeat_at = NOW(),
        failed_records = 0,
        updated_at = NOW()
    WHERE sync_name = $4
  `, [
    records.length,
    excluded,
    deleted.rowCount,
    SYNC_NAME
  ]);

  await postgres.query("COMMIT");

  transactionStarted = false;

  lastReconciliation = Date.now();

  console.log("Reconciliation completed:", {
    eligible: records.length,
    excluded,
    removed: deleted.rowCount
  });
}

// ==========================================
// PROCESS DATABASE CHANGES
// ==========================================

async function applyChange(collection, change) {
  await postgres.query("BEGIN");

  transactionStarted = true;

  const result = await processChange(
    postgres,
    collection,
    change
  );

  await saveCheckpoint(change._id, true);

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

// ==========================================
// IDLE CHECKPOINT
// ==========================================

async function saveIdleCheckpoint() {
  const token = stream.resumeToken;

  if (token) {
    await saveCheckpoint(token, false);
  } else {
    await postgres.query(`
      UPDATE public.sync_status
      SET last_heartbeat_at = NOW(),
          updated_at = NOW()
      WHERE sync_name = $1
    `, [SYNC_NAME]);
  }
}

// ==========================================
// START FRESH SYNCHRONIZATION
// ==========================================

async function startFreshSynchronization(
  collection
) {
  console.log("Starting fresh synchronization");

  await postgres.query(`
    UPDATE public.sync_status
    SET status = 'syncing',
        resume_token = NULL,
        last_successful_sync = NULL,
        last_caught_up_at = NULL,
        updated_at = NOW()
    WHERE sync_name = $1
  `, [SYNC_NAME]);

  if (stream) {
    await stream.close();
    stream = null;
  }

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
    maxAwaitTimeMS:
      SYNC_CONFIG.CHANGE_STREAM_WAIT_MS
  });

  const firstChange = await stream.tryNext();

  console.log("PASS: Change Stream opened");

  await fullReconciliation(collection);

  if (firstChange) {
    await applyChange(
      collection,
      firstChange
    );
  }

  await markOffline();

  lastVerification = 0;

  console.log(
    "PASS: Full reconciliation completed"
  );
}

// ==========================================
// FIELD-LEVEL VERIFICATION
// ==========================================

async function runVerification(collection) {
  console.log("");
  console.log(
    "Starting registration verification..."
  );

  const result = await verifySynchronization(
    postgres,
    collection
  );

  lastVerification = Date.now();

  if (result.verified) {
    console.log(
      "PASS: Source and destination fields match"
    );
  } else {
    console.log(
      "Verification mismatch detected"
    );

    console.log(
      "Dashboard access remains blocked"
    );
  }

  return result;
}

// ==========================================
// MAIN WORKER
// ==========================================

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
      throw new Error(
        "Unsafe SSL configuration"
      );
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

  // Connect to restricted Supabase role.

  postgres = new Client({
    connectionString:
      process.env.GS_SYNC_DATABASE_URL,

    ssl: {
      ca,
      rejectUnauthorized: true
    },

    connectionTimeoutMillis:
      SYNC_CONFIG.CONNECTION_TIMEOUT_MS,

    statement_timeout:
      SYNC_CONFIG.STATEMENT_TIMEOUT_MS
  });

  await postgres.connect();

  const identity = await postgres.query(`
    SELECT current_user, session_user
  `);

  if (
    identity.rows[0].current_user !==
      "gs_sync_writer" ||
    identity.rows[0].session_user !==
      "gs_sync_writer"
  ) {
    throw new Error(
      "Incorrect Supabase role"
    );
  }

  console.log(
    "PASS: Restricted Supabase connected"
  );

  // Prevent simultaneous workers.

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
        last_caught_up_at = NULL,
        last_error = NULL,
        updated_at = NOW()
    WHERE sync_name = $1
  `, [SYNC_NAME]);

  // Connect to restricted MongoDB account.

  mongo = new MongoClient(
    process.env.GS_MONGODB_URI,
    {
      serverSelectionTimeoutMS:
        SYNC_CONFIG.CONNECTION_TIMEOUT_MS,

      socketTimeoutMS: 30000,

      tls: true,

      tlsAllowInvalidCertificates: false,

      tlsAllowInvalidHostnames: false,

      readPreference: "primary",

      readConcern: { level: "majority" }
    }
  );

  await mongo.connect();

  const db = mongo.db(
    process.env.GS_MONGODB_DB
  );

  const auth = await db.command({
    connectionStatus: 1
  });

  const users =
    auth.authInfo.authenticatedUsers;

  if (
    users.length !== 1 ||
    users[0].user !== "gs_sync_reader"
  ) {
    throw new Error(
      "Incorrect MongoDB identity"
    );
  }

  console.log(
    "PASS: Restricted MongoDB connected"
  );

  const collection = db.collection(
    process.env.GS_MONGODB_COLLECTION
  );

  // ========================================
  // AUTOMATIC RECOVERY
  // ========================================

  let recovered = false;

  const savedToken =
    await loadResumeToken(postgres);

  if (savedToken) {
    console.log("Saved resume token found");

    let firstChange;

    try {
      stream = collection.watch(pipeline, {
        resumeAfter: savedToken,

        maxAwaitTimeMS:
          SYNC_CONFIG.CHANGE_STREAM_WAIT_MS
      });

      firstChange = await stream.tryNext();

      recovered = true;

    } catch (error) {
      if (stream) {
        await stream.close().catch(() => {});
        stream = null;
      }

      if (!requiresFullReconciliation(error)) {
        throw error;
      }

      console.log(
        "Checkpoint unavailable"
      );
    }

    if (recovered) {
      if (firstChange) {
        await applyChange(
          collection,
          firstChange
        );
      }

      await recordRecovery(
        postgres,
        "resume_token"
      );

      console.log(
        "PASS: Resumed from saved checkpoint"
      );
    }
  }

  if (!recovered) {
    await startFreshSynchronization(
      collection
    );

    await recordRecovery(
      postgres,
      "full_reconciliation"
    );
  }

  await markOffline();

  console.log("");
  console.log("GS SYNC WORKER STARTED");
  console.log("Dashboard access remains blocked");
  console.log("Listening for MongoDB changes...");
  console.log("");

  // ========================================
  // CONTINUOUS SYNCHRONIZATION
  // ========================================

  while (!stopping) {
    const reconciliationDue =
      Date.now() - lastReconciliation >=
      RECONCILIATION_INTERVAL_MS;

    if (reconciliationDue) {
      console.log(
        "Scheduled reconciliation started"
      );

      await startFreshSynchronization(
        collection
      );

      console.log(
        "Scheduled reconciliation completed"
      );
    }

    if (stopping) {
      break;
    }

    const change = await stream.tryNext();

    if (change) {
      await applyChange(
        collection,
        change
      );

      continue;
    }

    await saveIdleCheckpoint();

    const verificationDue =
      Date.now() - lastVerification >=
      VERIFICATION_INTERVAL_MS;

    if (verificationDue && !stopping) {
      await runVerification(collection);
    }
  }

  console.log(
    "Synchronization worker stopping..."
  );

// ==========================================
// ERROR HANDLING
// ==========================================

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
          last_caught_up_at = NULL,
          last_error =
            'Synchronization worker failed',
          updated_at = NOW()
      WHERE sync_name = $1
    `, [SYNC_NAME]).catch(() => {});
  }

  console.error("GS SYNC WORKER FAILED", {
    name: error.name ?? "Error",
    code: error.code ?? "UNKNOWN"
  });

  process.exitCode = 1;

// ==========================================
// SAFE SHUTDOWN
// ==========================================

} finally {
  if (
    postgres &&
    lockAcquired &&
    !process.exitCode
  ) {
    await markOffline().catch(() => {});
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

  console.log(
    "Synchronization worker stopped"
  );
}
