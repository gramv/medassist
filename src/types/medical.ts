export type Severity = 'mild' | 'moderate' | 'severe';

export type Duration = 'just_started' | 'few_hours' | 'one_day' | 'few_days' | 'week_plus';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type SymptomCategory = 
  | 'pain'
  | 'respiratory'
  | 'digestive'
  | 'skin'
  | 'allergies'
  | 'fever'
  | 'other';

export interface SymptomAssessment {
  category: SymptomCategory;
  primarySymptom: string;
  severity: Severity;
  duration: Duration;
  gender: Gender;
  age: number;
  ageDetails: string;
  additionalSymptoms: string[];
  previousMedication?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
}

export interface MedicationRecommendation {
  primaryMedication: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    warnings: string[];
  };
  alternativeOptions?: {
    name: string;
    context: string;
  }[];
  lifestyle: string[];
  warnings: string[];
  seekMedicalAttention: boolean;
  urgencyLevel: 'routine' | 'soon' | 'urgent';
} 