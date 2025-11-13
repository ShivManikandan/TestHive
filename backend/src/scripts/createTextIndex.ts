import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function createTextIndex() {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userstories';
    uri = uri.replace(/^["']|["']$/g, '');
    
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const dbName = process.env.MONGODB_DB || 'raguserstories';
    const collectionName = process.env.MONGODB_COLLECTION || 'ragstories';
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Check existing indexes
    const existingIndexes = await collection.indexes();
    console.log('\nExisting indexes:');
    existingIndexes.forEach(idx => console.log(`  - ${idx.name}`));
    
    // Check if text index already exists
    const hasTextIndex = existingIndexes.some(idx => idx.name === 'text_search_index');
    
    if (hasTextIndex) {
      console.log('\n✅ Text search index already exists');
    } else {
      console.log('\n📝 Creating text search index...');
      await collection.createIndex({ 
        title: 'text',
        summary: 'text',
        text: 'text',
        content: 'text', 
        normalized_content: 'text' 
      }, {
        name: 'text_search_index',
        default_language: 'english',
        weights: {
          title: 3,
          summary: 3,
          text: 2,
          content: 2,
          normalized_content: 1
        }
      });
      console.log('✅ Text search index created successfully');
    }
    
    await client.close();
    console.log('\n✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTextIndex();
