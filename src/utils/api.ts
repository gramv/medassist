import { Groq } from 'groq-sdk';
import { env } from '../config/env';
// ... [previous imports remain the same]

// Update the recommendation generation function with stricter safety checks
async function generateRecommendation(assessmentData: AssessmentData): Promise<ComprehensiveRecommendation> {
  const groq = createGroqClient();

  const severityCheckPrompt = `
  Medical Safety Assessment:
  ${JSON.stringify(assessmentData, null, 2)}

  Evaluate if this is a serious medical condition requiring professional attention ONLY.
  Return JSON: { "isSerious": boolean, "reasons": string[], "requiresProfessional": boolean }
  
  Consider:
  1. Is this potentially life-threatening?
  2. Could this indicate a severe underlying condition?
  3. Are prescription medications typically required?
  4. Is professional diagnosis necessary?
  5. Could self-treatment be dangerous?
  `;

  const severityCheck = await groq.chat.completions.create({
    messages: [{ role: 'user', content: severityCheckPrompt }],
    model: TEXT_MODEL,
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: "json_object" }
  });

  const severityResponse = JSON.parse(severityCheck.choices[0]?.message?.content || '{}');

  // Modify the main analysis prompt based on severity
  const analysisPrompt = `As a medical professional, analyze this patient's condition with extreme caution regarding medication recommendations:

Patient Information:
${JSON.stringify(assessmentData.userInfo, null, 2)}

Visual Analysis Results:
${assessmentData.imageAnalysis ? JSON.stringify(assessmentData.imageAnalysis, null, 2) : 'No image analysis available'}

Questionnaire Responses:
${JSON.stringify(assessmentData.questionnaireAnswers, null, 2)}

CRITICAL SAFETY GUIDELINES:
1. DO NOT recommend any over-the-counter medications for:
   - Severe symptoms
   - Potentially serious conditions
   - Conditions requiring professional diagnosis
   - Complex medical situations
   - Any condition where self-treatment could mask serious problems

2. Instead for serious conditions:
   - Emphasize importance of professional medical care
   - Provide interim self-care measures (if safe)
   - Suggest natural remedies ONLY if scientifically supported and safe
   - Focus on lifestyle modifications and preventive measures
   - Include clear warning signs and emergency indicators

3. For mild conditions only:
   - Recommend OTC medications only with clear safety warnings
   - Include specific contraindications
   - Emphasize proper usage and limitations
   - Include when to seek professional care

4. Special populations (extra caution):
   - Children under 12
   - Elderly patients
   - Pregnant/nursing women
   - People with chronic conditions
   - Patients on other medications

THIS IS A ${severityResponse.isSerious ? 'SERIOUS' : 'NON-SERIOUS'} CONDITION.
${severityResponse.isSerious ? 'DO NOT INCLUDE ANY OTC MEDICATION RECOMMENDATIONS.' : 'Include appropriate OTC recommendations with safety guidelines.'}

Provide analysis in this EXACT JSON format:
{
  "analysis": {
    // [previous JSON structure remains the same]
  }
}`;

  // [Rest of the function remains the same]
}

// Update helper functions with enhanced safety checks
function mapSeverity(urgencyLevel: string): 'mild' | 'moderate' | 'severe' {
  switch (urgencyLevel.toLowerCase()) {
    case 'emergency':
    case 'urgent':
      return 'severe';
    case 'routine':
      return 'moderate';
    default:
      return 'mild';
  }
}

function getAgeSpecificInstructions(userInfo: UserInfo): string {
  const { age, ageUnit } = userInfo;
  
  if (ageUnit === 'months' || (ageUnit === 'years' && age < 12)) {
    return 'IMPORTANT: For children, always consult a healthcare provider before using any medications or treatments.';
  } else if (age >= 65) {
    return 'IMPORTANT: For seniors, consult healthcare provider before starting any new treatment due to potential interactions and complications.';
  }
  return 'When in doubt, consult a healthcare provider before starting any new treatment.';
}

// [Rest of the code remains the same]

export {
  analyzeImage,
  checkConditionMatch,
  generateFollowUpQuestions,
  generateRecommendation,
  shouldRequestImage,
  generateDetailedAnalysis,
  mapTimeframe
};