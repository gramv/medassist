import { Groq } from 'groq-sdk';
import { env } from '../config/env';
import { 
  UserInfo, 
  Question, 
  FinalRecommendation, 
  ImageAnalysisResult, 
  DetailedAnalysis,
  AssessmentData,
  SymptomMatch 
} from '../types';

// API Key Management
class ApiKeyManager {
  private currentIndex = 0;
  private usageCount: { [key: string]: number } = {};
  private lastUsed: { [key: string]: number } = {};
  private readonly USAGE_LIMIT = 3;
  private readonly COOLDOWN_PERIOD = 6000; // 6 seconds in milliseconds

  constructor(private apiKeys: string[]) {
    if (!apiKeys.length) {
      throw new Error('No API keys provided to ApiKeyManager');
    }
    console.log('ApiKeyManager initialized with', apiKeys.length, 'keys');
  }

  getNextKey(): string {
    const now = Date.now();
    let attempts = 0;
    
    while (attempts < this.apiKeys.length) {
      const currentKey = this.apiKeys[this.currentIndex];
      const lastUsedTime = this.lastUsed[currentKey] || 0;
      const timeSinceLastUse = now - lastUsedTime;

      // If key is within cooldown period, move to next key
      if (timeSinceLastUse < this.COOLDOWN_PERIOD && this.usageCount[currentKey] >= this.USAGE_LIMIT) {
        this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
        attempts++;
        continue;
      }

      // If key has cooled down, reset its usage
      if (timeSinceLastUse >= this.COOLDOWN_PERIOD) {
        this.usageCount[currentKey] = 0;
      }

      // Use this key
      this.usageCount[currentKey] = (this.usageCount[currentKey] || 0) + 1;
      this.lastUsed[currentKey] = now;
      
      console.log(`Using key ${this.currentIndex + 1}, usage: ${this.usageCount[currentKey]}`);

      // If this key has reached its limit, prepare to use next key
      if (this.usageCount[currentKey] >= this.USAGE_LIMIT) {
        this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
      }

      return currentKey;
    }

    // If all keys are on cooldown, wait and retry with first key
    return this.apiKeys[0];
  }

  async waitForCooldown(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.COOLDOWN_PERIOD));
  }
}

// Initialize key manager with environment variables
const keyManager = new ApiKeyManager(env.groqApiKeys);

// Create Groq client with error handling
const createGroqClient = () => {
  try {
    const apiKey = keyManager.getNextKey();
    console.log('Creating Groq client with key:', apiKey.substring(0, 10) + '...');
    
    if (!apiKey || !apiKey.startsWith('gsk_')) {
      console.error('Invalid API key format:', apiKey?.substring(0, 10));
      throw new Error('Invalid API key format');
    }

    return new Groq({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error('Failed to create Groq client:', error);
    throw error;
  }
};

// Add image compression utility
const compressImage = async (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions (max 800px)
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      // Set canvas size and draw image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64Image;
  });
};

