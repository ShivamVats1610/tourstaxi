import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'tourstaxi';

let cached = globalThis.__tourstaxiMongo;

if (!cached) {
  cached = globalThis.__tourstaxiMongo = { client: null, promise: null };
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (cached.client) {
    return cached.client.db(dbName);
  }

  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().catch((error) => {
      cached.promise = null;
      throw error;
    });
  }

  cached.client = await cached.promise;
  return cached.client.db(dbName);
}

export async function ensureIndexes() {
  const db = await getDb();
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('users').createIndex({ role: 1 }),
    db.collection('bookings').createIndex({ bookingId: 1 }, { unique: true }),
    db.collection('bookings').createIndex({ customerId: 1, createdAt: -1 }),
    db.collection('bookings').createIndex({ status: 1, createdAt: -1 }),
    db.collection('cabs').createIndex({ slug: 1 }, { unique: true }),
    db.collection('cabs').createIndex({ status: 1, updatedAt: -1 }),
  ]);
}
