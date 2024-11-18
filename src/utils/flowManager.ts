import { UserInfo, SymptomAnalysis } from '../types';

export async function determineNextStep(userInfo: UserInfo) {
  try {
    const prompt = `As a medical professional, analyze this patient's initial symptoms:
    Age: ${userInfo.age} ${userInfo.ageUnit}
    Gender: ${userInfo.gender}
    Symptom: ${userInfo.primaryIssue}

    Determine the next steps. Return in JSON format:
    {
      "requiresVisualInspection": boolean,
      "requiresQuestionnaire": boolean,
      "requiresImmediateMedical": boolean,
      "reason": "explanation",
      "urgencyLevel": "low|medium|high",
      "recommendedActions": ["action1", "action2"]
    }`;

    // API call to determine next steps
    const analysis = await analyzeSymptom(prompt);
    
    if (analysis.requiresImmediateMedical) {
      return {
        type: 'MEDICAL_ATTENTION',
        message: 'Based on your symptoms, we recommend immediate medical attention.',
        reasons: analysis.recommendedActions
      };
    }

    if (analysis.requiresVisualInspection) {
      return {
        type: 'VISUAL_INSPECTION',
        message: 'Please provide a clear image of the affected area.',
        instructions: analysis.recommendedActions
      };
    }

    return {
      type: 'QUESTIONNAIRE',
      message: 'Please answer a few questions about your symptoms.',
      focusAreas: analysis.recommendedActions
    };
  } catch (error) {
    console.error('Error in flow determination:', error);
    return {
      type: 'QUESTIONNAIRE',
      message: 'Let's understand your symptoms better.'
    };
  }
} 