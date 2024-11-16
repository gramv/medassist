import { Groq } from 'groq-sdk';
import { UserInfo } from '../types';
import toast from 'react-hot-toast';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateFollowUpQuestions(userInfo: UserInfo) {
  try {
    const prompt = `As an experienced medical professional, generate 2-3 highly specific diagnostic questions for a patient with:

Patient Profile:
- Age: ${userInfo.age} ${userInfo.ageUnit}
- Gender: ${userInfo.gender}
- Primary Symptom: ${userInfo.primaryIssue}

Requirements:
1. Questions must be specifically tailored to ${userInfo.primaryIssue}
2. Each question should be clear and concise
3. Provide 3-4 distinct options for each question
4. Do not include option labels (A, B, C) in the question text
5. Focus on key diagnostic factors such as:
   - Pattern and timing of symptoms
   - Aggravating and relieving factors
   - Associated symptoms
   - Impact on daily activities
   - Previous treatments tried

Return ONLY a JSON array like this:
{
  "questions": [
    {
      "id": "q1",
      "question": "Have you tried any treatments for your symptoms?",
      "options": [
        "Over-the-counter nasal sprays",
        "Home remedies like ice or pressure",
        "Prescription medications",
        "No treatments tried"
      ]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.2,
      max_tokens: 500,
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return response.questions || [];
  } catch (error) {
    console.error('Error generating questions:', error);
    toast.error('Failed to generate questions');
    return [];
  }
}

export async function generateRecommendation(userInfo: UserInfo, answers: Record<string, string>) {
  try {
    const prompt = `As a medical professional, analyze this case and provide recommendations:

Patient Profile:
Age: ${userInfo.age} ${userInfo.ageUnit}
Gender: ${userInfo.gender}
Main Symptom: ${userInfo.primaryIssue}

Assessment Responses:
${Object.entries(answers).map(([q, a]) => `- ${a}`).join('\n')}

First, assess the severity of the condition and provide a treatment plan in this EXACT JSON format:
{
  "severity": "mild | medium | serious (based on symptoms and responses)",
  "medications": [
    {
      "name": "Primary medication name (Brand example)",
      "dosage": "Specific dosage for patient age",
      "frequency": "How often to take"
    }
  ],
  "instructions": "Brief, clear instructions for medication use",
  "precautions": [
    "Key precaution 1",
    "Key precaution 2"
  ],
  "seekHelp": "When to get emergency care",
  "alternatives": {
    "naturalRemedies": [
      "Specific natural remedy 1",
      "Specific natural remedy 2",
      "Specific natural remedy 3"
    ],
    "alternativeMedications": [
      {
        "name": "Alternative medication name",
        "description": "Brief description of when to consider this alternative"
      }
    ]
  },
  "lifestyle": [
    "Specific lifestyle recommendation 1",
    "Specific lifestyle recommendation 2",
    "Specific lifestyle recommendation 3"
  ]
}

Requirements:
- Assess severity as:
  * mild: can be safely managed at home
  * medium: should be checked by doctor soon but not urgent
  * serious: needs prompt medical attention
- All recommendations must be specific to ${userInfo.primaryIssue}
- Consider patient age (${userInfo.age} ${userInfo.ageUnit}) for all suggestions
- Include only evidence-based natural remedies
- Suggest practical lifestyle changes
- List appropriate alternative medications
- Keep all descriptions concise and clear`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Empty response from API');
    }

    const cleanedResponse = response.trim().replace(/```json|```/g, '');
    const recommendation = JSON.parse(cleanedResponse);

    // Validate all required fields
    if (!recommendation.medications?.length || 
        !recommendation.instructions || 
        !recommendation.precautions?.length || 
        !recommendation.seekHelp ||
        !recommendation.alternatives?.naturalRemedies?.length ||
        !recommendation.alternatives?.alternativeMedications?.length ||
        !recommendation.lifestyle?.length) {
      throw new Error('Invalid recommendation format');
    }

    return recommendation;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    toast.error('Failed to generate recommendation. Please try again.');
    return null;
  }
} 