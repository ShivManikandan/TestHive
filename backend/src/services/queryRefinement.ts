import dotenv from 'dotenv';

dotenv.config();

export class QueryRefinementService {
  private mistralApiKey: string | undefined;

  constructor() {
    this.mistralApiKey = process.env.MISTRAL_API_KEY;
  }

  async refineQuery(query: string): Promise<string> {
    // Check if the query already has acceptance criteria
    const hasAcceptanceCriteria = /acceptance\s*criteria|given.*when.*then|scenario\s*:/i.test(query);
    
    if (!this.mistralApiKey) {
      return this.simpleRefinement(query, hasAcceptanceCriteria);
    }

    try {
      const mistralClient = (await import('./mistralApiClient')).default.getInstance();
      const response = await mistralClient.fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.mistralApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_CHAT_MODEL || 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: `You are an expert in refining user story queries for a healthcare IT system. Your task is to enhance and improve the user story while preserving any existing acceptance criteria.

Guidelines:
1. **Preserve Existing Content**: If the user story already has acceptance criteria, scenarios, or Given/When/Then statements, KEEP them exactly as they are
2. **Enhance the Core Story**: Only improve the main user story part (As a... I want... So that...)
3. **Add Healthcare Context**: Include relevant healthcare terminology (EHR, HIPAA, clinical workflows, etc.)
4. **Maintain Structure**: Keep the original format and structure intact

${hasAcceptanceCriteria ? 
  'IMPORTANT: This story already contains acceptance criteria. Preserve them exactly and only enhance the main story description.' : 
  'This story has no acceptance criteria yet. Focus on improving the main user story description only.'}

Return the complete enhanced story, preserving any existing acceptance criteria, scenarios, or Given/When/Then statements exactly as they were.`,
            },
            {
              role: 'user',
              content: `Enhance this healthcare user story while preserving any existing acceptance criteria: "${query}"`,
            },
          ],
          temperature: 0.3,
          max_tokens: 150,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        if (data.choices?.[0]?.message) {
          const refined = data.choices[0].message.content.trim();
          // Remove any quotes if the LLM wrapped the response
          return refined.replace(/^["']|["']$/g, '');
        }
      }
    } catch (error) {
      console.warn('Mistral AI refinement failed, using fallback:', error);
    }

    return this.simpleRefinement(query);
  }

  private simpleRefinement(query: string, hasAcceptanceCriteria: boolean = false): string {
    // If the query has acceptance criteria, don't apply keyword expansion that might break formatting
    if (hasAcceptanceCriteria) {
      // Just return the original query with minor cleanup
      return query.trim();
    }

    // Enhanced keyword expansion for healthcare domain (only for basic stories)
    const expansions: { [key: string]: string } = {
      'patient': 'patient healthcare medical clinical',
      'doctor': 'doctor physician clinician healthcare provider medical professional',
      'nurse': 'nurse nursing clinical staff healthcare worker',
      'prescription': 'prescription medication drug pharmacy pharmaceutical',
      'ehr': 'electronic health record EHR patient data medical records',
      'hipaa': 'HIPAA compliance privacy security data protection',
      'popia': 'PoPIA protection of personal information privacy',
      'dashboard': 'dashboard interface UI user interface',
      'workflow': 'workflow process automation clinical workflow',
      'data': 'data information records patient data',
    };

    let refined = query.toLowerCase();
    const words = refined.split(/\s+/);
    const expandedWords: string[] = [];

    for (const word of words) {
      if (expansions[word]) {
        expandedWords.push(expansions[word]);
      } else {
        expandedWords.push(word);
      }
    }

    return expandedWords.join(' ') || query;
  }
}
