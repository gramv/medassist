export interface UserInfo {
  age: number;
  ageUnit: 'years' | 'months';
  gender: string;
  primaryIssue: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
}

export interface Recommendation {
  severity: 'mild' | 'medium' | 'serious';
  medications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  instructions: string;
  precautions: string[];
  seekHelp: string;
  alternatives: {
    naturalRemedies: string[];
    alternativeMedications: {
      name: string;
      description: string;
    }[];
  };
  lifestyle: string[];
}