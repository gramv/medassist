export interface UserInfo {
  age: number;
  ageUnit: 'years' | 'months';
  gender: string;
  primaryIssue: string;
}

export interface Question {
  question: string;
  options: string[];
}

export interface ImageAnalysisResult {
  bodyPart: {
    detected: string;
    confidence: string;
  };
  condition: {
    type: string;
    characteristics: string[];
    severity: 'mild' | 'moderate' | 'severe';
    confidence: string;
    stage: 'acute' | 'subacute' | 'chronic';
    visualFeatures: {
      primary: string[];
      secondary: string[];
    };
  };
  urgency: {
    requiresMedicalAttention: boolean;
    timeframe: 'immediate' | '24_hours' | 'within_week' | 'self_care';
    reasoning: string[];
    redFlags: string[];
  };
}

export interface DetailedAnalysis {
  analysis: {
    condition: {
      affectedArea: {
        bodyPart: string;
        location: string;
        description: string;
      };
      possibleDiagnoses: string[];
      visualSymptoms: string[];
      severity: 'mild' | 'moderate' | 'severe';
      confidence: number;
    };
    urgency: {
      requiresMedicalAttention: boolean;
      timeframe: string;
      factors: string[];
    };
  };
  doctorVisit: {
    recommended: boolean;
    questionsForDoctor: string[];
    symptomsToMention: string[];
    relevantHistory: string[];
    suggestedTests: string[];
  };
}

export interface AssessmentData {
  userInfo: UserInfo;
  imageAnalysis?: ImageAnalysisResult;
  detailedAnalysis?: DetailedAnalysis;
  questionnaireAnswers: Record<string, string>;
}

export interface FinalRecommendation {
  severity: 'mild' | 'moderate' | 'severe';
  medicalAttention: {
    required: boolean;
    timeframe: 'immediate' | '24_hours' | 'within_week' | 'self_care';
    reasons: string[];
  };
  medications: {
    name: string;
    brandNames: string[];
    dosage: string;
    frequency: string;
    duration: string;
    expectedResults: string;
    warnings: string[];
  }[];
  alternatives: {
    naturalRemedies: {
      remedy: string;
      usage: string;
      frequency: string;
      benefits: string;
    }[];
    alternativeMedications: {
      name: string;
      brandNames: string[];
      whenToConsider: string;
      benefits: string;
    }[];
  };
  lifestyle: {
    category: 'diet' | 'activity' | 'prevention' | 'recovery';
    recommendations: string[];
  }[];
  monitoring: {
    warningSignals: string[];
    seekHelpIf: string[];
  };
  doctorVisit?: {
    questionsForDoctor: string[];
    symptomsToMention: string[];
    suggestedTests: string[];
    historyToMention: string[];
  };
}

// Type aliases for better readability
export type AnalysisType = ImageAnalysisResult | DetailedAnalysis;
export type SymptomSeverity = 'mild' | 'moderate' | 'severe';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type TimeFrame = 'immediate' | '24_hours' | 'within_week' | 'self_care';

// Re-export for backward compatibility
export type VisualAnalysis = DetailedAnalysis;
export type Assessment = UserInfo;
export type FollowUpQuestion = Question;
export type ImageAnalysis = ImageAnalysisResult;

export interface SymptomMatch {
  shouldShowMismatch: boolean;
  explanation: string;
}