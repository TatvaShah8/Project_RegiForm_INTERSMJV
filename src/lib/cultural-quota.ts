import "server-only";
import type { Collection, Document, Filter } from "mongodb";
import { database, mongoClient } from "@/lib/mongodb";

export const CULTURAL_LIMIT = 10;
export const CULTURAL_FULL_MESSAGE = "Cultural registration is full for your branch and gender (10 places). Sports participants can select No for cultural participation and continue with sports only.";

export function needsCulturalPlace(branch: string, role: unknown, alsoParticipates: unknown) {
  return branch !== "vadodara" && (role === "cultural" || (role === "sports" && alsoParticipates === true));
}

export async function completeRegistration(
  collection: Collection<Document>, record: Document, fields: Record<string, unknown>,
) {
  const filter: Filter<Document> = { firebaseUid: record.firebaseUid, registrationStatus: { $ne: "completed" }, updatedAt: record.updatedAt };
  if (!needsCulturalPlace(record.branch, fields.role, fields.alsoParticipatesInCultural)) {
    return collection.updateOne(filter, { $set: fields });
  }
  const db = await database();
  const locks = db.collection<{ _id: string; revision: number }>("culturalQuotaLocks");
  const key = `${record.branch}:${record.gender}`;
  // Create the serialization document before the transaction, including on existing databases.
  try {
    await locks.updateOne({ _id: key }, { $setOnInsert: { revision: 0 } }, { upsert: true });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  const session = (await mongoClient()).startSession();
  try {
    return await session.withTransaction(async () => {
      // Concurrent completions for this branch/gender conflict here and retry with a fresh snapshot.
      await locks.updateOne({ _id: key }, { $inc: { revision: 1 } }, { session });
      const count = await collection.countDocuments({
        branch: record.branch, gender: record.gender, registrationStatus: "completed",
        $or: [{ role: "cultural" }, { role: "sports", alsoParticipatesInCultural: true }],
      }, { session });
      if (count >= CULTURAL_LIMIT) throw new Error("CULTURAL_QUOTA_FULL");
      const update = await collection.updateOne(filter, { $set: fields }, { session });
      if (!update.matchedCount) throw new Error("REGISTRATION_CHANGED");
      return update;
    }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
  } finally {
    await session.endSession();
  }
}
