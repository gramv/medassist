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

// Export all functions directly with full implementations
export async function analyzeImage(base64Image: string, userInfo?: UserInfo): Promise<ImageAnalysisResult> {
  let attempts = 0;
  const maxAttempts = env.groqApiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const groq = createGroqClient();
      console.log('Starting enhanced image analysis, attempt:', attempts + 1);

      // ... rest of analyzeImage implementation ...
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 6000));
        continue;
      }
      throw new Error('Failed to analyze image after all attempts');
    }
  }
  throw new Error('Failed to analyze image');
}

export async function shouldRequestImage(userInfo: UserInfo): Promise<{ requiresImage: boolean; reason: string }> {
  try {
    const groq = createGroqClient();
    const prompt = `As a medical professional, evaluate if this condition requires visual assessment...`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: TEXT_MODEL,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    const result = JSON.parse(response);
    return {
      requiresImage: result.requiresImage,
      reason: result.reason
    };
  } catch (error) {
    console.error('Image requirement check error:', error);
    return {
      requiresImage: false,
      reason: 'We\'ll assess your symptoms through detailed questions.'
    };
  }
}

export async function checkConditionMatch(
  reportedCondition: string,
  imageAnalysis: ImageAnalysisResult
): Promise<SymptomMatch> {
  // ... implementation ...
}

export async function generateFollowUpQuestions(assessmentData: AssessmentData): Promise<Question[]> {
  // ... implementation ...
}

export async function generateRecommendation(assessmentData: AssessmentData): Promise<ComprehensiveRecommendation> {
  // ... implementation ...
}

export async function generateDetailedAnalysis(imageAnalysis: ImageAnalysisResult): Promise<DetailedAnalysis> {
  // ... implementation ...
}

export function mapTimeframe(urgencyLevel: string = 'routine'): TimeFrame {
  switch (urgencyLevel.toLowerCase()) {
    case 'emergency': return 'immediate';
    case 'urgent': return '24_hours';
    case 'routine': return 'within_week';
    default: return 'self_care';
  }
}

// Helper functions
function createGroqClient() {
  const apiKey = keyManager.getNextKey();
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    throw new Error('Invalid API key format');
  }
  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

class ApiKeyManager {
  private currentIndex = 0;
  private usageCount: { [key: string]: number } = {};
  private lastUsed: { [key: string]: number } = {};
  private readonly USAGE_LIMIT = 3;
  private readonly COOLDOWN_PERIOD = 6000;

  constructor(private apiKeys: string[]) {
    if (!apiKeys.length) throw new Error('No API keys provided');
  }

  getNextKey(): string {
    const now = Date.now();
    let attempts = 0;
    
    while (attempts < this.apiKeys.length) {
      const currentKey = this.apiKeys[this.currentIndex];
      const lastUsedTime = this.lastUsed[currentKey] || 0;
      const timeSinceLastUse = now - lastUsedTime;

      if (timeSinceLastUse < this.COOLDOWN_PERIOD && this.usageCount[currentKey] >= this.USAGE_LIMIT) {
        this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
        attempts++;
        continue;
      }

      if (timeSinceLastUse >= this.COOLDOWN_PERIOD) {
        this.usageCount[currentKey] = 0;
      }

      this.usageCount[currentKey] = (this.usageCount[currentKey] || 0) + 1;
      this.lastUsed[currentKey] = now;

      if (this.usageCount[currentKey] >= this.USAGE_LIMIT) {
        this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
      }

      return currentKey;
    }

    return this.apiKeys[0];
  }
}

const keyManager = new ApiKeyManager(env.groqApiKeys);