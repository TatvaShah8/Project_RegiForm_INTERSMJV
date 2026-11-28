import { mapRegistration } from "./gs-sync-mapping.mjs";

export const PROJECTION = Object.freeze({
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
});

const COLUMNS = [
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

const columnNames = COLUMNS
  .map(c => `"${c}"`)
  .join(", ");

const placeholders = COLUMNS
  .map((_, i) => `$${i + 1}`)
  .join(", ");

const updates = COLUMNS
  .filter(c => c !== "mongo_id")
  .map(c => `"${c}" = EXCLUDED."${c}"`)
  .join(", ");

const UPSERT_QUERY = `
  INSERT INTO public.registrations_viewer
    (${columnNames})
  VALUES (${placeholders})

  ON CONFLICT (mongo_id)
  DO UPDATE SET
    ${updates},
    synced_at = NOW()
`;

// Insert or update an approved registration
export async function upsertRegistration(
  postgres,
  record
) {
  const values = COLUMNS.map(
    column => record[column] ?? null
  );

  await postgres.query(
    UPSERT_QUERY,
    values
  );
}

// Remove a registration copy
export async function deleteRegistration(
  postgres,
  mongoId
) {
  const result = await postgres.query(`
    DELETE FROM public.registrations_viewer
    WHERE mongo_id = $1
  `, [mongoId]);

  return result.rowCount;
}

// Process a MongoDB Change Stream event
export async function processChange(
  postgres,
  collection,
  change
) {
  const operation = change.operationType;

  if (![
    "insert",
    "update",
    "replace",
    "delete"
  ].includes(operation)) {
    throw new Error(
      "Unsupported change event; reconciliation required"
    );
  }

  const id = change.documentKey?._id;

  if (
    !id ||
    typeof id.toHexString !== "function"
  ) {
    throw new Error("Invalid MongoDB document ID");
  }

  const mongoId = id.toHexString();

  // Handle deleted registrations
  if (operation === "delete") {
    await deleteRegistration(postgres, mongoId);

    return "deleted";
  }

  // Fetch current approved fields from MongoDB
  const doc = await collection.findOne(
    { _id: id },
    {
      projection: PROJECTION,
      readPreference: "primary"
    }
  );

  // Registration no longer exists
  if (!doc) {
    await deleteRegistration(postgres, mongoId);

    return "deleted";
  }

  const mapped = mapRegistration(doc);

  // Remove outdated copies if permissions
  // or registration information become invalid
  if (!mapped) {
    await deleteRegistration(postgres, mongoId);

    return "excluded";
  }

  await upsertRegistration(postgres, mapped);

  return "upserted";
}