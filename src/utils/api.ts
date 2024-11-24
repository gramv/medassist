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

// Add this before the export statement
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
  console.log('Using API key:', apiKey.substring(0, 10) + '...');
  
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    throw new Error('Invalid API key format');
  }

  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

// Single export statement at the top
export {
  analyzeImage,
  checkConditionMatch,
  generateFollowUpQuestions,
  generateRecommendation,
  shouldRequestImage,
  generateDetailedAnalysis,
  mapTimeframe
};

// Helper functions (no export)
function mapTimeframe(urgencyLevel: string = 'routine'): TimeFrame {
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

// Update the model constants
const VISION_MODEL = 'llama-3.2-90b-vision-preview';
const TEXT_MODEL = 'llama-3.1-70b-versatile';

// Main functions (no export keywords)
async function analyzeImage(base64Image: string, userInfo?: UserInfo): Promise<ImageAnalysisResult> {
  let attempts = 0;
  const maxAttempts = env.groqApiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const groq = createGroqClient();
      console.log('Starting enhanced image analysis, attempt:', attempts + 1);

      const prompt = `As a medical professional, analyze this medical image in the context of the patient's reported symptoms:

Patient Information:
${userInfo ? `
- Reported Symptom: ${userInfo.primaryIssue}
- Age: ${userInfo.age} ${userInfo.ageUnit}
- Gender: ${userInfo.gender}
` : 'No patient information provided'}

Please analyze the image considering:
1. Visual characteristics of the condition
2. Correlation with reported symptoms
3. Any discrepancies between visual findings and reported symptoms
4. Age-specific considerations
5. Potential related conditions

Return your analysis as a JSON object with these exact fields:
{
  "anatomicalDetails": {
    "location": {
      "primarySite": string,
      "specificLocation": string,
      "depth": "superficial" | "moderate" | "deep",
      "distribution": "localized" | "spreading" | "diffuse"
    },
    "measurements": {
      "approximateSize": string,
      "affectedArea": string,
      "spreadPattern": string
    }
  },
  "visualCharacteristics": {
    "primary": {
      "color": string[],
      "texture": string[],
      "pattern": string,
      "borders": string
    },
    "secondary": {
      "surroundingTissue": string[],
      "associatedFeatures": string[]
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
    "complicationRisks": string[],
    "symptomCorrelation": {
      "matchesReported": boolean,
      "explanation": string,
      "additionalFindings": string[]
    }
  },
  "medicalConsiderations": {
    "requiresAttention": boolean,
    "urgencyLevel": "routine" | "urgent" | "emergency",
    "reasonsForUrgency": string[],
    "recommendedTimeframe": string,
    "warningSignsPresent": string[],
    "ageSpecificConcerns": string[]
  }
}`;

      const completion = await groq.chat.completions.create({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
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
        max_tokens: 8000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      console.log('Raw analysis response:', response);
      const analysis = JSON.parse(response);

      // Transform the raw analysis into the expected ImageAnalysisResult format
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
            secondary: analysis.visualCharacteristics.secondary.associatedFeatures
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
        await delay(6000);
        continue;
      }

      throw new Error('Failed to analyze image after all attempts');
    }
  }

  throw new Error('Failed to analyze image');
}

