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

class ApiKeyManager {
  private currentIndex = 0;
  private usageCount: { [key: string]: number } = {};
  private lastUsed: { [key: string]: number } = {};
  private readonly USAGE_LIMIT = 3;
  private readonly COOLDOWN_PERIOD = 6000;

  constructor(private apiKeys: string[]) {
    if (!apiKeys.length) {
      throw new Error('No API keys provided');
    }
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

// Helper function to check if a condition is severe
async function checkConditionSeverity(condition: string, symptoms: string[]): Promise<{
  isSerious: boolean;
  canProvidePainRelief: boolean;
  requiresImmediate: boolean;
  reasons: string[];
}> {
  const groq = createGroqClient();
  
  const prompt = `Medical Safety Assessment for: "${condition}"
  Evaluate:
  1. Is this potentially life-threatening?
  2. Could pain relief mask dangerous symptoms?
  3. Is immediate medical attention required?
  4. Could delaying treatment be dangerous?

  Return JSON: {
    "isSerious": boolean,
    "canProvidePainRelief": boolean,
    "requiresImmediate": boolean,
    "reasons": string[]
  }`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: TEXT_MODEL,
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: "json_object" }
  });

  const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
  return response;
}

// Export functions
export async function analyzeImage(base64Image: string, userInfo?: UserInfo): Promise<ImageAnalysisResult> {
  let attempts = 0;
  const maxAttempts = env.groqApiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const groq = createGroqClient();

      const prompt = `As a medical professional, analyze this medical image with safety as the top priority:

      Patient Information:
      ${userInfo ? `
      - Reported Symptom: ${userInfo.primaryIssue}
      - Age: ${userInfo.age} ${userInfo.ageUnit}
      - Gender: ${userInfo.gender}
      ` : 'No patient information provided'}

      CRITICAL: Evaluate severity and immediate medical needs first.

      Return your analysis as a JSON object with these exact fields:
      // [Rest of the prompt structure remains the same]`;

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
                  url: base64Image.startsWith('data:') 
                    ? base64Image 
                    : `data:image/jpeg;base64,${base64Image}`,
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
      
      // Check severity before processing
      const severityCheck = await checkConditionSeverity(
        analysis.clinicalAssessment.primaryCondition,
        analysis.clinicalAssessment.severityIndicators
      );

      // Update the analysis with severity information
      const transformedAnalysis: ImageAnalysisResult = {
        // [Previous transformation logic]
        medicalConsiderations: {
          ...analysis.medicalConsiderations,
          requiresAttention: severityCheck.requiresImmediate,
          urgencyLevel: severityCheck.isSerious ? 'emergency' : analysis.medicalConsiderations.urgencyLevel,
          reasonsForUrgency: [
            ...analysis.medicalConsiderations.reasonsForUrgency,
            ...severityCheck.reasons
          ]
        }
      };

      return transformedAnalysis;

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

// [Rest of the exported functions]
export {
  checkConditionMatch,
  generateFollowUpQuestions,
  generateRecommendation,
  shouldRequestImage,
  generateDetailedAnalysis,
  mapTimeframe
};