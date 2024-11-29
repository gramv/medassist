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

// API key management
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
const VISION_MODEL = 'llama-3.2-90b-vision-preview';
const TEXT_MODEL = 'llama-3.1-70b-versatile';

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

// Primary Functions
export async function analyzeImage(base64Image: string, userInfo?: UserInfo): Promise<ImageAnalysisResult> {
  let attempts = 0;
  const maxAttempts = env.groqApiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const groq = createGroqClient();
      const prompt = `As a medical professional, analyze this medical image with focus on safety:

Patient Information:
${userInfo ? `
- Reported Symptom: ${userInfo.primaryIssue}
- Age: ${userInfo.age} ${userInfo.ageUnit}
- Gender: ${userInfo.gender}
` : 'No patient information provided'}

Please analyze the image considering:
1. Severity and urgency
2. Need for immediate medical attention
3. Visual characteristics
4. Correlation with reported symptoms
5. Age-specific concerns

Return your analysis as a JSON object with these exact fields:
{
  "anatomicalDetails": {
    "location": {
      "primarySite": string,
      "specificLocation": string,
      "depth": "superficial" | "moderate" | "deep",
      "distribution": "localized" | "spreading" | "diffuse"
    }
  },
  "visualCharacteristics": {
    "primary": {
      "color": string[],
      "texture": string[],
      "pattern": string,
      "borders": string
    },
    "progression": {
      "stage": "acute" | "subacute" | "chronic",
      "timeline": string,
      "healingIndicators": string[]
    }
  },
  "clinicalAssessment": {
    "primaryCondition": string,
    "differentialDiagnoses": string[],
    "confidence": number,
    "severityIndicators": string[],
    "complicationRisks": string[]
  },
  "medicalConsiderations": {
    "requiresAttention": boolean,
    "urgencyLevel": "routine" | "urgent" | "emergency",
    "reasonsForUrgency": string[],
    "recommendedTimeframe": string,
    "warningSignsPresent": string[]
  }
}`;

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

      const transformedAnalysis: ImageAnalysisResult = {
        anatomicalDetails: analysis.anatomicalDetails,
        visualCharacteristics: analysis.visualCharacteristics,
        clinicalAssessment: analysis.clinicalAssessment,
        medicalConsiderations: analysis.medicalConsiderations,
        bodyPart: {
          detected: analysis.anatomicalDetails.location.primarySite,
          confidence: '100%'
        },
        condition: {
          type: analysis.clinicalAssessment.primaryCondition,
          characteristics: [
            ...analysis.visualCharacteristics.primary.color,
            ...analysis.visualCharacteristics.primary.texture
          ],
          severity: mapSeverity(analysis.medicalConsiderations.urgencyLevel),
          confidence: `${Math.round(analysis.clinicalAssessment.confidence * 100)}%`,
          stage: analysis.visualCharacteristics.progression.stage,
          visualFeatures: {
            primary: [
              analysis.visualCharacteristics.primary.pattern,
              analysis.visualCharacteristics.primary.borders,
              ...analysis.visualCharacteristics.primary.texture
            ],
            secondary: []
          }
        },
        urgency: {
          requiresMedicalAttention: analysis.medicalConsiderations.requiresAttention,
          timeframe: mapTimeframe(analysis.medicalConsiderations.urgencyLevel),
          reasoning: analysis.medicalConsiderations.reasonsForUrgency,
          redFlags: analysis.medicalConsiderations.warningSignsPresent
        }
      };

      return transformedAnalysis;

    } catch (error) {
      attempts++;
      console.error(`Analysis attempt ${attempts} failed:`, error);

      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 6000));
        continue;
      }
      throw new Error('Failed to analyze image after all attempts');
    }
  }
  throw new Error('Failed to analyze image');
}

// Helper Functions
function mapSeverity(urgencyLevel: string): 'mild' | 'moderate' | 'severe' {
  switch (urgencyLevel.toLowerCase()) {
    case 'emergency':
      return 'severe';
    case 'urgent':
      return 'moderate';
    case 'routine':
      return 'mild';
    default:
      return 'moderate';
  }
}

export function mapTimeframe(urgencyLevel: string = 'routine'): TimeFrame {
  switch (urgencyLevel.toLowerCase()) {
    case 'emergency':
      return 'immediate';
    case 'urgent':
      return '24_hours';
    case 'routine':
      return 'within_week';
    default:
      return 'self_care';
  }
}

// Export other functions
export {
  checkConditionMatch,
  generateFollowUpQuestions,
  generateRecommendation,
  shouldRequestImage,
  generateDetailedAnalysis
};