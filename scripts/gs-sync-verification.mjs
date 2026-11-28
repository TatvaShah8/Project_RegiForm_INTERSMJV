
import { createHash } from "node:crypto";

import { PROJECTION } from "./gs-sync-operations.mjs";
import { mapRegistration } from "./gs-sync-mapping.mjs";
import { SYNC_CONFIG } from "./gs-sync-config.mjs";

const FIELDS = [
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

function normalizeRecord(record) {
  return FIELDS.map(field => {
    const value = record[field];

    if (value === undefined || value === null) {
      return null;
    }

    if (field === "source_updated_at") {
      return new Date(value).toISOString();
    }

    if (field === "jerseyNumber") {
      return Number(value);
    }

    return value;
  });
}

function fingerprint(record) {
  return createHash("sha256")
    .update(JSON.stringify(normalizeRecord(record)))
    .digest("hex");
}

export async function verifySynchronization(
  postgres,
  collection
) {
  const startedAt = Date.now();

  const source = new Map();

  let excluded = 0;
  let unexpected = 0;

  const cursor = collection.find({}, {
    projection: PROJECTION,
    readPreference: "primary",
    readConcern: { level: "majority" },
    maxTimeMS:
      SYNC_CONFIG.MAX_VERIFICATION_DURATION_MS
  });

  try {
    for await (const doc of cursor) {
      if (
        Date.now() - startedAt >
        SYNC_CONFIG.MAX_VERIFICATION_DURATION_MS
      ) {
        throw new Error("Verification timed out");
      }

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

      source.set(
        mapped.mongo_id,
        fingerprint(mapped)
      );
    }
  } finally {
    await cursor.close();
  }

  const columns = FIELDS
    .map(field => `"${field}"`)
    .join(", ");

  const destination = await postgres.query(`
    SELECT ${columns}
    FROM public.registrations_viewer
  `);

  let missing = 0;
  let extra = 0;
  let mismatched = 0;

  const destinationIds = new Set();

  for (const record of destination.rows) {
    const id = record.mongo_id;

    destinationIds.add(id);

    if (!source.has(id)) {
      extra++;
      continue;
    }

    if (
      source.get(id) !== fingerprint(record)
    ) {
      mismatched++;
    }
  }

  for (const id of source.keys()) {
    if (!destinationIds.has(id)) {
      missing++;
    }
  }

  const duration = Date.now() - startedAt;

  const verified =
    missing === 0 &&
    extra === 0 &&
    mismatched === 0 &&
    unexpected === 0 &&
    duration <=
      SYNC_CONFIG.MAX_VERIFICATION_DURATION_MS;

  const result = {
    verified,
    sourceRecords: source.size,
    destinationRecords: destination.rowCount,
    excluded,
    unexpected,
    missing,
    extra,
    mismatched,
    durationMs: duration
  };

  // Record verification results.
  // Dashboard access remains disabled.

  const update = await postgres.query(`
    UPDATE public.sync_status
    SET
      status = 'offline',

      last_successful_sync = NULL,

      last_caught_up_at = NULL,

      last_verification_at = NOW(),

      verification_count =
        verification_count + 1,

      verification_failures =
        verification_failures +
        CASE
          WHEN $1::boolean THEN 0
          ELSE 1
        END,

      last_verification_duration_ms = $2,

      last_verification_method =
        'sha256_field_comparison',

      updated_at = NOW()

    WHERE sync_name = $3
  `, [
    verified,
    duration,
    SYNC_CONFIG.SYNC_NAME
  ]);

  if (update.rowCount !== 1) {
    throw new Error(
      "Verification status update failed"
    );
  }

  // Only aggregate counts are printed.
  // No student details or hashes are logged.

  console.table(result);

  if (verified) {
    console.log(
      "PASS: Registration field comparison"
    );
  } else {
    console.log(
      "FAIL: Registration verification"
    );
  }

  return result;
}
