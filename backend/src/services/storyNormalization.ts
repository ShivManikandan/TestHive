export class StoryNormalizationService {
  
  // Healthcare abbreviations and synonyms mapping
  private readonly healthcareAbbreviations: { [key: string]: string } = {
    'EHR': 'Electronic Health Record',
    'EMR': 'Electronic Medical Record',
    'PHI': 'Protected Health Information',
    'HIPAA': 'Health Insurance Portability and Accountability Act',
    'HL7': 'Health Level Seven',
    'FHIR': 'Fast Healthcare Interoperability Resources',
    'CPT': 'Current Procedural Terminology',
    'ICD': 'International Classification of Diseases',
    'ED': 'Emergency Department',
    'OR': 'Operating Room',
    'ICU': 'Intensive Care Unit',
    'CCU': 'Cardiac Care Unit',
    'NICU': 'Neonatal Intensive Care Unit',
    'PICU': 'Pediatric Intensive Care Unit',
    'RN': 'Registered Nurse',
    'MD': 'Medical Doctor',
    'PA': 'Physician Assistant',
    'NP': 'Nurse Practitioner',
    'CNA': 'Certified Nursing Assistant',
    'LPN': 'Licensed Practical Nurse',
    'RT': 'Respiratory Therapist',
    'PT_THERAPY': 'Physical Therapist',
    'OT': 'Occupational Therapist',
    'PACS': 'Picture Archiving and Communication System',
    'RIS': 'Radiology Information System',
    'LIS': 'Laboratory Information System',
    'HIS': 'Hospital Information System',
    'ADT': 'Admission Discharge Transfer',
    'CPOE': 'Computerized Provider Order Entry',
    'CDSS': 'Clinical Decision Support System',
    'QA': 'Quality Assurance',
    'QI': 'Quality Improvement',
    'CQM': 'Clinical Quality Measures',
    'MIPS': 'Merit-based Incentive Payment System',
    'CMS': 'Centers for Medicare & Medicaid Services',
    'FDA': 'Food and Drug Administration',
    'DEA': 'Drug Enforcement Administration',
    'Rx': 'Prescription',
    'PRN': 'Pro Re Nata (as needed)',
    'BID': 'Bis In Die (twice daily)',
    'TID': 'Ter In Die (three times daily)',
    'QID': 'Quater In Die (four times daily)',
    'mg': 'milligrams',
    'ml': 'milliliters',
    'cc': 'cubic centimeters',
    'IV': 'Intravenous',
    'IM': 'Intramuscular',
    'PO': 'Per Os (by mouth)',
    'SL': 'Sublingual',
    'PR': 'Per Rectum',
    'TOP': 'Topical',
    'INH': 'Inhalation',
    'BP': 'Blood Pressure',
    'HR': 'Heart Rate',
    'RR': 'Respiratory Rate',
    'O2': 'Oxygen',
    'CBC': 'Complete Blood Count',
    'BMP': 'Basic Metabolic Panel',
    'CMP': 'Comprehensive Metabolic Panel',
    'PT_LAB': 'Prothrombin Time',
    'PTT': 'Partial Thromboplastin Time',
    'INR': 'International Normalized Ratio',
    'ESR': 'Erythrocyte Sedimentation Rate',
    'CRP': 'C-Reactive Protein',
    'BUN': 'Blood Urea Nitrogen',
    'GFR': 'Glomerular Filtration Rate',
    'A1C': 'Hemoglobin A1C',
    'TSH': 'Thyroid Stimulating Hormone',
    'PSA': 'Prostate Specific Antigen',
    'ECG': 'Electrocardiogram',
    'EKG': 'Electrocardiogram',
    'MRI': 'Magnetic Resonance Imaging',
    'CT': 'Computed Tomography',
    'PET': 'Positron Emission Tomography',
    'US': 'Ultrasound',
    'DICOM': 'Digital Imaging and Communications in Medicine'
  };

  // Healthcare synonyms
  private readonly healthcareSynonyms: { [key: string]: string[] } = {
    'patient': ['client', 'individual', 'person', 'case', 'subject'],
    'doctor': ['physician', 'clinician', 'provider', 'MD', 'medical doctor'],
    'nurse': ['RN', 'registered nurse', 'nursing staff', 'caregiver'],
    'medication': ['drug', 'medicine', 'pharmaceutical', 'therapy', 'treatment'],
    'prescription': ['Rx', 'order', 'medication order', 'drug order'],
    'hospital': ['facility', 'medical center', 'healthcare facility', 'institution'],
    'appointment': ['visit', 'consultation', 'encounter', 'session'],
    'record': ['chart', 'file', 'documentation', 'history'],
    'test': ['lab', 'laboratory', 'diagnostic', 'examination', 'screening'],
    'result': ['outcome', 'finding', 'report', 'value', 'data'],
    'treatment': ['therapy', 'intervention', 'care', 'management', 'protocol'],
    'diagnosis': ['condition', 'disease', 'disorder', 'illness', 'pathology'],
    'symptom': ['sign', 'manifestation', 'indicator', 'complaint', 'presentation']
  };

  /**
   * Normalize a user story by applying healthcare-specific transformations
   */
  public normalizeStory(story: string): string {
    let normalized = story;

    // Step 1: Basic text normalization
    normalized = this.basicNormalization(normalized);

    // Step 2: Expand healthcare abbreviations
    normalized = this.expandAbbreviations(normalized);

    // Step 3: Standardize healthcare terms
    normalized = this.standardizeHealthcareTerms(normalized);

    // Step 4: Flatten acceptance criteria format
    normalized = this.flattenAcceptanceCriteria(normalized);

    // Step 5: Final cleanup
    normalized = this.finalCleanup(normalized);

    return normalized;
  }

  /**
   * Basic text normalization
   */
  private basicNormalization(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\.,;:()\-]/g, ' ') // Remove special characters except common punctuation
      .trim();
  }

  /**
   * Expand healthcare abbreviations
   */
  private expandAbbreviations(text: string): string {
    let expanded = text;
    
    Object.entries(this.healthcareAbbreviations).forEach(([abbrev, full]) => {
      // Case-insensitive replacement with word boundaries
      const regex = new RegExp(`\\b${abbrev.toLowerCase()}\\b`, 'gi');
      expanded = expanded.replace(regex, full.toLowerCase());
    });

    return expanded;
  }

  /**
   * Standardize healthcare terms using synonyms
   */
  private standardizeHealthcareTerms(text: string): string {
    let standardized = text;
    
    Object.entries(this.healthcareSynonyms).forEach(([standard, synonyms]) => {
      synonyms.forEach(synonym => {
        const regex = new RegExp(`\\b${synonym.toLowerCase()}\\b`, 'gi');
        standardized = standardized.replace(regex, standard);
      });
    });

    return standardized;
  }

  /**
   * Flatten acceptance criteria to consistent format
   */
  private flattenAcceptanceCriteria(text: string): string {
    // Convert various acceptance criteria formats to standard format
    let flattened = text;

    // Convert "Given... When... Then..." to inline format
    flattened = flattened.replace(/given\s+([^.]+)\.\s*when\s+([^.]+)\.\s*then\s+([^.]+)\./gi, 
      'acceptance criteria: given $1, when $2, then $3.');

    // Convert bullet points to inline format
    flattened = flattened.replace(/[-•*]\s*([^.\n]+)/g, 'requirement: $1.');

    // Convert numbered lists to inline format  
    flattened = flattened.replace(/\d+\.\s*([^.\n]+)/g, 'requirement: $1.');

    return flattened;
  }

  /**
   * Final cleanup of the normalized text
   */
  private finalCleanup(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Final space cleanup
      .replace(/\s*([.,:;])\s*/g, '$1 ') // Fix punctuation spacing
      .replace(/\s+$/, '') // Remove trailing spaces
      .trim();
  }

  /**
   * Extract and structure acceptance criteria from the story
   */
  public extractAcceptanceCriteria(story: string): string[] {
    const criteria: string[] = [];
    
    // Look for "Given/When/Then" patterns
    const givenWhenThenMatches = story.match(/given[^.]+when[^.]+then[^.]+/gi);
    if (givenWhenThenMatches) {
      criteria.push(...givenWhenThenMatches);
    }

    // Look for "acceptance criteria" section
    const acceptanceCriteriaMatch = story.match(/acceptance criteria:([^.]+(?:\.[^.]*)*)/i);
    if (acceptanceCriteriaMatch) {
      criteria.push(acceptanceCriteriaMatch[1].trim());
    }

    // Look for requirement patterns
    const requirementMatches = story.match(/requirement:[^.]+\./gi);
    if (requirementMatches) {
      criteria.push(...requirementMatches.map(req => req.replace('requirement:', '').trim()));
    }

    return criteria.filter(criterion => criterion.length > 10); // Filter out very short criteria
  }

  /**
   * Validate if the story follows proper healthcare user story structure
   */
  public validateStructure(story: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for "As a..." pattern
    if (!story.match(/as\s+a(n)?\s+[\w\s]+/i)) {
      issues.push('Missing "As a [role]" actor definition');
    }

    // Check for "I want..." pattern
    if (!story.match(/i\s+want\s+to\s+|i\s+need\s+to\s+|i\s+should\s+be\s+able\s+to\s+/i)) {
      issues.push('Missing "I want/need" functionality description');
    }

    // Check for "so that..." pattern
    if (!story.match(/so\s+that\s+|in\s+order\s+to\s+|to\s+enable\s+/i)) {
      issues.push('Missing "so that" business value explanation');
    }

    // Check for healthcare context
    const hasHealthcareContext = Object.keys(this.healthcareAbbreviations).some(abbrev => 
      story.toLowerCase().includes(abbrev.toLowerCase())) ||
      Object.keys(this.healthcareSynonyms).some(term => 
        story.toLowerCase().includes(term));
    
    if (!hasHealthcareContext) {
      issues.push('Story may lack healthcare domain context');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}