const MEDICAL_ANALYSIS_PROMPT = `You are a medical professional performing a visual analysis. 
Focus on practical assessment and clear recommendations:

1. VISUAL ASSESSMENT:
   Describe what you see:
   - Exact location
   - Size and spread
   - Color and appearance
   - Any distinct patterns
   - Surrounding area condition

2. CONDITION TYPES:

   Minor Conditions (Usually Self-Care):
   - Small cuts or scrapes
   - Minor bruises
   - Localized rashes
   - Insect bites
   - Surface irritation
   - Small burns (superficial)
   - Common acne

   Moderate Conditions (May Need Professional Care):
   - Spreading rashes
   - Infected cuts
   - Allergic reactions
   - Persistent skin issues
   - Moderate burns
   - Unusual skin changes
   - Joint swelling

   Serious Conditions (Need Medical Attention):
   - Rapidly spreading infection
   - Deep or large wounds
   - Severe burns
   - Signs of diseases (e.g., shingles)
   - Concerning skin growths
   - Severe allergic reactions
   - Signs of systemic illness

3. WHEN TO SEEK MEDICAL CARE:

   Immediate Medical Care If:
   - Rapidly spreading redness/swelling
   - Signs of serious infection
   - Severe pain
   - Large or deep wounds
   - Severe allergic reactions
   - Unusual or concerning patterns
   - Signs of systemic illness

   Visit Doctor Soon If:
   - Infection not improving
   - Persistent or worsening
   - Unusual appearance
   - Not healing properly
   - Moderate pain continues
   - Spreading despite care

   Self-Care Appropriate If:
   - Minor injury/condition
   - Small affected area
   - Normal healing signs
   - No infection signs
   - Mild symptoms only
   - Common appearance

Return analysis in this exact JSON format:
{
  "bodyPart": {
    "detected": "specific location",
    "confidence": number (0-1)
  },
  "condition": {
    "type": "specific condition name",
    "characteristics": ["observed features"],
    "severity": "mild" | "moderate" | "severe",
    "confidence": number (0-1),
    "stage": "acute" | "healing",
    "visualFeatures": {
      "primary": ["main visible features"],
      "secondary": ["associated signs"]
    }
  },
  "urgency": {
    "requiresMedicalAttention": boolean,
    "timeframe": "immediate" | "24_hours" | "within_week" | "self_care",
    "reasoning": ["specific reasons"],
    "redFlags": ["critical signs if any"]
  }
}

IMPORTANT:
- Be practical in assessment
- Don't over-diagnose minor issues
- Don't under-estimate serious signs
- Focus on visible evidence
- Consider overall context
- Flag genuine concerns only
- Give clear, direct advice`;

// Export the image analysis function
export const analyzeImage = async (base64Image: string): Promise<ImageAnalysisResult> => {
  let attempts = 0;
  const maxAttempts = env.groqApiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const groq = createGroqClient();
      console.log('Analyzing image with attempt:', attempts + 1);

      const completion = await groq.chat.completions.create({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: MEDICAL_ANALYSIS_PROMPT
              },
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
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      console.log('Raw response:', response);
      
      if (!response) {
        throw new Error('No response from AI');
      }

      const analysis = JSON.parse(response);
      console.log('Parsed analysis:', analysis);

      // Validate and normalize the response
      const validatedAnalysis: ImageAnalysisResult = {
        bodyPart: {
          detected: analysis.bodyPart?.detected || 'unknown',
          confidence: `${Math.round((Number(analysis.bodyPart?.confidence) || 0.5) * 100)}%`
        },
        condition: {
          type: analysis.condition?.type || 'unknown condition',
          characteristics: Array.isArray(analysis.condition?.characteristics) 
            ? analysis.condition.characteristics 
            : [],
          severity: analysis.condition?.severity || 'moderate',
          confidence: `${Math.round((Number(analysis.condition?.confidence) || 0.5) * 100)}%`,
          stage: analysis.condition?.stage || 'acute',
          visualFeatures: {
            primary: Array.isArray(analysis.condition?.visualFeatures?.primary)
              ? analysis.condition.visualFeatures.primary
              : [],
            secondary: Array.isArray(analysis.condition?.visualFeatures?.secondary)
              ? analysis.condition.visualFeatures.secondary
              : []
          }
        },
        urgency: {
          requiresMedicalAttention: Boolean(analysis.urgency?.requiresMedicalAttention),
          timeframe: analysis.urgency?.timeframe || 'within_week',
          reasoning: Array.isArray(analysis.urgency?.reasoning)
            ? analysis.urgency.reasoning
            : [],
          redFlags: Array.isArray(analysis.urgency?.redFlags)
            ? analysis.urgency.redFlags
            : []
        }
      };

      return validatedAnalysis;

    } catch (error: any) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error);

      if (attempts < maxAttempts) {
        continue;
      }

      throw new Error('Failed to analyze image after trying all API keys');
    }
  }

  throw new Error('Failed to analyze image');
};

