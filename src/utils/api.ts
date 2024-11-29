import { Groq } from 'groq-sdk';
import { env } from '../config/env';
import { UserInfo, Question, FinalRecommendation, ImageAnalysisResult } from '../types';

// Export functions directly
export async function analyzeImage(base64Image: string, userInfo?: UserInfo): Promise<ImageAnalysisResult> {
  // Implementation
}

// Other exports...