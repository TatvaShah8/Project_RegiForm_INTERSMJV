import pkg from "@next/env";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const { loadEnvConfig } = pkg;
const { Client } = pg;

loadEnvConfig(process.cwd(), true);

let client;

try {
  const url = process.env.GS_DATABASE_URL;

  if (!url) {
    throw new Error("GS_DATABASE_URL is missing");
  }

  const parsed = new URL(url);

  for (const key of [
    "sslmode", "sslcert", "sslkey", "sslrootcert"
  ]) {
    if (parsed.searchParams.has(key)) {
      throw new Error("Remove SSL URL parameter: " + key);
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

  client = new Client({
    connectionString: url,
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
    connectionTimeoutMillis: 50000,
    statement_timeout: 10000,
  });

  await client.connect();

  console.log("PASS: Database connection established");

  // Test 1: Verify database identity
  const identity = await client.query(`
    SELECT current_user, session_user
  `);

  console.table(identity.rows);

  if (
    identity.rows[0].current_user !== "gs_dashboard_backend" ||
    identity.rows[0].session_user !== "gs_dashboard_backend"
  ) {
    throw new Error("Unexpected database role");
  }

  console.log("PASS: Correct restricted role");

  // Test 2: Verify role attributes
  const role = await client.query(`
    SELECT
      rolsuper,
      rolcreatedb,
      rolcreaterole,
      rolreplication,
      rolbypassrls,
      rolinherit
    FROM pg_roles
    WHERE rolname = current_user
  `);

  console.table(role.rows);

  if (Object.values(role.rows[0]).some(Boolean)) {
    throw new Error("Unexpected role privileges");
  }

  console.log("PASS: Restricted role attributes");

  // Test 3: Verify table permissions
  const permissions = await client.query(`
    SELECT
      t.table_name,
      has_table_privilege(
        current_user, t.table_name, 'SELECT'
      ) AS can_read,
      has_table_privilege(
        current_user, t.table_name, 'INSERT'
      ) AS can_insert,
      has_table_privilege(
        current_user, t.table_name, 'UPDATE'
      ) AS can_update,
      has_table_privilege(
        current_user, t.table_name, 'DELETE'
      ) AS can_delete,
      has_table_privilege(
        current_user, t.table_name, 'TRUNCATE'
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

  for (const row of permissions.rows) {
    const { table_name, ...privileges } = row;

    if (Object.values(privileges).some(Boolean)) {
      throw new Error(
        "Unexpected permissions on " + table_name
      );
    }
  }

  console.log("PASS: No direct table permissions");

  // Test 4: Reject direct registration access
  try {
    await client.query(`
      SELECT 1
      FROM public.registrations_viewer
      LIMIT 0
    `);

    throw new Error("Direct table access was allowed");
  } catch (error) {
    if (error.code !== "42501") {
      throw error;
    }

    console.log("PASS: Direct table access denied");
  }

  // Test 5: Reject unauthorized GS identity
  const unauthorized = await client.query(
    `SELECT *
     FROM gs_private.authorize_gs($1)`,
    ["invalid-security-test-uid"]
  );

  if (unauthorized.rowCount !== 0) {
    throw new Error("Unauthorized identity accepted");
  }

  console.log("PASS: Unauthorized GS rejected");

// Test 6: Verify authorized GS account

const gsUid = "WbCr3JVhsCWwYMUoRZRwkHV2O2G3";

const authorized = await client.query(
  `SELECT *
   FROM gs_private.authorize_gs($1)`,
  [gsUid]
);

if (authorized.rowCount !== 1) {
  throw new Error("Authorized GS account not recognized");
}

console.table(authorized.rows);

console.log("PASS: Authorized GS account recognized");

// Test 7: Verify expected permissions

const permission = authorized.rows[0];

if (
  permission.branch_id !== "VAD" ||
  permission.allowed_gender !== "male" ||
  permission.central_access !== true ||
  permission.can_download_csv !== true
) {
  throw new Error("Incorrect GS permissions");
}

console.log("PASS: Correct GS permissions");

// Test 8: Verify unauthorized registration retrieval

const denied = await client.query(
  `SELECT *
   FROM gs_private.get_registrations($1)`,
  ["invalid-security-test-uid"]
);

if (denied.rowCount !== 0) {
  throw new Error("Unauthorized data access");
}

console.log("PASS: Unauthorized registration access blocked");

// Test 9: Verify unsynchronized data is blocked

const registrations = await client.query(
  `SELECT *
   FROM gs_private.get_registrations($1)`,
  [gsUid]
);

if (registrations.rowCount !== 0) {
  throw new Error("Unsynchronized data was accessible");
}

console.log("PASS: No registration data released");

  console.log("\nALL CONNECTION TESTS PASSED");

} catch (error) {
  console.error("TEST FAILED:", error.message);
  process.exitCode = 1;
} finally {
  if (client) {
    await client.end();
  }
}