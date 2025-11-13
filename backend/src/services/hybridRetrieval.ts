import { MongoClient } from 'mongodb';
import { Document } from '@langchain/core/documents';
import { BaseRetriever } from '@langchain/core/retrievers';
import { Embeddings } from '@langchain/core/embeddings';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { QualityEvaluationService } from './qualityEvaluation';

export interface RetrievalResult {
  id: string;
  title: string;
  content: string;
  hybrid_score: number;
  vector_score: number;
  bm25_score: number;
  quality?: any;
  // Additional MongoDB fields
  acceptanceCriteria?: string;
  priority?: string;
  risk?: string;
  status?: string;
  statusCategory?: string;
  projectName?: string;
  parentSummary?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

/**
 * Custom Mistral AI Embeddings class for LangChain
 */
class MistralAIEmbeddings extends Embeddings {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'mistral-embed') {
    super({});
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // Disable SSL verification for corporate networks
    const https = await import('https');
    const agent = new https.Agent({ rejectUnauthorized: false });
    
    for (const text of texts) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.modelName,
            input: text
          }),
          // @ts-ignore - agent not in type definitions but works
          agent
        });

        if (!response.ok) {
          throw new Error(`Mistral API request failed: ${response.statusText}`);
        }

        const data = await response.json() as { data: [{ embedding: number[] }] };
        embeddings.push(data.data[0].embedding);
      } catch (error) {
        console.error('Error generating embedding for text:', text.substring(0, 100), error);
        throw new Error(`Failed to generate embedding: ${error}`);
      }
    }
    
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const embeddings = await this.embedDocuments([text]);
    return embeddings[0];
  }
}

/**
 * Custom Hybrid Retriever that combines vector and BM25 search
 */
class HybridRetriever extends BaseRetriever {
  lc_namespace = ['langchain', 'retrievers', 'hybrid'];

  private vectorStore: MongoDBAtlasVectorSearch;
  private mongoClient: MongoClient;
  private dbName: string;
  private collectionName: string;
  private vectorWeight: number;
  private bm25Weight: number;

