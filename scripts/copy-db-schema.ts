import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function copyDatabaseSchema() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const sourceDbName = 'brianstoker-production';
    const targetDbName = 'brianstoker-local';

    const sourceDb = client.db(sourceDbName);
    const targetDb = client.db(targetDbName);

    // Get all collections from source database
    const collections = await sourceDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections in ${sourceDbName}`);

    // Also create the collections that will be used for GitHub events
    const githubCollections = [
      'github_events',
      'github_rate_limits',
      'sync_metadata'
    ];

    console.log(`\nCreating GitHub events collections in ${targetDbName}...`);
    for (const collectionName of githubCollections) {
      try {
        await targetDb.createCollection(collectionName);
        console.log(`  ✓ Created collection: ${collectionName}`);
      } catch (error: any) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`  ⚠ Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\nProcessing collection: ${collectionName}`);

      // Create collection in target database
      try {
        await targetDb.createCollection(collectionName);
        console.log(`  ✓ Created collection: ${collectionName}`);
      } catch (error: any) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`  ⚠ Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }

      // Get indexes from source collection
      const sourceCollection = sourceDb.collection(collectionName);
      const indexes = await sourceCollection.indexes();

      console.log(`  Found ${indexes.length} indexes`);

      // Copy indexes to target collection (skip the default _id index)
      const targetCollection = targetDb.collection(collectionName);
      for (const index of indexes) {
        if (index.name === '_id_') {
          continue; // Skip default _id index
        }

        try {
          const indexSpec: any = {};
          const keys = index.key;

          // Remove internal fields from index options
          const { key, v, ns, ...options } = index;

          await targetCollection.createIndex(keys, {
            ...options,
            name: index.name
          });
          console.log(`  ✓ Created index: ${index.name}`);
        } catch (error: any) {
          if (error.codeName === 'IndexOptionsConflict' || error.codeName === 'IndexKeySpecsConflict') {
            console.log(`  ⚠ Index ${index.name} already exists`);
          } else {
            console.error(`  ✗ Failed to create index ${index.name}:`, error.message);
          }
        }
      }
    }

    console.log(`\n✅ Schema copy complete!`);
    console.log(`Source: ${sourceDbName}`);
    console.log(`Target: ${targetDbName}`);
    console.log(`Collections copied: ${collections.length}`);
    console.log(`GitHub collections created: ${githubCollections.length}`);
    console.log(`Total collections in target: ${collections.length + githubCollections.length}`);

  } catch (error) {
    console.error('Error copying database schema:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

copyDatabaseSchema();
