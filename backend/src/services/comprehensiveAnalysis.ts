import { HybridRetrievalService, RetrievalResult } from './hybridRetrieval';
import { QualityEvaluationService, StoryQuality } from './qualityEvaluation';
import { StoryNormalizationService } from './storyNormalization';
import { StoryRefinementService, RefinedStory } from './storyRefinement';

export interface ComprehensiveAnalysisResult {
  // Input processing
  originalStory: string;
  normalizedStory: string;
  structureValidation: {
    isValid: boolean;
    issues: string[];
  };
  
  // Retrieval results (top 5-6 related stories)
  relatedStories: RetrievalResult[];
  retrievalMetadata: {
    totalFound: number;
    vectorWeight: number;
    bm25Weight: number;
    query: string;
  };
  
  // Quality evaluation (5 parameters, each out of 20)
  qualityEvaluation: StoryQuality;
  
  // Story refinement
  refinedStory: RefinedStory;
  
  // Summary and recommendations
  summary: {
    overallScore: number;
    grade: string;
    keyStrengths: string[];
    priorityImprovements: string[];
    recommendedActions: string[];
  };
}

export class ComprehensiveStoryAnalysisService {
  private retrievalService: HybridRetrievalService;
  private qualityService: QualityEvaluationService;
  private normalizationService: StoryNormalizationService;
  private refinementService: StoryRefinementService;
  private mongoClient: any = null;

  constructor() {
    this.retrievalService = new HybridRetrievalService();
    this.qualityService = new QualityEvaluationService();
    this.normalizationService = new StoryNormalizationService();
    this.refinementService = new StoryRefinementService();
  }

  /**
   * Perform comprehensive analysis as specified in the ICE POT prompt
   */
  async analyzeStory(
    inputStory: string,
    title?: string,
    vectorWeight: number = 0.7,
    bm25Weight: number = 0.3
  ): Promise<ComprehensiveAnalysisResult> {
    
    // Step 1: Normalize the Input User Story
    const normalizedStory = this.normalizationService.normalizeStory(inputStory);
    const structureValidation = this.normalizationService.validateStructure(normalizedStory);
    
    // Step 2: Generate Embeddings & Retrieve Data (Hybrid: 70% Vector, 30% BM25)
    const relatedStories = await this.retrievalService.retrieveStoriesWithLangChain(
      normalizedStory,
      10  // Get 10 stories, then slice to top 6
    );
    
    // Limit to top 5-6 as per prompt requirement
    const topRelatedStories = relatedStories.slice(0, 6);
    
    // Step 3: Quality Analysis (5 dimensions, each out of 20)
    const qualityEvaluation = await this.qualityService.evaluateStory(
      normalizedStory,
      title || 'Healthcare User Story'
    );
    
    // Step 4: Story Refinement with unique ID generation
    const refinedStory = await this.refinementService.refineStory(
      inputStory,
      normalizedStory,
      qualityEvaluation,
      title,
      undefined // storyId will be generated uniquely by checking MongoDB
    );
    
    // Step 5: Generate comprehensive summary
    const summary = this.generateSummary(qualityEvaluation, structureValidation, topRelatedStories);
    
    return {
      originalStory: inputStory,
      normalizedStory,
      structureValidation,
      relatedStories: topRelatedStories,
      retrievalMetadata: {
        totalFound: relatedStories.length,
        vectorWeight,
        bm25Weight,
        query: normalizedStory
      },
      qualityEvaluation,
      refinedStory,
      summary
    };
  }

  private generateSummary(
    quality: StoryQuality,
    structure: { isValid: boolean; issues: string[] },
    relatedStories: RetrievalResult[]
  ) {
    const scores = [
      quality.clarity.score,
      quality.completeness.score,
      quality.businessValueAlignment.score,
      quality.testability.score,
      quality.technicalFeasibility.score
    ];

    // Identify strengths (scores >= 16/20)
    const keyStrengths: string[] = [];
    if (quality.clarity.score >= 16) keyStrengths.push('Clear and unambiguous story structure');
    if (quality.completeness.score >= 16) keyStrengths.push('Well-defined acceptance criteria and preconditions');
    if (quality.businessValueAlignment.score >= 16) keyStrengths.push('Strong healthcare business value alignment');
    if (quality.testability.score >= 16) keyStrengths.push('Highly testable with clear validation criteria');
    if (quality.technicalFeasibility.score >= 16) keyStrengths.push('Technically feasible with realistic constraints');
    if (structure.isValid) keyStrengths.push('Follows proper user story structure');

    // Identify priority improvements (scores < 14/20)
    const priorityImprovements: string[] = [];
    if (quality.clarity.score < 14) priorityImprovements.push('Improve story clarity and actor definition');
    if (quality.completeness.score < 14) priorityImprovements.push('Add comprehensive acceptance criteria');
    if (quality.businessValueAlignment.score < 14) priorityImprovements.push('Strengthen healthcare business value proposition');
    if (quality.testability.score < 14) priorityImprovements.push('Make story more testable with specific criteria');
    if (quality.technicalFeasibility.score < 14) priorityImprovements.push('Clarify technical implementation requirements');
    if (!structure.isValid) priorityImprovements.push('Fix structural issues: ' + structure.issues.join(', '));

    // Generate recommended actions
    const recommendedActions: string[] = [];
    
    if (quality.overallScore < 60) {
      recommendedActions.push('Major revision recommended - story needs significant improvement');
    } else if (quality.overallScore < 80) {
      recommendedActions.push('Moderate revision needed - focus on priority improvement areas');
    } else {
      recommendedActions.push('Minor refinements needed - story is in good shape');
    }

    if (relatedStories.length > 0) {
      recommendedActions.push(`Review ${relatedStories.length} similar stories for consistency and patterns`);
    }

    if (quality.improvementAreas.length > 0) {
      recommendedActions.push('Address specific improvement areas identified in quality evaluation');
    }

    recommendedActions.push('Validate refined story with stakeholders before implementation');
    recommendedActions.push('Ensure compliance with healthcare regulations and standards');

    return {
      overallScore: quality.overallScore,
      grade: quality.grade,
      keyStrengths,
      priorityImprovements,
      recommendedActions
    };
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.retrievalService.close();
  }
}