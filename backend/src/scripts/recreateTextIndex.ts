import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function recreateTextIndex() {
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
    
    // Drop existing text index
    try {
      console.log('\n🗑️  Dropping old text search index...');
      await collection.dropIndex('text_search_index');
      console.log('✅ Old index dropped');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('⚠️  Index does not exist, continuing...');
      } else {
        throw error;
      }
    }
    
    // Create new text index with correct fields
    console.log('\n📝 Creating new text search index...');
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
    
    // Verify
    const indexes = await collection.indexes();
    console.log('\n📑 All indexes:');
    indexes.forEach(idx => console.log(`  - ${idx.name}`));
    
    await client.close();
    console.log('\n✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

recreateTextIndex();
