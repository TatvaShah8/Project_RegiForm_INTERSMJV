import {
  cert,
  initializeApp,
  applicationDefault,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";
import pkg from "@next/env";
const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd());

const EXPECTED_PROJECT = "intersmjv";

async function main() {
  const uids = [...new Set(process.argv.slice(2))];

  if (uids.length === 0) {
    throw new Error("Please provide Firebase UIDs.");
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  let credential;

  if (raw) {
    let account = JSON.parse(raw.trim());

    if (typeof account === "string") {
      account = JSON.parse(account);
    }

    if (account.project_id !== EXPECTED_PROJECT) {
      throw new Error("Incorrect Firebase project.");
    }

    account.private_key = account.private_key.replace(
      /\\n/g,
      "\n"
    );

    credential = cert(account);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = applicationDefault();
  } else {
    throw new Error("Firebase credentials not configured.");
  }

  const app = initializeApp({
    credential,
    projectId: EXPECTED_PROJECT,
  });

  const auth = getAuth(app);

  // Validate all accounts before changing any claims.
  const users = await Promise.all(
    uids.map(uid => auth.getUser(uid))
  );

  for (const user of users) {
    if (user.disabled) {
      throw new Error("A selected account is disabled.");
    }

    if (!user.emailVerified) {
      throw new Error("A selected account is not verified.");
    }
  }

  for (const user of users) {
    const existingClaims = user.customClaims ?? {};

    if (
      existingClaims.role &&
      existingClaims.role !== "authenticated"
    ) {
      throw new Error("Existing role conflict. Review required.");
    }
  }

  for (const user of users) {
    await auth.setCustomUserClaims(user.uid, {
      ...user.customClaims,
      role: "authenticated",
    });

    const updated = await auth.getUser(user.uid);

    if (updated.customClaims?.role !== "authenticated") {
      throw new Error("Claim verification failed.");
    }

    console.log(`SUCCESS: ${user.uid}`);
  }

  console.log("GS custom claims configured.");
}

main().catch(error => {
  console.error("FAILED:", error.code || error.message);
  process.exitCode = 1;
});