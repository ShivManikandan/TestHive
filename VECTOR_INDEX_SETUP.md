# MongoDB Atlas Vector Search Index Setup

## Problem
Vector search is returning 0 results because the vector search index doesn't exist in MongoDB Atlas.

## Current Status
- ✅ Documents have embeddings (384 dimensions)
- ✅ MongoDB connection working
- ❌ **Vector search index missing**

## Solution: Create Vector Search Index in MongoDB Atlas

### Step 1: Access MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Log in to your account
3. Select your cluster: **cluster0.gva6qtb.mongodb.net**

### Step 2: Create Search Index
1. Click on the **"Atlas Search"** tab (or "Search" in newer UI)
2. Click **"Create Search Index"**
3. Select **"JSON Editor"**
4. Click **"Next"**

### Step 3: Configure the Index

**Database:** `raguserstories`  
**Collection:** `ragstories`  
**Index Name:** `vector_hybridretrieval_index`

**JSON Definition** (copy and paste this):

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    }
  ]
}
```

### Step 4: Create the Index
1. Click **"Next"**
2. Review the settings
3. Click **"Create Search Index"**
4. Wait for the index to build (usually takes 1-2 minutes)

### Step 5: Verify
Once the index shows status "Active", come back and test the search again.

## Why 1024 dimensions?
The `mistral-embed` model from Mistral AI produces embeddings with **1024 dimensions**. 
The current sample data has 384 dimensions (likely mock/random data from initialization script).

## After Creating the Index
You should:
1. Re-initialize the database with real Mistral embeddings:
   ```
   cd backend
   npm run init-db
   ```
2. Restart the application and test vector search

## Expected Result
After creating the index:
- Vector scores will be > 0.0%
- Hybrid search will combine both vector and BM25 results
- More accurate semantic search results
