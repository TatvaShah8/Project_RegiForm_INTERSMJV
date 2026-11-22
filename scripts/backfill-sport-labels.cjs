// Dry-run by default. Use --apply to add readable MongoDB table columns.
const path = require("node:path");
const nextRoot = path.dirname(require.resolve("next/package.json"));
require(require.resolve("@next/env", { paths: [nextRoot] })).loadEnvConfig(process.cwd());
const { MongoClient } = require("mongodb");
(async () => {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const collection = client.db(process.env.MONGODB_DB).collection("registrations");
    let eligible = 0, changed = 0, skipped = 0;
    for await (const record of collection.find({ registrationStatus: "completed" }, {
      projection: { outdoor: 1, indoor: 1, outdoorSports: 1, indoorSports: 1 },
    })) {
      if (![record.outdoor, record.indoor].every(list => Array.isArray(list) && list.every(s => typeof s === "string"))) { skipped++; continue; }
      const fields = { outdoorSports: record.outdoor.join(", ") || "None", indoorSports: record.indoor.join(", ") || "None" };
      if (record.outdoorSports === fields.outdoorSports && record.indoorSports === fields.indoorSports) continue;
      eligible++;
      if (process.argv.includes("--apply")) {
        const result = await collection.updateOne({ _id: record._id, registrationStatus: "completed", outdoor: record.outdoor, indoor: record.indoor }, { $set: fields });
        changed += result.modifiedCount;
      }
    }
    console.log({ mode: process.argv.includes("--apply") ? "apply" : "dry-run", eligible, changed, skipped });
  } catch (error) { console.error("Sport label backfill failed:", error.codeName || error.name); process.exitCode = 1; }
  finally { await client.close(); }
})();
