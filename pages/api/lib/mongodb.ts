import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
if (!uri) {
  console.warn('MONGODB_URI is not defined - MongoDB features will be disabled');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function getDatabase(): Promise<Db | null> {
  if (!clientPromise) {
    return null;
  }
  const client = await clientPromise;
  const dbName = process.env.MONGODB_NAME ||
    (process.env.NODE_ENV === 'production' ? 'brianstoker-production' : 'brianstoker-local');
  return client.db(dbName);
}

export default clientPromise;
