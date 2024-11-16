export interface Medication {
  id: string;
  name: string;
  activeIngredients: string[];
  usage: string;
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
  isGeneric: boolean;
  brandNames?: string[];
}

export interface Symptom {
  id: string;
  name: string;
  description: string;
}

export interface UserProfile {
  allergies: string[];
  medicalHistory: string[];
  preferences: {
    preferGeneric: boolean;
    language: string;
  };
}