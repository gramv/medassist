{
  "message": "Fix analyzeImage export and enhance safety checks",
  "content": "${Buffer.from(`
import { Groq } from 'groq-sdk';
import { env } from '../config/env';
import { 
  UserInfo, 
  Question, 
  FinalRecommendation, 
  ImageAnalysisResult, 
  DetailedAnalysis,
  AssessmentData,
  SymptomMatch,
  TimeFrame,
  QuestionnaireSection,
  ComprehensiveRecommendation
} from '../types';

// Constants
const VISION_MODEL = 'llama-3.2-90b-vision-preview';
const TEXT_MODEL = 'llama-3.1-70b-versatile';

export async function analyzeImage(base64Image: string, userInfo?: UserInfo): Promise<ImageAnalysisResult> {
  // Implementation remains the same
}

// Rest of the file
  `).toString('base64')}"
}