// Export other API functions
export const checkConditionMatch = async (
  reportedCondition: string,
  imageAnalysis: ImageAnalysisResult
): Promise<SymptomMatch> => {
  try {
    const groq = createGroqClient();

    // Define anatomical groups for strict comparison
    const anatomicalGroups = {
      eyes: ['eye', 'eyes', 'eyelid', 'conjunctiva', 'sclera', 'cornea'],
      face: ['face', 'cheek', 'nose', 'mouth', 'lip', 'forehead'],
      hands: ['hand', 'finger', 'thumb', 'palm', 'wrist'],
      arms: ['arm', 'elbow', 'forearm', 'shoulder'],
      legs: ['leg', 'knee', 'thigh', 'calf', 'ankle', 'foot', 'toe'],
      torso: ['chest', 'back', 'abdomen', 'stomach', 'waist'],
      skin: ['skin', 'rash', 'surface'],
      head: ['head', 'scalp', 'hair']
    };

    // Helper function to determine anatomical group
    const getAnatomicalGroup = (bodyPart: string): string | null => {
      const lowerBodyPart = bodyPart.toLowerCase();
      for (const [group, parts] of Object.entries(anatomicalGroups)) {
        if (parts.some(part => lowerBodyPart.includes(part))) {
          return group;
        }
      }
      return null;
    };

    // Determine anatomical groups for both reported and detected conditions
    const reportedGroup = getAnatomicalGroup(reportedCondition);
    const detectedGroup = getAnatomicalGroup(imageAnalysis.bodyPart.detected);

    // If we can determine both groups and they're different, it's a mismatch
    if (reportedGroup && detectedGroup && reportedGroup !== detectedGroup) {
      return {
        shouldShowMismatch: true,
        explanation: `You reported symptoms in your ${reportedCondition}, but the image shows a condition on your ${imageAnalysis.bodyPart.detected}. These are different body parts and may require different types of assessment.`
      };
    }

    // If we can't determine the groups, use AI for more nuanced comparison
    const prompt = `
      Compare these medical conditions and determine if there's a true anatomical mismatch:

      Reported Condition: "${reportedCondition}"
      Image Analysis: {
        "location": "${imageAnalysis.bodyPart.detected}",
        "condition": "${imageAnalysis.condition.type}",
        "characteristics": ${JSON.stringify(imageAnalysis.condition.characteristics)}
      }

      Rules for determining mismatch:
      1. Different body parts = mismatch (e.g., eye vs hand)
      2. Different anatomical systems = mismatch (e.g., skin vs joint)
      3. Consider medical terminology variations
      4. Consider anatomical proximity
      5. Consider related symptoms

      Return your analysis in JSON format:
      {
        "shouldShowMismatch": boolean,
        "explanation": "detailed explanation"
      }

      Return shouldShowMismatch as true ONLY if the conditions are clearly about different anatomical locations.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a medical expert determining anatomical relationships. Be precise and conservative in identifying mismatches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(response);
    
    // Additional validation to prevent false negatives
    if (!result.shouldShowMismatch && reportedGroup && detectedGroup && reportedGroup !== detectedGroup) {
      return {
        shouldShowMismatch: true,
        explanation: `Anatomical mismatch detected: ${reportedCondition} vs ${imageAnalysis.bodyPart.detected}`
      };
    }

    return result;
  } catch (error) {
    console.error('Condition match check error:', error);
    // In case of error, assume they don't match to be safe
    return {
      shouldShowMismatch: true,
      explanation: 'Unable to verify if the image matches your reported condition. Please ensure you\'re uploading an image of the reported condition.'
    };
  }
};

export const generateFollowUpQuestions = async (assessmentData: AssessmentData): Promise<Question[]> => {
  try {
    const groq = createGroqClient();

    const prompt = `
      Based on this assessment data, generate follow-up questions:
      ${JSON.stringify(assessmentData, null, 2)}

      Generate 4-5 specific questions about:
      1. Duration and progression of symptoms
      2. Pain/discomfort levels
      3. Aggravating/relieving factors
      4. Previous treatments
      5. Related symptoms

      Return in this EXACT JSON format:
      {
        "questions": [
          {
            "question": "clear, specific question",
            "options": ["3-4 clear answer options"]
          }
        ]
      }

      IMPORTANT:
      - Each question must have 3-4 clear options
      - Make options mutually exclusive
      - Include "None of the above" or "Other" when appropriate
      - Keep questions focused on medical assessment
      - Avoid yes/no questions
      - Make options specific and actionable`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    console.log('Questions response:', response);

    const parsedResponse = JSON.parse(response);
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid questions format');
    }

    // Validate each question
    const validatedQuestions = parsedResponse.questions.map((q: any) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
        throw new Error('Invalid question format');
      }
      return {
        question: q.question,
        options: q.options
      };
    });

    if (validatedQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }

    return validatedQuestions;
  } catch (error) {
    console.error('Question generation error:', error);
    // Return default questions if generation fails
    return [
      {
        question: "How long have you been experiencing these symptoms?",
        options: ["Less than 24 hours", "1-3 days", "4-7 days", "More than a week"]
      },
      {
        question: "How would you rate the severity of your symptoms?",
        options: ["Mild - barely noticeable", "Moderate - noticeable but manageable", "Severe - difficult to ignore", "Very severe - affecting daily activities"]
      },
      {
        question: "What makes the symptoms better or worse?",
        options: ["Rest/Inactivity", "Movement/Activity", "Temperature changes", "No clear pattern"]
      },
      {
        question: "Have you tried any treatments so far?",
        options: ["No treatment yet", "Over-the-counter medications", "Home remedies", "Multiple treatments"]
      }
    ];
  }
};

// Add a delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateRecommendation = async (
  assessmentData: AssessmentData
): Promise<FinalRecommendation> => {
  let attempts = 0;
  const maxAttempts = 3;
  const retryDelay = 6000;

  while (attempts < maxAttempts) {
    try {
      const groq = createGroqClient();

      const prompt = `
        Based on this assessment data, provide comprehensive medical recommendations:
        ${JSON.stringify(assessmentData, null, 2)}

        Return a detailed recommendation in this EXACT JSON format:
        {
          "severity": "mild" | "moderate" | "severe",
          "medicalAttention": {
            "required": boolean,
            "timeframe": "immediate" | "24_hours" | "within_week" | "self_care",
            "reasons": ["specific reasons"]
          },
          "medications": [
            {
              "name": "medication name",
              "brandNames": ["common brand names"],
              "dosage": "specific dosage",
              "frequency": "how often to take",
              "duration": "how long to take",
              "expectedResults": "what to expect",
              "warnings": ["important warnings"]
            }
          ],
          "alternatives": {
            "naturalRemedies": [
              {
                "remedy": "specific remedy name",
                "usage": "how to use",
                "frequency": "how often to use",
                "benefits": "expected benefits"
              }
            ],
            "alternativeMedications": [
              {
                "name": "medication name",
                "brandNames": ["brand names"],
                "whenToConsider": "when to use this instead",
                "benefits": "specific benefits"
              }
            ]
          },
          "lifestyle": [
            {
              "category": "diet" | "activity" | "prevention" | "recovery",
              "recommendations": ["specific recommendations"]
            }
          ],
          "monitoring": {
            "warningSignals": ["specific warning signs"],
            "seekHelpIf": ["conditions requiring immediate attention"]
          }
        }

        For moderate/severe cases, also include:
        "doctorVisit": {
          "questionsForDoctor": ["specific questions"],
          "symptomsToMention": ["key symptoms"],
          "suggestedTests": ["relevant tests"],
          "historyToMention": ["relevant history points"]
        }

        IMPORTANT GUIDELINES:
        1. Be specific and detailed
        2. Include both medication and natural remedies
        3. Provide clear lifestyle recommendations
        4. Include monitoring guidelines
        5. For moderate/severe cases, include doctor visit details`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      console.log('Raw recommendation response:', response);
      const recommendation = JSON.parse(response) as FinalRecommendation;

      // Validate and ensure all required sections exist
      const validatedRecommendation: FinalRecommendation = {
        severity: recommendation.severity || 'moderate',
        medicalAttention: recommendation.medicalAttention || {
          required: false,
          timeframe: 'self_care',
          reasons: []
        },
        medications: recommendation.medications || [],
        alternatives: {
          naturalRemedies: recommendation.alternatives?.naturalRemedies || [],
          alternativeMedications: recommendation.alternatives?.alternativeMedications || []
        },
        lifestyle: recommendation.lifestyle || [
          {
            category: 'recovery',
            recommendations: ['Rest and stay hydrated']
          }
        ],
        monitoring: recommendation.monitoring || {
          warningSignals: [],
          seekHelpIf: []
        }
      };

      // Add doctor visit section for moderate/severe cases
      if (validatedRecommendation.severity === 'moderate' || validatedRecommendation.severity === 'severe') {
        validatedRecommendation.doctorVisit = recommendation.doctorVisit || {
          questionsForDoctor: ['What is the recommended treatment plan?'],
          symptomsToMention: ['Current symptoms and their duration'],
          suggestedTests: ['Relevant medical tests'],
          historyToMention: ['Any previous similar conditions']
        };
      }

      return validatedRecommendation;

    } catch (error) {
      attempts++;
      console.error(`Recommendation generation attempt ${attempts} failed:`, error);

      if (attempts < maxAttempts) {
        console.log(`Waiting ${retryDelay/1000} seconds before retry...`);
        await delay(retryDelay);
        continue;
      }

      throw new Error('Failed to generate recommendation');
    }
  }

  throw new Error('Failed to generate recommendation after all attempts');
};

export const shouldRequestImage = async (userInfo: UserInfo): Promise<{ requiresImage: boolean; reason: string }> => {
  try {
    const groq = createGroqClient();

    const prompt = `
      Analyze the following user information and determine if an image would be helpful.
      Return your analysis in JSON format.

      User Information:
      ${JSON.stringify(userInfo, null, 2)}

      Instructions:
      - Consider the type of condition reported
      - Evaluate if visual assessment would aid diagnosis
      - Determine if the condition typically requires visual inspection

      Return a JSON response in this exact format:
      {
        "requiresImage": boolean indicating if an image would be helpful,
        "reason": "detailed explanation of why an image is or isn't needed"
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a medical expert determining if visual analysis would be helpful. Always return your response as JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(response);
    return {
      requiresImage: Boolean(result.requiresImage),
      reason: String(result.reason)
    };
  } catch (error) {
    console.error('Image requirement check error:', error);
    throw new Error('Failed to check image requirement');
  }
};

export const generateDetailedAnalysis = async (imageAnalysis: ImageAnalysisResult): Promise<DetailedAnalysis> => {
  try {
    const groq = createGroqClient();

    const prompt = `
      Based on this image analysis, provide detailed medical recommendations:
      ${JSON.stringify(imageAnalysis, null, 2)}
      
      Return a detailed analysis in this JSON format:
      {
        "analysis": {
          "condition": {
            "affectedArea": {
              "bodyPart": string,
              "location": string,
              "description": string
            },
            "possibleDiagnoses": string[],
            "visualSymptoms": string[],
            "severity": "mild" | "moderate" | "severe",
            "confidence": number
          },
          "urgency": {
            "requiresMedicalAttention": boolean,
            "timeframe": string,
            "factors": string[]
          }
        },
        "doctorVisit": {
          "recommended": boolean,
          "questionsForDoctor": string[],
          "symptomsToMention": string[],
          "relevantHistory": string[],
          "suggestedTests": string[]
        }
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a medical expert providing detailed analysis of medical conditions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    return JSON.parse(response) as DetailedAnalysis;
  } catch (error) {
    console.error('Detailed analysis error:', error);
    throw new Error('Failed to generate detailed analysis');
  }
};

// ... rest of your api.ts file ... 