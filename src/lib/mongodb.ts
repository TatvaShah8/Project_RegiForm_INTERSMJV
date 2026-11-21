import "server-only";
import { MongoClient } from "mongodb";

const cache = globalThis as typeof globalThis & {
  smjvMongo?: Promise<MongoClient>;
  smjvIndexes?: Promise<unknown>;
};

export async function database() {
  const uri = process.env.MONGODB_URI;
  const name = process.env.MONGODB_DB || "intersmjv";
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is missing. Please add it to your Vercel Project Settings > Environment Variables."
    );
  }
  if (!cache.smjvMongo) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    cache.smjvMongo = client.connect().catch(async error => {
      cache.smjvMongo = undefined;
      await client.close();
      const msg = error instanceof Error ? error.message : String(error);
      if (
        msg.includes("Server selection timed out") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("ENOTFOUND")
      ) {
        throw new Error(
          "MongoDB connection timed out. Please ensure '0.0.0.0/0' (Allow access from anywhere) is added to IP Access List in MongoDB Atlas -> Network Access."
        );
      }
      throw error;
    });
  }
  return (await cache.smjvMongo).db(name);
}

export async function registrations() {
  const collection = (await database()).collection("registrations");
  // Database constraints arbitrate concurrent requests.
  cache.smjvIndexes ??= collection.createIndexes([
    ...["firebaseUid", "email", "phone", "grnumber"].map(field => ({
      key: { [field]: 1 as const }, unique: true,
    })),
    { key: { branch: 1, gender: 1, jerseyNumber: 1 }, unique: true,
      partialFilterExpression: { jerseyNumber: { $type: "number" } } },
  ]).catch(error => {
    cache.smjvIndexes = undefined;
    console.error("MongoDB index warning:", error);
    if ((error as any)?.codeName === "IndexOptionsConflict" || (error as any)?.code === 85) {
      return null;
    }
    throw error;
  });
  await cache.smjvIndexes;
  return collection;
}
