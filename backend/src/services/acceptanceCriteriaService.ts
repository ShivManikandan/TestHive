import dotenv from 'dotenv';

dotenv.config();

export interface AcceptanceCriteria {
  scenario: string;
  given: string[];
  when: string[];
  then: string[];
}

export interface AcceptanceCriteriaResponse {
  success: boolean;
  criteria: AcceptanceCriteria[];
  formattedCriteria: string;
  error?: string;
}

export class AcceptanceCriteriaService {
  private mistralApiKey: string | undefined;

  constructor() {
    this.mistralApiKey = process.env.MISTRAL_API_KEY;
  }

  async generateAcceptanceCriteria(userStory: string, title?: string): Promise<AcceptanceCriteriaResponse> {
    if (!this.mistralApiKey) {
      return this.generateFallbackCriteria(userStory, title);
    }

    try {
      const prompt = `You are a Senior Business Analyst with 10+ years of experience in Healthcare IT, specializing in Electronic Health Records (EHR) systems, clinical workflow automation, and healthcare compliance (HIPAA, HL7, PoPIA).

Generate comprehensive acceptance criteria for the following healthcare user story in Given/When/Then format:

User Story Title: "${title || 'Healthcare User Story'}"
User Story: "${userStory}"

Requirements:
1. Create 3-5 acceptance criteria scenarios covering:
   - Happy path (main functionality)
   - Edge cases (error handling, validation)
   - Healthcare compliance (HIPAA, data security)
   - Integration scenarios (if applicable)
   - User experience validation

2. Each scenario must follow this structure:
   - Scenario: [Brief scenario description]
   - Given: [Preconditions - what exists before action]
   - When: [Action - what the user does]
   - Then: [Expected outcome - what should happen]

3. Focus on healthcare-specific considerations:
   - Patient data privacy and security
   - Clinical workflow integration
   - Regulatory compliance requirements
   - Data validation and error handling
   - Audit trail requirements

Return ONLY valid JSON in this format:
{
  "scenarios": [
    {
      "scenario": "Main functionality scenario",
      "given": ["precondition 1", "precondition 2"],
      "when": ["action 1", "action 2"],
      "then": ["expected result 1", "expected result 2"]
    }
  ]
}`;

      const mistralClient = (await import('./mistralApiClient')).default.getInstance();
      const response = await mistralClient.fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.mistralApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_CHAT_MODEL || 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        if (data.choices?.[0]?.message) {
          const content = data.choices[0].message.content.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const criteria = parsed.scenarios || [];
            
            return {
              success: true,
              criteria: criteria,
              formattedCriteria: this.formatCriteria(criteria)
            };
          }
        }
      }
    } catch (error) {
      console.warn('Mistral AI acceptance criteria generation failed, using fallback:', error);
    }

    return this.generateFallbackCriteria(userStory, title);
  }

  private generateFallbackCriteria(userStory: string, title?: string): AcceptanceCriteriaResponse {
    // Extract key components from user story
    const actorMatch = userStory.match(/as\s+(a|an)\s+([^,]+),?\s+i\s+want/i);
    const actor = actorMatch ? actorMatch[2].trim() : 'user';
    
    const actionMatch = userStory.match(/i\s+want\s+to\s+([^,]+?)(?:\s+so\s+that|,|$)/i);
    const action = actionMatch ? actionMatch[1].trim() : 'perform an action';
    
    const valueMatch = userStory.match(/so\s+that\s+(.+)/i);
    const value = valueMatch ? valueMatch[1].trim() : 'achieve the desired outcome';

    // Detect healthcare context
    const isPatientData = /patient|medical\s+record|health\s+record|clinical\s+data/i.test(userStory);
    const isPrescription = /prescription|medication|drug|pharmacy/i.test(userStory);
    const isAppointment = /appointment|schedule|booking|visit/i.test(userStory);
    const isCompliance = /hipaa|compliance|audit|security|privacy/i.test(userStory);

    // Generate basic scenarios
    const scenarios: AcceptanceCriteria[] = [];

    // Main functionality scenario
    scenarios.push({
      scenario: "Successful completion of main functionality",
      given: [
        `The ${actor} is authenticated and has appropriate permissions`,
        "The system is operational and accessible",
        ...(isPatientData ? ["Patient data exists in the system"] : []),
        ...(isPrescription ? ["Prescription data is available"] : []),
        ...(isAppointment ? ["Appointment slots are available"] : [])
      ],
      when: [
        `The ${actor} attempts to ${action}`,
        "All required fields are provided with valid data"
      ],
      then: [
        `The system successfully processes the request to ${action}`,
        `The ${actor} receives confirmation of successful completion`,
        value,
        ...(isCompliance ? ["All actions are logged for audit purposes"] : [])
      ]
    });

    // Validation scenario
    scenarios.push({
      scenario: "Input validation and error handling",
      given: [
        `The ${actor} is authenticated and has appropriate permissions`,
        "The system is operational"
      ],
      when: [
        `The ${actor} attempts to ${action} with invalid or missing data`,
        "Required fields are empty or contain invalid values"
      ],
      then: [
        "The system validates the input data",
        "Clear error messages are displayed for invalid fields",
        "No partial data is saved to maintain data integrity",
        ...(isPatientData ? ["Patient data privacy is maintained"] : [])
      ]
    });

    // Security/Compliance scenario (for healthcare)
    if (isCompliance || isPatientData) {
      scenarios.push({
        scenario: "Healthcare compliance and security validation",
        given: [
          `The ${actor} is attempting to access healthcare data`,
          "HIPAA compliance controls are active"
        ],
        when: [
          `The ${actor} performs ${action} involving patient data`,
          "The system processes healthcare information"
        ],
        then: [
          "All data access is logged with user identification and timestamp",
          "Patient data is encrypted and secure",
          "Access controls are enforced based on user role",
          "No unauthorized data exposure occurs"
        ]
      });
    }

    return {
      success: true,
      criteria: scenarios,
      formattedCriteria: this.formatCriteria(scenarios)
    };
  }

  private formatCriteria(criteria: AcceptanceCriteria[]): string {
    let formatted = "## Acceptance Criteria\n\n";
    
    criteria.forEach((criterion, index) => {
      formatted += `### Scenario ${index + 1}: ${criterion.scenario}\n\n`;
      
      formatted += "**Given:**\n";
      criterion.given.forEach(given => {
        formatted += `- ${given}\n`;
      });
      
      formatted += "\n**When:**\n";
      criterion.when.forEach(when => {
        formatted += `- ${when}\n`;
      });
      
      formatted += "\n**Then:**\n";
      criterion.then.forEach(then => {
        formatted += `- ${then}\n`;
      });
      
      formatted += "\n---\n\n";
    });

    return formatted;
  }
}