import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!; // Ensure this is set in .env.local

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (globalThis as Record<string, unknown>).mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } || { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn; // Return existing connection if available

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "test_rachna_kranti",
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;

  try {
    await cached.conn.connection.db?.collection('users').dropIndex('id_1');
  } catch {
    // index doesn't exist or already dropped — no action needed
  }

  return cached.conn;
}

export default connectToDB;