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
const keyManager = new ApiKeyManager(env.groqApiKeys);

// API Key Management
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

      if (timeSinceLastUse >= this.COOLDOWN_PERIOD) {
        this.usageCount[currentKey] = 0;
      }

      if (this.usageCount[currentKey] < this.USAGE_LIMIT) {
        this.usageCount[currentKey] = (this.usageCount[currentKey] || 0) + 1;
        this.lastUsed[currentKey] = now;
        return currentKey;
      }

      this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
      attempts++;
    }
    throw new Error('No available API keys');
  }
}

// Helper Functions
function createGroqClient() {
  const apiKey = keyManager.getNextKey();
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    throw new Error('Invalid API key format');
  }
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
}

// Exported Functions
export async function analyzeImage(base64Image: string, userInfo?: UserInfo): Promise<ImageAnalysisResult> {
  let attempts = 0;
  const maxAttempts = env.groqApiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const groq = createGroqClient();
      const prompt = `As a medical professional, analyze this medical image...`;
      const completion = await groq.chat.completions.create({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      const analysis = JSON.parse(response);
      return analysis;
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 6000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to analyze image');
}

export async function checkConditionMatch(condition: string, analysis: ImageAnalysisResult): Promise<SymptomMatch> {
  try {
    const groq = createGroqClient();
    const prompt = `Compare conditions: ${condition} vs ${analysis.clinicalAssessment.primaryCondition}`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: TEXT_MODEL,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Condition match error:', error);
    return {
      shouldShowMismatch: false,
      explanation: 'Unable to compare. Proceeding with analysis.'
    };
  }
}

export async function shouldRequestImage(userInfo: UserInfo): Promise<{ requiresImage: boolean; reason: string }> {
  try {
    const groq = createGroqClient();
    const prompt = `Evaluate if ${userInfo.primaryIssue} requires visual assessment`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: TEXT_MODEL,
      temperature: 0.1,
      max_tokens: 500
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
      reason: 'We\'ll assess through questions'
    };
  }
}

export async function generateFollowUpQuestions(assessmentData: AssessmentData): Promise<Question[]> {
  try {
    const groq = createGroqClient();
    const prompt = `Generate follow-up questions for ${assessmentData.userInfo.primaryIssue}`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: TEXT_MODEL,
      temperature: 0.2,
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response).questions;
  } catch (error) {
    console.error('Question generation error:', error);
    return [];
  }
}

export async function generateDetailedAnalysis(imageAnalysis: ImageAnalysisResult): Promise<DetailedAnalysis> {
  try {
    const groq = createGroqClient();
    const prompt = `Analyze in detail: ${JSON.stringify(imageAnalysis)}`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: TEXT_MODEL,
      temperature: 0.1,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Detailed analysis error:', error);
    throw error;
  }
}

export async function generateRecommendation(assessmentData: AssessmentData): Promise<ComprehensiveRecommendation> {
  const groq = createGroqClient();
  const prompt = `Generate recommendations for ${assessmentData.userInfo.primaryIssue}`;
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: TEXT_MODEL,
    temperature: 0.1,
    max_tokens: 4000
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from AI');

  return JSON.parse(response);
}

export function mapTimeframe(urgencyLevel: string = 'routine'): TimeFrame {
  switch (urgencyLevel.toLowerCase()) {
    case 'emergency': return 'immediate';
    case 'urgent': return '24_hours';
    case 'routine': return 'within_week';
    default: return 'self_care';
  }
}