// Add helper function for severity mapping
function mapSeverity(urgencyLevel: string): 'mild' | 'moderate' | 'severe' {
  switch (urgencyLevel) {
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

async function checkConditionMatch(
  reportedCondition: string,
  imageAnalysis: ImageAnalysisResult
): Promise<SymptomMatch> {
  try {
    const groq = createGroqClient();

    const prompt = `Compare these two medical conditions and determine if they match:

Reported condition: "${reportedCondition}"
Detected condition from image: "${imageAnalysis.clinicalAssessment.primaryCondition}"

Return your analysis in this exact JSON format:
{
  "shouldShowMismatch": boolean,
  "explanation": "detailed explanation of why conditions match or don't match"
}

Consider:
1. Medical terminology variations
2. Common names vs clinical terms
3. Related conditions
4. Symptom overlaps
5. Diagnostic hierarchy`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: TEXT_MODEL,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(response);
    
    return {
      shouldShowMismatch: result.shouldShowMismatch,
      explanation: result.explanation
    };

  } catch (error) {
    console.error('Condition match check error:', error);
    // Default to not showing mismatch if there's an error
    return {
      shouldShowMismatch: false,
      explanation: 'Unable to compare conditions due to an error. Proceeding with analysis.'
    };
  }
}

const generateFollowUpQuestions = async (assessmentData: AssessmentData): Promise<Question[]> => {
  try {
    const groq = createGroqClient();
    const isChild = assessmentData.userInfo.age < 13 || assessmentData.userInfo.ageUnit === 'months';

    const prompt = `Generate age-appropriate medical assessment questions for a ${assessmentData.userInfo.age} ${assessmentData.userInfo.ageUnit} old patient.

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

${isChild ? `
Special Considerations for Child Patient:
1. Use simple, child-friendly language
2. Focus on observable symptoms rather than technical terms
3. Include questions for parents/guardians about:
   - Child's behavior changes
   - Eating and drinking patterns
   - Sleep patterns
   - Activity level changes
   - School/play impact
4. Ask about specific triggers or recent changes
5. Include questions about previous similar episodes
6. Consider developmental stage
7. Ask about any medications already given to the child` : ''}

Return questions in this exact JSON format:
{
  "questions": [
    {
      "question": "clear, ${isChild ? 'child-friendly' : 'specific'} question",
      "options": ["4 clear options"],
      "targetRespondent": "${isChild ? 'parent/guardian' : 'patient'}"
    }
  ]
}

Example child-specific questions:
1. "Has your child's appetite changed since this started?"
   Options: ["Eating normally", "Eating less than usual", "Refusing to eat", "Only drinking liquids"]

2. "How is this affecting your child's daily activities?"
   Options: ["Playing normally", "Less active than usual", "Doesn't want to play", "Unusually tired/sleepy"]

3. "Has your child complained about any other discomfort?"
   Options: ["No other complaints", "Having trouble sleeping", "Seems irritable", "Crying more than usual"]

Make all questions specific to the condition ${assessmentData.userInfo.primaryIssue} and ensure age-appropriate language and options.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: TEXT_MODEL,
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    console.log('Questions response:', response);
    const result = JSON.parse(response);

    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid questions format');
    }

    // Return child-specific default questions if generation fails
    return result.questions;
  } catch (error) {
    console.error('Question generation error:', error);
    
    // Return age-appropriate default questions
    if (assessmentData.userInfo.age < 13 || assessmentData.userInfo.ageUnit === 'months') {
      return [
        {
          question: "How has your child been feeling since this started?",
          options: [
            "Acting normally, just uncomfortable",
            "More tired than usual",
            "Very upset or irritable",
            "Unusually quiet or sleepy"
          ]
        },
        {
          question: "Has your child's eating and drinking changed?",
          options: [
            "Eating and drinking normally",
            "Eating less but drinking well",
            "Not interested in food",
            "Refusing both food and drinks"
          ]
        },
        {
          question: "How is this affecting their daily activities?",
          options: [
            "Playing and acting normally",
            "Less active but still playing",
            "Not wanting to play",
            "Staying in bed/very inactive"
          ]
        },
        {
          question: "Have you noticed any changes in their sleep?",
          options: [
            "Sleeping normally",
            "Having trouble falling asleep",
            "Waking up frequently",
            "Major changes in sleep pattern"
          ]
        },
        {
          question: "Have you given any medicine to help with the symptoms?",
          options: [
            "No medicine given yet",
            "Given as recommended by doctor",
            "Tried over-the-counter medicine",
            "Multiple medicines tried"
          ]
        }
      ];
    }
    
    // Return regular default questions for adults
    return [
      {
        question: "How long have you been experiencing these symptoms?",
        options: ["Less than 24 hours", "1-3 days", "4-7 days", "More than a week"]
      },
      // ... rest of default adult questions ...
    ];
  }
};

async function generateRecommendation(assessmentData: AssessmentData): Promise<ComprehensiveRecommendation> {
  const groq = createGroqClient();

  // First, get comprehensive analysis
  const analysisPrompt = `As a medical professional, analyze this patient's condition:

Patient Information:
${JSON.stringify(assessmentData.userInfo, null, 2)}

Visual Analysis Results:
${assessmentData.imageAnalysis ? JSON.stringify(assessmentData.imageAnalysis, null, 2) : 'No image analysis available'}

Questionnaire Responses:
${JSON.stringify(assessmentData.questionnaireAnswers, null, 2)}

Provide a comprehensive medical analysis in this EXACT JSON format:
{
  "analysis": {
    "condition": {
      "name": "precise medical name",
      "commonName": "lay term",
      "severity": "mild" | "moderate" | "severe",
      "description": "detailed description",
      "expectedDuration": "estimated timeline",
      "symptoms": {
        "primary": ["main symptoms"],
        "associated": ["related symptoms"],
        "progression": "how condition typically develops"
      }
    },
    "medicalAttention": {
      "required": boolean,
      "urgencyLevel": "immediate" | "urgent" | "routine",
      "timeframe": "when to seek care",
      "doctorType": "specific type of doctor",
      "reasons": ["specific reasons for medical attention"]
    },
    "treatment": {
      "medications": {
        "primary": {
          "name": "medication name",
          "activeIngredient": "ingredient",
          "effectiveness": {
            "rating": number (1-5),
            "evidence": "research evidence",
            "bestFor": ["specific symptoms it treats"]
          },
          "dosage": {
            "form": "tablet/liquid/etc",
            "amount": "specific amount",
            "frequency": "how often",
            "duration": "how long",
            "instructions": ["detailed instructions"]
          },
          "sideEffects": {
            "common": ["common effects"],
            "rare": ["rare effects"],
            "warnings": ["important warnings"]
          },
          "brands": [
            {
              "name": "specific brand name (e.g., Advil, Tylenol Extra Strength)",
              "manufacturer": "company name",
              "form": "specific form (tablet/capsule/liquid/gel)",
              "strength": "specific strength (200mg, 500mg, etc)",
              "variants": ["available formulations"],
              "priceRange": {
                "min": actual_minimum_retail_price,
                "max": actual_maximum_retail_price,
                "currency": "USD"
              },
              "availability": "retail availability",
              "retailLocations": ["major pharmacy chains"]
            }
          ]
        },
        "alternatives": [
          {
            // same structure as primary
            "comparisonToPrimary": {
              "advantages": ["benefits"],
              "disadvantages": ["drawbacks"],
              "whenToChoose": ["specific scenarios"]
            }
          }
        ]
      },
      "naturalRemedies": [
        {
          "name": "remedy name",
          "type": "herb/supplement/therapy",
          "evidence": {
            "rating": number (1-5),
            "research": "evidence summary"
          },
          "usage": {
            "method": "how to use",
            "preparation": "how to prepare",
            "dosage": "amount",
            "frequency": "how often"
          },
          "benefits": ["specific benefits"],
          "precautions": ["safety concerns"]
        }
      ]
    },
    "lifestyle": {
      "modifications": [
        {
          "category": "diet/exercise/sleep/etc",
          "recommendations": ["specific changes"],
          "importance": "essential/helpful",
          "reasoning": "why this helps"
        }
      ],
      "restrictions": ["activities to avoid"],
      "preventiveMeasures": ["how to prevent recurrence"]
    },
    "followUp": {
      "timeline": "when to check progress",
      "monitoringPoints": ["what to monitor"],
      "improvementSigns": ["positive indicators"],
      "warningSignals": ["when to worry"]
    }
  }
}

Important for Medications:
1. Include at least 2-3 major brand names for each medication
2. Provide actual market prices based on current retail prices
3. Specify exact strengths and forms available
4. Include both generic and brand-name options
5. Note any regional availability differences
6. Include common retail chains where available`;

  // Get the analysis first
  const analysisResponse = await groq.chat.completions.create({
    messages: [{ role: 'user', content: analysisPrompt }],
    model: TEXT_MODEL,
    temperature: 0.1,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });

  const response = analysisResponse.choices[0]?.message?.content;
  if (!response) {
    throw new Error('No response from AI');
  }

  console.log('Raw recommendation response:', response);
  const rawResult = JSON.parse(response);

  // Transform the raw analysis into our display format
  const result: ComprehensiveRecommendation = {
    condition: {
      name: rawResult.analysis.condition.name,
      severity: rawResult.analysis.condition.severity,
      description: rawResult.analysis.condition.description,
      expectedDuration: rawResult.analysis.condition.expectedDuration
    },
    medicalAttention: {
      required: rawResult.analysis.medicalAttention.required,
      timeframe: mapTimeframe(rawResult.analysis.medicalAttention.urgencyLevel),
      reasons: rawResult.analysis.medicalAttention.reasons,
      doctorType: rawResult.analysis.medicalAttention.doctorType,
      urgencyLevel: rawResult.analysis.medicalAttention.urgencyLevel
    },
    medications: {
      primary: {
        name: rawResult.analysis.treatment.medications.primary.name,
        isMainRecommendation: true,
        type: 'primary',
        activeIngredient: rawResult.analysis.treatment.medications.primary.activeIngredient,
        dosageForm: rawResult.analysis.treatment.medications.primary.dosage.form,
        typicalDosage: {
          amount: rawResult.analysis.treatment.medications.primary.dosage.amount,
          frequency: rawResult.analysis.treatment.medications.primary.dosage.frequency,
          duration: rawResult.analysis.treatment.medications.primary.dosage.duration,
          specialInstructions: rawResult.analysis.treatment.medications.primary.dosage.instructions || []
        },
        effectiveness: rawResult.analysis.treatment.medications.primary.effectiveness.rating,
        sideEffects: {
          common: rawResult.analysis.treatment.medications.primary.sideEffects.common,
          rare: rawResult.analysis.treatment.medications.primary.sideEffects.rare,
          warningFlags: rawResult.analysis.treatment.medications.primary.sideEffects.warnings
        },
        brands: rawResult.analysis.treatment.medications.primary.brands.map((brand: any) => ({
          name: brand.name,
          form: brand.form,
          strength: brand.strength,
          priceRange: {
            min: brand.priceRange.min,
            max: brand.priceRange.max,
            currency: brand.priceRange.currency
          },
          availability: brand.availability,
          retailLocations: brand.retailLocations || []
        }))
      },
      alternatives: rawResult.analysis.treatment.medications.alternatives?.map((alt: any) => ({
        name: alt.name,
        isMainRecommendation: false,
        type: 'alternative',
        activeIngredient: alt.activeIngredient,
        dosageForm: alt.dosage.form,
        typicalDosage: {
          amount: alt.dosage.amount,
          frequency: alt.dosage.frequency,
          duration: alt.dosage.duration,
          specialInstructions: alt.dosage.instructions || []
        },
        effectiveness: alt.effectiveness.rating,
        sideEffects: {
          common: alt.sideEffects.common,
          rare: alt.sideEffects.rare,
          warningFlags: alt.sideEffects.warnings
        },
        brands: alt.brands?.map((brand: any) => ({
          name: brand.name,
          form: brand.form,
          strength: brand.strength,
          priceRange: {
            min: brand.priceRange.min,
            max: brand.priceRange.max,
            currency: brand.priceRange.currency
          },
          availability: brand.availability,
          retailLocations: brand.retailLocations || []
        })) || [],
        warnings: {
          interactions: [],
          contraindications: [],
          precautions: alt.sideEffects.warnings || []
        }
      })) || [],
    },
    naturalRemedies: rawResult.analysis.treatment.naturalRemedies?.map((remedy: any) => ({
      name: remedy.name,
      type: remedy.type,
      effectiveness: remedy.evidence.rating,
      usage: {
        method: remedy.usage.method,
        frequency: remedy.usage.frequency,
        duration: remedy.usage.frequency,
        preparation: remedy.usage.preparation
      },
      benefits: remedy.benefits,
      scientificEvidence: mapEvidenceLevel(remedy.evidence.rating),
      precautions: remedy.precautions
    })) || [],
    lifestyle: rawResult.analysis.lifestyle.modifications?.map((mod: any) => ({
      category: mod.category,
      priority: mapPriority(mod.importance),
      recommendations: [{
        action: mod.recommendations[0],
        frequency: 'daily',
        explanation: mod.reasoning,
        tips: mod.recommendations.slice(1)
      }],
      expectedBenefits: [mod.reasoning],
      timeToEffect: '1-2 weeks'
    })) || [],
    emergencyGuidelines: {
      warningSymptoms: rawResult.analysis.medicalAttention.reasons || [],
      immediateActions: ['Seek medical attention if symptoms worsen'],
      whenToSeekHelp: ['If condition worsens', 'If new symptoms develop'],
      medicalContactInfo: {
        type: rawResult.analysis.medicalAttention.doctorType,
        recommendation: `Consult ${rawResult.analysis.medicalAttention.doctorType} ${rawResult.analysis.medicalAttention.timeframe}`,
        urgency: rawResult.analysis.medicalAttention.urgencyLevel
      }
    },
    followUp: {
      timeframe: rawResult.analysis.followUp.timeline,
      checkpoints: rawResult.analysis.followUp.monitoringPoints,
      improvementSigns: rawResult.analysis.followUp.improvementSigns,
      worseningSigns: rawResult.analysis.followUp.warningSignals
    },
    prevention: {
      shortTerm: rawResult.analysis.lifestyle.restrictions || [],
      longTerm: rawResult.analysis.lifestyle.preventiveMeasures || []
    }
  };

  return result;
}

// Helper function to map evidence level
function mapEvidenceLevel(rating: number): 'strong' | 'moderate' | 'limited' | 'anecdotal' {
  if (rating >= 4) return 'strong';
  if (rating >= 3) return 'moderate';
  if (rating >= 2) return 'limited';
  return 'anecdotal';
}

// Helper function to map priority
function mapPriority(importance: string): 'essential' | 'important' | 'helpful' {
  switch (importance.toLowerCase()) {
    case 'essential':
      return 'essential';
    case 'important':
      return 'important';
    default:
      return 'helpful';
  }
}

// Helper function to determine age group
function determineAgeGroup(userInfo: UserInfo): string {
  const age = userInfo.age;
  const unit = userInfo.ageUnit;

  if (unit === 'months' || (unit === 'years' && age < 12)) {
    return `child (${age} ${unit} old)`;
  } else if (age >= 60) {
    return `elderly patient (${age} years old)`;
  }
  return `adult (${age} years old)`;
}

// Helper function for age-specific guidelines
function getAgeSpecificGuidelines(ageGroup: string): string {
  if (ageGroup.includes('child')) {
    return `
    - Provide pediatric formulations and dosing
    - Consider weight-based dosing where applicable
    - Include child-specific safety warnings
    - Note any age restrictions for medications
    - Recommend child-friendly administration methods`;
  } else if (ageGroup.includes('elderly')) {
    return `
    - Consider reduced dosing requirements
    - Account for potential drug interactions
    - Include elderly-specific precautions
    - Recommend easy-to-manage formulations
    - Consider common elderly health conditions`;
  }
  return `
  - Standard adult dosing applies
  - Consider general precautions
  - Include standard usage instructions`;
}

const shouldRequestImage = async (userInfo: UserInfo): Promise<{ requiresImage: boolean; reason: string }> => {
  try {
    const groq = createGroqClient();

    const prompt = `As a medical professional, evaluate if this condition requires visual assessment.

Patient Info:
Primary Symptom: "${userInfo.primaryIssue}"
Age: ${userInfo.age} ${userInfo.ageUnit}
Gender: ${userInfo.gender}

Evaluate based on these medical criteria:

1. Visual vs Non-Visual Assessment:
   - Is this primarily a visible/external condition?
   - Can the condition be fully assessed through symptoms and history alone?
   - Would visual characteristics significantly influence diagnosis?

2. Diagnostic Requirements:
   - Are visual features critical for differential diagnosis?
   - Would treatment decisions depend on visual appearance?
   - Are measurements or visual patterns important?

3. Medical Standard of Care:
   - Would a doctor typically require visual examination?
   - Is photographic documentation standard for this condition?
   - Are visual changes important for monitoring?

4. Safety Considerations:
   - Could missing visual signs lead to misdiagnosis?
   - Are there critical visual warning signs to check?
   - Would visual assessment affect urgency determination?

Return a JSON object with this exact structure:
{
  "requiresImage": boolean,
  "reason": "detailed medical explanation of why visual assessment is or is not necessary",
  "confidence": number (0-1),
  "considerations": {
    "diagnosticValue": "explanation of diagnostic importance",
    "safetyImplications": "explanation of safety considerations"
  }
}

Focus on medical best practices and patient safety.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: TEXT_MODEL,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    console.log("AI response for image requirement:", response);
    const result = JSON.parse(response);
    
    return {
      requiresImage: result.requiresImage,
      reason: result.reason
    };

  } catch (error) {
    console.error('Image requirement check error:', error);
    // Default to not requiring an image if there's an error
    return {
      requiresImage: false,
      reason: 'We\'ll assess your symptoms through detailed questions.'
    };
  }
};

async function generateDetailedAnalysis(imageAnalysis: ImageAnalysisResult): Promise<DetailedAnalysis> {
  try {
    const groq = createGroqClient();
    
    const prompt = `Generate a detailed medical analysis based on this image analysis:
      ${JSON.stringify(imageAnalysis, null, 2)}

      Return a detailed analysis in this exact JSON format:
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
      }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: TEXT_MODEL,
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Detailed analysis generation error:', error);
    throw error;
  }
}

function addSafetyChecks(analysis: ImageAnalysisResult): ImageAnalysisResult {
  return {
    ...analysis,
    medicalConsiderations: {
      ...analysis.medicalConsiderations,
      warningSignsPresent: [
        ...analysis.medicalConsiderations.warningSignsPresent,
        'Seek immediate medical attention if condition worsens'
      ]
    }
  };
}

function getDefaultQuestionnaire(assessmentData: AssessmentData): QuestionnaireSection[] {
  const isChild = assessmentData.userInfo.age < 13;
  
  return [
    {
      id: 'symptoms',
      title: 'Symptom Assessment',
      description: 'Help us understand your symptoms better',
      questions: isChild ? [
        {
          id: 'duration',
          category: 'symptoms',
          importance: 'high',
          question: "How long has your child had these symptoms?",
          options: ["Less than a day", "1-3 days", "4-7 days", "More than a week"]
        },
        // Add more child-specific questions...
      ] : [
        {
          id: 'duration',
          category: 'symptoms',
          importance: 'high',
          question: "How long have you had these symptoms?",
          options: ["Less than 24 hours", "1-3 days", "4-7 days", "More than a week"]
        },
        // Add more adult questions...
      ]
    }
  ];
}

// Helper functions (no export)
function validateAnalysis(analysis: any): void {
  // ... implementation ...
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getDosageByAge(userInfo: UserInfo): string {
  const { age, ageUnit } = userInfo;
  
  if (ageUnit === 'months' || (ageUnit === 'years' && age < 12)) {
    return "Children's dosage - Consult a healthcare provider for specific dosing instructions";
  } else if (age >= 65) {
    return 'Adult dosage (65+ years) - May require adjusted dosing';
  } else {
    return 'Standard adult dosage as indicated on the package';
  }
}

function getDosageFrequency(medicationType: string = '', userInfo: UserInfo): string {
  const { age, ageUnit } = userInfo;
  const isChild = ageUnit === 'months' || (ageUnit === 'years' && age < 12);
  const isElderly = age >= 65;

  if (isChild) {
    return 'Frequency should be determined by a healthcare provider based on child\'s age and weight';
  } else if (isElderly) {
    return 'Every 4-6 hours as needed, or as directed by your healthcare provider';
  } else {
    return 'Every 4-6 hours as needed, not to exceed recommended daily limit';
  }
}

function getAgeSpecificInstructions(userInfo: UserInfo): string {
  const { age, ageUnit } = userInfo;
  
  if (ageUnit === 'months') {
    return 'For infants: Consult a pediatrician before use';
  } else if (ageUnit === 'years' && age < 12) {
    return 'For children under 12: Use only under adult supervision and consult a healthcare provider';
  } else if (age >= 65) {
    return 'For adults 65+: Monitor for side effects more carefully and consider starting with a lower dose';
  }
  return '';
}