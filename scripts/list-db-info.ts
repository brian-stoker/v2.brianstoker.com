import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function listDatabaseInfo() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    // List all databases
    const adminDb = client.db('admin').admin();
    const databasesList = await adminDb.listDatabases();

    console.log('📊 Available Databases:');
    console.log('========================\n');

    for (const dbInfo of databasesList.databases) {
      console.log(`📁 ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);

      // List collections for each database
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();

      if (collections.length > 0) {
        console.log('   Collections:');
        for (const collection of collections) {
          const coll = db.collection(collection.name);
          const count = await coll.countDocuments();
          console.log(`   - ${collection.name} (${count} documents)`);
        }
      } else {
        console.log('   (no collections)');
      }
      console.log('');
    }

  } catch (error) {
    console.error('Error listing database info:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

listDatabaseInfo();
