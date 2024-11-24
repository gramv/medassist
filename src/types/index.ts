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

export type TimeFrame = 'immediate' | '24_hours' | 'within_week' | 'self_care';
export type UrgencyLevel = 'emergency' | 'urgent' | 'routine';

export interface ImageAnalysisResult extends EnhancedImageAnalysis {
  anatomicalDetails: {
    location: {
      primarySite: string;
      specificLocation: string;
      depth: 'superficial' | 'moderate' | 'deep';
      distribution: 'localized' | 'spreading' | 'diffuse';
    };
    measurements: {
      approximateSize: string;
      affectedArea: string;
      spreadPattern: string;
    };
  };
  visualCharacteristics: {
    primary: {
      color: string[];
      texture: string[];
      pattern: string;
      borders: string;
    };
    secondary: {
      surroundingTissue: string[];
      associatedFeatures: string[];
    };
    progression: {
      stage: 'acute' | 'subacute' | 'chronic';
      timeline: string;
      healingIndicators: string[];
    };
  };
  clinicalAssessment: {
    primaryCondition: string;
    differentialDiagnoses: string[];
    confidence: number;
    severityIndicators: string[];
    complicationRisks: string[];
  };
  medicalConsiderations: {
    requiresAttention: boolean;
    urgencyLevel: UrgencyLevel;
    reasonsForUrgency: string[];
    recommendedTimeframe: string;
    warningSignsPresent: string[];
  };
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
    timeframe: TimeFrame;
    reasoning: string[];
    redFlags: string[];
  };
}

export interface EnhancedImageAnalysis extends ImageAnalysisResult {
  anatomicalDetails: {
    location: {
      primarySite: string;
      specificLocation: string;
      depth: 'superficial' | 'moderate' | 'deep';
      distribution: 'localized' | 'spreading' | 'diffuse';
    };
    measurements: {
      approximateSize: string;
      affectedArea: string;
      spreadPattern: string;
    };
  };
  visualCharacteristics: {
    primary: {
      color: string[];
      texture: string[];
      pattern: string;
      borders: string;
    };
    secondary: {
      surroundingTissue: string[];
      associatedFeatures: string[];
    };
    progression: {
      stage: 'acute' | 'subacute' | 'chronic';
      timeline: string;
      healingIndicators: string[];
    };
  };
  clinicalAssessment: {
    primaryCondition: string;
    differentialDiagnoses: string[];
    confidence: number;
    severityIndicators: string[];
    complicationRisks: string[];
  };
  medicalConsiderations: {
    requiresAttention: boolean;
    urgencyLevel: 'routine' | 'urgent' | 'emergency';
    reasonsForUrgency: string[];
    recommendedTimeframe: string;
    warningSignsPresent: string[];
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

export interface ComprehensiveRecommendation {
  condition: {
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    expectedDuration: string;
  };
  medicalAttention: {
    required: boolean;
    timeframe: TimeFrame;
    reasons: string[];
    doctorType?: string;
    urgencyLevel?: 'immediate' | '24_hours' | 'routine';
  };
  medications: {
    primary: DrugRecommendation;
    alternatives: DrugRecommendation[];
  };
  naturalRemedies: NaturalRemedy[];
  lifestyle: LifestyleRecommendation[];
  emergencyGuidelines: EmergencyGuidelines;
  followUp: {
    timeframe: string;
    checkpoints: string[];
    improvementSigns: string[];
    worseningSigns: string[];
  };
  prevention: {
    shortTerm: string[];
    longTerm: string[];
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

export interface QuestionnaireQuestion {
  id: string;
  category: 'symptoms' | 'history' | 'lifestyle' | 'treatment' | 'risk';
  importance: 'critical' | 'high' | 'medium' | 'low';
  question: string;
  options: string[];
  followUp?: {
    condition: string;
    questions: string[];
  };
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string;
  questions: QuestionnaireQuestion[];
}

export interface MedicationDetails {
  name: string;
  brandNames: string[];
  activeIngredient: string;
  dosageForm: 'tablet' | 'capsule' | 'liquid' | 'cream' | 'ointment' | 'drops';
  strength: string;
  standardDosage: {
    adult: string;
    child?: string;
    elderly?: string;
  };
  frequency: string;
  maxDailyDose: string;
  warnings: string[];
  contraindications: string[];
  sideEffects: {
    common: string[];
    serious: string[];
  };
  interactions: {
    medications: string[];
    conditions: string[];
  };
}

export interface TreatmentTimeline {
  expectedDuration: string;
  checkpoints: {
    timepoint: string;
    expectedProgress: string;
    warningSignals: string[];
  }[];
  followUpNeeded: boolean;
  followUpTimeframe?: string;
}

export interface SafetyAssessment {
  emergencyWarnings: string[];
  redFlags: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'emergency';
  requiresImmediateAttention: boolean;
  monitoringInstructions: string[];
}

export interface DrugRecommendation {
  name: string;
  isMainRecommendation: boolean;
  type: 'primary' | 'alternative';
  activeIngredient: string;
  dosageForm: 'tablet' | 'capsule' | 'liquid' | 'cream' | 'gel' | 'ointment';
  typicalDosage: {
    amount: string;
    frequency: string;
    duration: string;
    specialInstructions: string[];
  };
  effectiveness: number; // 1-5 scale
  sideEffects: {
    common: string[];
    rare: string[];
    warningFlags: string[];
  };
  brands: {
    name: string;
    form: string;
    strength: string;
    priceRange: {
      min: number;
      max: number;
      currency: string;
    };
    availability: 'widely available' | 'limited availability' | 'prescription only';
  }[];
  warnings: {
    interactions: string[];
    contraindications: string[];
    precautions: string[];
  };
}

export interface NaturalRemedy {
  name: string;
  type: 'herb' | 'supplement' | 'therapy' | 'food';
  effectiveness: number; // 1-5 scale
  usage: {
    method: string;
    frequency: string;
    duration: string;
    preparation: string;
  };
  benefits: string[];
  scientificEvidence: 'strong' | 'moderate' | 'limited' | 'anecdotal';
  precautions: string[];
}

export interface LifestyleRecommendation {
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'environmental';
  priority: 'essential' | 'important' | 'helpful';
  recommendations: {
    action: string;
    frequency: string;
    explanation: string;
    tips: string[];
  }[];
  expectedBenefits: string[];
  timeToEffect: string;
}

export interface EmergencyGuidelines {
  warningSymptoms: string[];
  immediateActions: string[];
  whenToSeekHelp: string[];
  medicalContactInfo?: {
    type: string;
    recommendation: string;
    urgency: 'immediate' | '24_hours' | 'routine';
  };
}