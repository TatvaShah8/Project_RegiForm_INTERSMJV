const path = require("node:path");
const fs = require("node:fs");
const nextRoot = path.dirname(require.resolve("next/package.json"));
require(require.resolve("@next/env", { paths: [nextRoot] })).loadEnvConfig(process.cwd());
const { MongoClient } = require("mongodb");
const { createClient } = require("@supabase/supabase-js");
const { cert, initializeApp, applicationDefault, deleteApp } = require("firebase-admin/app");
async function check(label, run) {
  try { await run(); console.log(`${label}: PASS`); }
  catch (error) { console.error(`${label}: FAIL (${error.code || error.name || "configuration error"})`); process.exitCode = 1; }
}
(async () => {
  const required = ["NEXT_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_APP_ID", "MONGODB_URI", "MONGODB_DB", "SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_BUCKET"];
  for (const name of required) if (!process.env[name]) { console.error(`Missing ${name}`); process.exitCode = 1; }
  await check("MongoDB connection", async () => {
    const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    try { await client.connect(); await client.db(process.env.MONGODB_DB).command({ ping: 1 }); }
    finally { await client.close(); }
  });
  await check("Supabase bucket", async () => {
    const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
    const { data, error } = await s.storage.getBucket(process.env.SUPABASE_BUCKET);
    if (error) throw error;
    console.log(`Bucket access: ${data.public ? "public" : "private (signed URLs)"}`);
  });
  await check("Firebase Admin credential", async () => {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!json && !file) throw Object.assign(new Error(), { code: "MISSING_ADMIN_CREDENTIAL" });
    const account = JSON.parse(json || fs.readFileSync(file, "utf8"));
    if (account.project_id !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) throw Object.assign(new Error(), { code: "PROJECT_MISMATCH" });
    const app = initializeApp({ projectId: account.project_id, credential: json ? cert(account) : applicationDefault() });
    try { await app.options.credential.getAccessToken(); } finally { await deleteApp(app); }
  });
  console.log(`Committee access configured: ${Boolean(process.env.ADMIN_FIREBASE_UIDS)}`);
})();