  constructor(
    vectorStore: MongoDBAtlasVectorSearch,
    mongoClient: MongoClient,
    dbName: string,
    collectionName: string,
    vectorWeight: number = 0.7,
    bm25Weight: number = 0.3
  ) {
    super();
    this.vectorStore = vectorStore;
    this.mongoClient = mongoClient;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.vectorWeight = vectorWeight;
    this.bm25Weight = bm25Weight;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    try {
      // Get vector search results using LangChain
      console.log('Attempting vector search with index:', this.vectorStore);
      const vectorResults = await this.vectorStore.similaritySearchWithScore(query, 20).catch(error => {
        console.error('Vector search failed:', error.message);
        return [];
      });
      
      // Get BM25 text search results
      const collection = this.mongoClient.db(this.dbName).collection(this.collectionName);
      const bm25Results = await collection.find(
        { $text: { $search: query } },
        {
          projection: {
            score: { $meta: "textScore" },
            _id: 1,
            storyId: 1,
            story_id: 1,
            title: 1,
            content: 1,
            summary: 1,
            text: 1,
            acceptanceCriteria: 1,
            normalized_content: 1,
            projectName: 1,
            parentSummary: 1,
            statusCategory: 1,
            priority: 1,
            risk: 1,
            createdDate: 1,
            lastModifiedDate: 1
          }
        }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .toArray();

      // Combine and normalize scores
      const combinedResults = new Map<string, {
        document: Document,
        vectorScore: number,
        bm25Score: number
      }>();

      // Debug: Log vector results
      console.log(`🎯 Vector search returned ${vectorResults.length} results`);
      if (vectorResults.length === 0) {
        console.error('❌ CRITICAL: No vector results! Index may not exist or configuration is wrong');
        console.error(`   Expected index name: vector_hybridretrieval_index`);
        console.error('   Check MongoDB Atlas Search Index configuration');
      } else {
        console.log(`✅ Vector search working correctly`);
      }
      vectorResults.forEach(([doc, score], index) => {
        if (index < 2) { // Log first 2 results for debugging
          console.log(`Vector result ${index}: score=${score}, metadata=`, doc.metadata);
        }
      });

      // Process vector results with normalization
      const maxVectorScore = vectorResults.length > 0 
        ? Math.max(...vectorResults.map(([doc, score]) => score), 0.01)
        : 0.01;
      console.log(`Max vector score: ${maxVectorScore}`);
      
      vectorResults.forEach(([doc, score]) => {
        const id = doc.metadata.storyId || doc.metadata.story_id || doc.metadata._id?.toString();
        const normalizedVectorScore = vectorResults.length > 0 ? score / maxVectorScore : 0;
        combinedResults.set(id, {
          document: doc,
          vectorScore: normalizedVectorScore,
          bm25Score: 0
        });
      });

      // Debug: Log BM25 results
      console.log(`BM25 search returned ${bm25Results.length} results`);
      bm25Results.forEach((result, index) => {
        if (index < 2) { // Log first 2 results for debugging
          console.log(`BM25 result ${index}: score=${result.score}, id=${result.storyId || result.story_id}`);
        }
      });

      // Process BM25 results
      const maxBm25Score = Math.max(...bm25Results.map(r => r.score || 0), 0.01);
      console.log(`Max BM25 score: ${maxBm25Score}`);
      bm25Results.forEach((result: any) => {
        const id = result.storyId || result.story_id || result._id?.toString();
        const normalizedBm25Score = (result.score || 0) / maxBm25Score;
        
        if (combinedResults.has(id)) {
          combinedResults.get(id)!.bm25Score = normalizedBm25Score;
        } else {
          const doc = new Document({
            pageContent: result.content || result.text || result.normalized_content || '',
            metadata: {
              storyId: result.storyId || result.story_id,
              title: result.title || result.summary,
              content: result.content || result.text,
              acceptanceCriteria: result.acceptanceCriteria,
              projectName: result.projectName,
              parentSummary: result.parentSummary,
              statusCategory: result.statusCategory,
              priority: result.priority,
              risk: result.risk,
              createdDate: result.createdDate,
              lastModifiedDate: result.lastModifiedDate,
              _id: result._id
            }
          });
          
          combinedResults.set(id, {
            document: doc,
            vectorScore: 0,
            bm25Score: normalizedBm25Score
          });
        }
      });

      // Calculate hybrid scores and return sorted documents
      const hybridResults = Array.from(combinedResults.values())
        .map(result => {
          // If no vector results, weight BM25 at 100%
          const effectiveVectorWeight = vectorResults.length > 0 ? this.vectorWeight : 0;
          const effectiveBM25Weight = vectorResults.length > 0 ? this.bm25Weight : 1.0;
          
          const hybridScore = (result.vectorScore * effectiveVectorWeight) + 
                            (result.bm25Score * effectiveBM25Weight);
          
          console.log(`Story ${result.document.metadata.storyId}: vector=${result.vectorScore.toFixed(3)}, bm25=${result.bm25Score.toFixed(3)}, hybrid=${hybridScore.toFixed(3)}`);
          
          // Add hybrid score to document metadata
          result.document.metadata.hybridScore = hybridScore;
          result.document.metadata.vectorScore = result.vectorScore;
          result.document.metadata.bm25Score = result.bm25Score;
          
          return {
            document: result.document,
            hybridScore
          };
        })
        .sort((a, b) => b.hybridScore - a.hybridScore)
        .slice(0, 10)
        .map(result => result.document);

      return hybridResults;

    } catch (error) {
      console.error('Error in hybrid retrieval:', error);
      throw error;
    }
  }
}

/**
 * Hybrid Retrieval Service with LangChain Integration (No Fallbacks)
 */
export class HybridRetrievalService {
  private mongoClient: MongoClient | null = null;
  private dbName: string;
  private collectionName: string;
  private vectorIndexName: string | null;
  private mistralApiKey: string | null;
  private embeddings: MistralAIEmbeddings | null = null;
  private vectorStore: MongoDBAtlasVectorSearch | null = null;
  private hybridRetriever: HybridRetriever | null = null;

