import pkg from "@next/env";
import pg from "pg";
import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

const { loadEnvConfig } = pkg;
const { Client } = pg;

loadEnvConfig(process.cwd(), true);

let mongo;
let postgres;

try {
  // Verify environment variables
  const required = [
    "GS_MONGODB_URI",
    "GS_MONGODB_DB",
    "GS_MONGODB_COLLECTION",
    "GS_SYNC_DATABASE_URL",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  console.log("PASS: Environment variables configured");

  // Test MongoDB connection
  mongo = new MongoClient(
    process.env.GS_MONGODB_URI,
    {
      serverSelectionTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    }
  );

  await mongo.connect();

  const db = mongo.db(process.env.GS_MONGODB_DB);

  await db.command({ ping: 1 });

  console.log("PASS: MongoDB connection established");

  // Verify MongoDB identity and privileges
  const auth = await db.command({
    connectionStatus: 1,
    showPrivileges: true,
  });

  const users = auth.authInfo.authenticatedUsers;

  if (
    users.length !== 1 ||
    users[0].user !== "gs_sync_reader"
  ) {
    throw new Error("Unexpected MongoDB identity");
  }

  console.log("PASS: Correct MongoDB reader identity");

  console.log("MongoDB effective privileges:");
  console.dir(
    auth.authInfo.authenticatedUserPrivileges,
    { depth: null }
  );

  // Count registrations without displaying student data
  const collection = db.collection(
    process.env.GS_MONGODB_COLLECTION
  );

  const count = await collection.countDocuments({});

  console.log("MongoDB registration count:", count);

  // Prevent URL parameters overriding TLS settings
  const url = new URL(
    process.env.GS_SYNC_DATABASE_URL
  );

  for (const key of [
    "sslmode", "sslcert", "sslkey",
    "sslrootcert", "ssl"
  ]) {
    if (url.searchParams.has(key)) {
      throw new Error(
        `Remove SSL URL parameter: ${key}`
      );
    }
  }

  // Test Supabase connection
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
      rejectUnauthorized: true,
    },

    connectionTimeoutMillis: 30000,
    statement_timeout: 10000,
  });

  await postgres.connect();

  console.log("PASS: Supabase connection established");

  // Verify restricted identity
  const identity = await postgres.query(`
    SELECT current_user, session_user
  `);

  if (
    identity.rows[0].current_user !== "gs_sync_writer" ||
    identity.rows[0].session_user !== "gs_sync_writer"
  ) {
    throw new Error("Unexpected Supabase database role");
  }

  console.log("PASS: Correct Supabase writer identity");

  // Verify table permissions
  const permissions = await postgres.query(`
    SELECT
      table_name,
      has_table_privilege(
        current_user, table_name, 'SELECT'
      ) AS can_read,
      has_table_privilege(
        current_user, table_name, 'INSERT'
      ) AS can_insert,
      has_table_privilege(
        current_user, table_name, 'UPDATE'
      ) AS can_update,
      has_table_privilege(
        current_user, table_name, 'DELETE'
      ) AS can_delete,
      has_table_privilege(
        current_user, table_name, 'TRUNCATE'
      ) AS can_truncate
    FROM unnest(ARRAY[
      'public.branches',
      'public.gs_permissions',
      'public.registrations_viewer',
      'public.sync_status',
      'public.access_logs'
    ]) AS t(table_name)
  `);

  console.table(permissions.rows);

  const expected = {
    "public.branches":
      [false, false, false, false, false],

    "public.gs_permissions":
      [false, false, false, false, false],

    "public.registrations_viewer":
      [true, true, true, true, false],

    "public.sync_status":
      [true, false, true, false, false],

    "public.access_logs":
      [false, false, false, false, false],
  };

  for (const row of permissions.rows) {
    const actual = [
      row.can_read,
      row.can_insert,
      row.can_update,
      row.can_delete,
      row.can_truncate,
    ];

    if (
      JSON.stringify(actual) !==
      JSON.stringify(expected[row.table_name])
    ) {
      throw new Error(
        "Unexpected permissions: " + row.table_name
      );
    }
  }

  console.log("PASS: Supabase table permissions");

  // Verify synchronization status is accessible
  const status = await postgres.query(`
    SELECT sync_name, status, total_records
    FROM public.sync_status
    WHERE sync_name = 'mongodb_registrations'
  `);

  if (status.rowCount !== 1) {
    throw new Error("Synchronization status missing");
  }

  console.table(status.rows);

  console.log("PASS: Synchronization status accessible");

  console.log("\nALL SYNC CONNECTION TESTS PASSED");

} catch (error) {
  console.error("TEST FAILED:", {
    message: error.message,
    code: error.code,
  });

  process.exitCode = 1;

} finally {
  if (mongo) await mongo.close();
  if (postgres) await postgres.end();
}