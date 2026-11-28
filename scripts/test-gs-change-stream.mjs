import pkg from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd(), true);

let mongo;
let stream;

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

  stream = collection.watch(
    [
      {
        $project: {
          _id: 1,
          operationType: 1,
          clusterTime: 1
        }
      }
    ],
    {
      maxAwaitTimeMS: 2000
    }
  );

  console.log("Opening MongoDB Change Stream...");

  const event = await stream.tryNext();

  console.log("PASS: Change Stream opened successfully");

  if (event) {
    console.log("Change detected:", event.operationType);
  } else {
    console.log("No new changes detected during initial test");
  }

  console.log("Waiting for changes for 60 seconds...");

  const endTime = Date.now() + 60000;

  let detected = 0;

  while (Date.now() < endTime) {
    const change = await stream.tryNext();

    if (change) {
      detected++;

      console.log(
        "CHANGE DETECTED:",
        change.operationType
      );
    }
  }

  console.log("Total changes detected:", detected);

  console.log(
    "CHANGE STREAM TEST COMPLETED SUCCESSFULLY"
  );

} catch (error) {
  console.error("CHANGE STREAM TEST FAILED:", {
    code: error.code,
    message: error.message
  });

  process.exitCode = 1;

} finally {
  if (stream) await stream.close();
  if (mongo) await mongo.close();
}