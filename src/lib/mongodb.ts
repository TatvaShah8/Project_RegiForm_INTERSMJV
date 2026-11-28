import "server-only";
import { MongoClient } from "mongodb";

const cache = globalThis as typeof globalThis & {
  smjvMongo?: Promise<MongoClient>;
  smjvIndexes?: Promise<unknown>;
  smjvDiamondIndexes?: Promise<unknown>;
};

export async function mongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is missing. Please add it to your Vercel Project Settings > Environment Variables."
    );
  }
  if (!cache.smjvMongo) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    cache.smjvMongo = client.connect().catch(async error => {
      cache.smjvMongo = undefined;
      await client.close();
      throw error;
    });
  }
  return await cache.smjvMongo;
}

export async function database() {
  return (await mongoClient()).db(process.env.MONGODB_DB || "intersmjv");
}

export async function registrations() {
  const collection = (await database()).collection("registrations");
  // Database constraints arbitrate concurrent requests.
  if (!cache.smjvIndexes) {
    cache.smjvIndexes = collection.createIndexes([
      ...["firebaseUid", "email", "phone", "grnumber"].map(field => ({
        key: { [field]: 1 as const }, unique: true,
      })),
      { key: { branch: 1, gender: 1, jerseyNumber: 1 }, unique: true,
        partialFilterExpression: { jerseyNumber: { $type: "number" } } },
    ]).catch(error => {
      cache.smjvIndexes = undefined;
      throw error;
    });
  }
  await cache.smjvIndexes;
  return collection;
}

export async function diamondRegistrations() {
  const collection = (await database()).collection("diamond_registrations");
  if (!cache.smjvDiamondIndexes) {
    cache.smjvDiamondIndexes = collection
      .createIndexes(
        ["firebaseUid", "email", "phone"].map((field) => ({
          key: { [field]: 1 as const },
          unique: true,
        }))
      )
      .catch((error) => {
        cache.smjvDiamondIndexes = undefined;
        throw error;
      });
  }
  await cache.smjvDiamondIndexes;
  return collection;
}