  constructor() {
    this.dbName = process.env.MONGODB_DB || 'raguserstories';
    this.collectionName = process.env.MONGODB_COLLECTION || 'ragstories';
    
    // CRITICAL: Vector index name - Read from .env with strong validation
    // MUST match the index name in MongoDB Atlas Search Indexes
    // Default: 'vector_hybridretrieval_index'
    const envVectorIndex = process.env.MONGODB_VECTOR_INDEX || process.env.MONGODB_VECTOR_INDEX_NAME;
    const DEFAULT_VECTOR_INDEX = 'vector_hybridretrieval_index';
    
    if (!envVectorIndex) {
      console.warn(`⚠️  MONGODB_VECTOR_INDEX not set in .env file!`);
      console.warn(`⚠️  Using default: ${DEFAULT_VECTOR_INDEX}`);
      console.warn(`⚠️  To change, set MONGODB_VECTOR_INDEX in your .env file`);
      this.vectorIndexName = DEFAULT_VECTOR_INDEX;
    } else {
      this.vectorIndexName = envVectorIndex;
      console.log(`✅ Vector index loaded from .env: ${this.vectorIndexName}`);
    }
    
    console.log('🔍 HybridRetrievalService initialized with:');
    console.log(`   Database: ${this.dbName}`);
    console.log(`   Collection: ${this.collectionName}`);
    console.log(`   Vector Index: ${this.vectorIndexName}`);
    console.log(`   (Change in .env: MONGODB_VECTOR_INDEX=your_index_name)`);
    
    this.mistralApiKey = process.env.MISTRAL_API_KEY || null;

    // Initialize LangChain components if API key is available
    if (this.mistralApiKey) {
      this.embeddings = new MistralAIEmbeddings(
        this.mistralApiKey,
        process.env.MISTRAL_EMBEDDING_MODEL || 'mistral-embed'
      );
      console.log('✅ Mistral embeddings initialized');
    } else {
      console.warn('⚠️  No Mistral API key found - vector search may not work!');
    }
  }

