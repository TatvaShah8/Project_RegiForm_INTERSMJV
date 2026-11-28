import pkg from "@next/env";
import { MongoClient } from "mongodb";
import { mapRegistration } from "./gs-sync-mapping.mjs";

const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd(), true);

let mongo;

try {
  const required = [
    "GS_MONGODB_URI",
    "GS_MONGODB_DB",
    "GS_MONGODB_COLLECTION"
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
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

  console.log("PASS: MongoDB connected");

  const collection = mongo
    .db(process.env.GS_MONGODB_DB)
    .collection(process.env.GS_MONGODB_COLLECTION);

  // Retrieve only approved fields
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

  let total = 0;
  let eligible = 0;
  let excluded = 0;
  let missingBranch = 0;
  let otherRejected = 0;

  const branchStats = {};
  const statusStats = {};

  const cursor = collection.find(
    {},
    { projection }
  );

  for await (const doc of cursor) {
    total++;

    const mapped = mapRegistration(doc);

    if (!mapped) {
      excluded++;

      if (
        typeof doc.branch !== "string" ||
        !doc.branch.trim()
      ) {
        missingBranch++;
      } else {
        otherRejected++;
      }

      continue;
    }

    eligible++;

    const branch = mapped.branch_id;

    if (!branchStats[branch]) {
      branchStats[branch] = {
        male: 0,
        female: 0,
        total: 0
      };
    }

    branchStats[branch][mapped.gender]++;
    branchStats[branch].total++;

    const status = mapped.registrationStatus;

    statusStats[status] =
      (statusStats[status] || 0) + 1;
  }

  console.log("\n--- DRY RUN SUMMARY ---");

  console.table({
    total,
    eligible,
    excluded,
    missingBranch,
    otherRejected
  });

  console.log("\n--- BRANCH DISTRIBUTION ---");
  console.table(branchStats);

  console.log("\n--- ELIGIBLE REGISTRATION STATUS ---");
  console.table(statusStats);

  if (total !== eligible + excluded) {
    throw new Error("Registration count mismatch");
  }

  if (total === 0) {
    throw new Error("No registrations found");
  }

  if (otherRejected > 0) {
    throw new Error(
      "Unexpected registration mapping failures"
    );
  }

  console.log("\nPASS: Registration counts validated");
  console.log("PASS: No database writes performed");
  console.log("DRY RUN COMPLETED SUCCESSFULLY");

} catch (error) {
  console.error("DRY RUN FAILED:", {
    message: error.message,
    code: error.code
  });

  process.exitCode = 1;

} finally {
  if (mongo) {
    await mongo.close();
  }
}