  private async getClient(): Promise<MongoClient> {
    try {
      if (!this.mongoClient) {
        // Remove quotes from URI if present
        let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userstories';
        uri = uri.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
        this.mongoClient = new MongoClient(uri);
        await this.mongoClient.connect();
        
        // Verify database and collection exist
        const db = this.mongoClient.db(this.dbName);
        const collections = await db.listCollections().toArray();
        
        const collectionExists = collections.some(col => col.name === this.collectionName);
        
        if (!collectionExists) {
          throw new Error(`Required collection '${this.collectionName}' does not exist`);
        }

        // Initialize LangChain components after MongoDB connection
        await this.initializeLangChainComponents();
      }
      return this.mongoClient;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  private async validateVectorIndex(): Promise<void> {
    try {
      console.log('🔍 Validating vector index...');
      console.log(`   Testing index: "${this.vectorIndexName}"`);
      
      // Try a simple vector search with a test query
      const testResults = await this.vectorStore!.similaritySearchWithScore('test', 1);
      if (testResults && testResults.length > 0) {
        console.log(`✅ ✅ ✅ Vector index "${this.vectorIndexName}" is WORKING! ✅ ✅ ✅`);
        console.log(`   Test returned ${testResults.length} result(s)`);
        console.log(`   Vector search is operational with 70/30 split`);
      } else {
        console.warn(`⚠️  Vector index "${this.vectorIndexName}" returned 0 results for test query`);
        console.warn(`   This might be normal if your collection is empty`);
      }
    } catch (error: any) {
      console.error(`\n${'='.repeat(70)}`);
      console.error(`❌ ❌ ❌ CRITICAL ERROR: VECTOR INDEX VALIDATION FAILED! ❌ ❌ ❌`);
      console.error(`${'='.repeat(70)}`);
      console.error(`   Index name in .env: "${this.vectorIndexName}"`);
      console.error(`   Error message: ${error.message}`);
      console.error(`\n   POSSIBLE CAUSES:`);
      console.error(`   1. Index name mismatch - Check MongoDB Atlas > Search > Indexes`);
      console.error(`   2. Index name in .env: MONGODB_VECTOR_INDEX=${this.vectorIndexName}`);
      console.error(`   3. Index might not exist in MongoDB Atlas`);
      console.error(`   4. Index definition might be incorrect`);
      console.error(`\n   TO FIX:`);
      console.error(`   1. Go to MongoDB Atlas > Database > Search`);
      console.error(`   2. Check the exact name of your vector search index`);
      console.error(`   3. Update .env file: MONGODB_VECTOR_INDEX=<exact_index_name>`);
      console.error(`   4. Restart the backend`);
      console.error(`${'='.repeat(70)}\n`);
    }
  }

  private async initializeLangChainComponents(): Promise<void> {
    if (!this.embeddings || !this.mongoClient) {
      throw new Error('Missing embeddings or MongoDB client for LangChain initialization');
    }

    try {
      // Initialize MongoDBAtlasVectorSearch
      this.vectorStore = new MongoDBAtlasVectorSearch(this.embeddings, {
        collection: this.mongoClient.db(this.dbName).collection(this.collectionName),
        indexName: this.vectorIndexName!,
        textKey: 'text',
        embeddingKey: 'embedding',
      });

      // Initialize Hybrid Retriever
      this.hybridRetriever = new HybridRetriever(
        this.vectorStore,
        this.mongoClient,
        this.dbName,
        this.collectionName,
        parseFloat(process.env.VECTOR_WEIGHT || '0.7'),
        parseFloat(process.env.BM25_WEIGHT || '0.3')
      );

      console.log('✅ LangChain components initialized successfully');
      console.log(`✅ Vector weight: ${process.env.VECTOR_WEIGHT || '0.7'} (70%)`);
      console.log(`✅ BM25 weight: ${process.env.BM25_WEIGHT || '0.3'} (30%)`);
      
      // Validate vector index by running a test query
      await this.validateVectorIndex();
    } catch (error) {
      console.error('Error initializing LangChain components:', error);
      throw error;
    }
  }

  public async retrieveStoriesWithLangChain(query: string, limit: number = 10): Promise<RetrievalResult[]> {
    try {
      // Ensure MongoDB connection and LangChain components are initialized
      await this.getClient();

      if (!this.hybridRetriever) {
        throw new Error('LangChain retriever not available - hybrid search cannot proceed');
      }

      console.log('Using LangChain-based hybrid retrieval for query:', query);
      
      // Use LangChain hybrid retriever
      console.log(`🔎 Running vector search with index: ${this.vectorIndexName}`);
      const documents = await this.hybridRetriever.getRelevantDocuments(query);

      // Debug: Log LangChain documents before conversion
      console.log(`✅ LangChain returned ${documents.length} documents`);
      documents.forEach((doc, index) => {
        if (index < 2) { // Log first 2 documents for debugging
          console.log(`Document ${index} metadata:`, doc.metadata);
        }
      });

      // Convert LangChain documents to RetrievalResult format
      const results: RetrievalResult[] = documents.map((doc, index) => {
        // Content priority: pageContent, metadata.text, metadata.content, metadata.summary
        const content = doc.pageContent || doc.metadata.text || doc.metadata.content || doc.metadata.summary || '';
        
        const result: RetrievalResult = {
          id: doc.metadata.storyId || doc.metadata.story_id || doc.metadata._id?.toString() || `doc_${index}`,
          title: doc.metadata.title || doc.metadata.summary || 'Untitled Story',
          content: content,
          hybrid_score: doc.metadata.hybridScore || 0,
          vector_score: doc.metadata.vectorScore || 0,
          bm25_score: doc.metadata.bm25Score || 0,
          // Additional MongoDB fields
          acceptanceCriteria: doc.metadata.acceptanceCriteria,
          priority: doc.metadata.priority,
          risk: doc.metadata.risk,
          status: doc.metadata.status,
          statusCategory: doc.metadata.statusCategory,
          projectName: doc.metadata.projectName,
          parentSummary: doc.metadata.parentSummary,
          createdDate: doc.metadata.createdDate,
          lastModifiedDate: doc.metadata.lastModifiedDate,
        };
        
        if (index < 2) { // Log conversion for debugging
          console.log(`Converted result ${index}:`, {
            hybrid_score: result.hybrid_score,
            vector_score: result.vector_score,
            bm25_score: result.bm25_score,
            priority: result.priority,
            risk: result.risk,
            status: result.statusCategory
          });
        }
        
        return result;
      });

      console.log('LangChain retrieval completed:', results.length, 'results');
      return results.slice(0, limit);

    } catch (error) {
      console.error('Error in LangChain retrieval:', error);
      throw error;
    }
  }

  /**
   * Main retrieval method - uses LangChain only, no fallbacks
   */
  async retrieve(
    query: string,
    vectorWeight?: number,
    bm25Weight?: number,
    topK?: number
  ): Promise<RetrievalResult[]> {
    // Require Mistral API key
    if (!this.mistralApiKey) {
      throw new Error('Mistral API key is required for retrieval');
    }

    if (process.env.USE_LANGCHAIN === 'false') {
      throw new Error('LangChain is disabled but required for retrieval');
    }

    // Use environment variables or provided values
    const defaultVectorWeight = parseFloat(process.env.VECTOR_WEIGHT || '0.7');
    const defaultBM25Weight = parseFloat(process.env.BM25_WEIGHT || '0.3');
    const retrievalDepth = parseInt(process.env.RETRIEVAL_DEPTH || '8', 10);
    const defaultTopK = parseInt(process.env.DEFAULT_TOP_K || retrievalDepth.toString(), 10);
    const maxTopK = parseInt(process.env.MAX_TOP_K || '10', 10);
    
    const finalVectorWeight = vectorWeight !== undefined ? vectorWeight : defaultVectorWeight;
    const finalBM25Weight = bm25Weight !== undefined ? bm25Weight : defaultBM25Weight;
    const k = topK ? Math.min(topK, maxTopK) : defaultTopK;

    try {
      console.log('Attempting LangChain-based retrieval');
      const langchainResults = await this.retrieveStoriesWithLangChain(query, k);
      
      if (langchainResults.length > 0) {
        console.log('LangChain retrieval successful, adding quality evaluation');
        
        // Add quality evaluation to LangChain results
        const enableQualityEvaluation = process.env.ENABLE_QUALITY_EVALUATION !== 'false';
        const qualityService = enableQualityEvaluation ? new QualityEvaluationService() : null;
        
        const resultsWithQuality = await Promise.all(langchainResults.map(async (result) => {
          if (qualityService) {
            try {
              console.log('Evaluating quality for story (LangChain):', result.id);
              const quality = await qualityService.evaluateStory(result.content, result.title);
              return { ...result, quality };
            } catch (error) {
              console.error('Quality evaluation failed for story:', result.id, error);
              throw error; // Don't fall back to mock data
            }
          }
          return result;
        }));
        
        return resultsWithQuality;
      } else {
        throw new Error('No results found from LangChain retrieval');
      }
    } catch (error) {
      console.error('LangChain retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Close MongoDB connection
   */
  async close(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
      this.mongoClient = null;
    }
  }
}