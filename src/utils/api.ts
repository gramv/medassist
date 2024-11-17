import { Groq } from 'groq-sdk';
import { UserInfo } from '../types';
import toast from 'react-hot-toast';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateFollowUpQuestions(userInfo: UserInfo) {
  const isChild = userInfo.ageUnit === 'months' || (userInfo.ageUnit === 'years' && userInfo.age < 12);
  
  try {
    const prompt = `As a pediatrician${!isChild ? ' and general practitioner' : ''}, generate 2-3 specific diagnostic questions for a patient:

Patient Profile:
- Age: ${userInfo.age} ${userInfo.ageUnit} ${isChild ? '(CHILD PATIENT)' : ''}
- Gender: ${userInfo.gender}
- Primary Symptom: ${userInfo.primaryIssue}

${isChild ? 'IMPORTANT: This is a child patient. Questions must be appropriate for pediatric assessment.' : ''}

Requirements:
1. Questions must be specifically tailored to ${userInfo.primaryIssue}
2. Each question should be clear and concise
3. Provide 3-4 distinct options for each question
4. Focus on:
   ${isChild ? `
   - Duration and pattern of symptoms
   - Impact on eating/drinking/sleep
   - Associated symptoms
   - Previous remedies tried by parents
   - Any exposure to sick contacts` 
   : `
   - Pattern and timing of symptoms
   - Aggravating and relieving factors
   - Associated symptoms
   - Impact on daily activities
   - Previous treatments tried`}

Return ONLY a JSON array like this:
{
  "questions": [
    {
      "id": "q1",
      "question": "question text",
      "options": ["option 1", "option 2", "option 3"]
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
  const isChild = userInfo.ageUnit === 'months' || (userInfo.ageUnit === 'years' && userInfo.age < 12);
  const isInfant = userInfo.ageUnit === 'months' && userInfo.age < 24;
  
  try {
    const prompt = `As a ${isChild ? 'pediatrician' : 'medical professional'}, provide SAFE recommendations for:

Patient Profile:
Age: ${userInfo.age} ${userInfo.ageUnit} ${isChild ? '(CHILD PATIENT)' : ''}
Gender: ${userInfo.gender}
Main Symptom: ${userInfo.primaryIssue}

${isChild ? `CRITICAL SAFETY NOTICE:
- This is a ${isInfant ? 'INFANT' : 'CHILD'} patient
- Medications must be specifically safe for ${userInfo.age} ${userInfo.ageUnit} old
- Dosing must be precisely calculated for child's age
- Many adult medications are NOT safe for children
- When in doubt, recommend professional medical care` : ''}

Assessment Responses:
${Object.entries(answers).map(([q, a]) => `- ${a}`).join('\n')}

Provide recommendations in this EXACT JSON format:
{
  "severity": "mild | medium | serious (based on symptoms and responses)",
  "medications": [
    {
      "name": "Medication name (Brand example) - MUST BE AGE-APPROPRIATE",
      "dosage": "Precise age-appropriate dosage",
      "frequency": "How often to take"
    }
  ],
  "instructions": "Clear instructions for medication use",
  "precautions": [
    "Key precaution 1",
    "Key precaution 2"
  ],
  "seekHelp": "When to get emergency care",
  "alternatives": {
    "naturalRemedies": [
      "Safe natural remedy 1",
      "Safe natural remedy 2"
    ],
    "alternativeMedications": [
      {
        "name": "Alternative medication name - MUST BE AGE-APPROPRIATE",
        "description": "When to consider this alternative"
      }
    ]
  },
  "lifestyle": [
    "Age-appropriate lifestyle recommendation 1",
    "Age-appropriate lifestyle recommendation 2"
  ]
}

SAFETY REQUIREMENTS:
${isChild ? `
- ALL medications MUST be explicitly safe for ${userInfo.age} ${userInfo.ageUnit} old children
- Include ONLY pediatric formulations and dosages
- For infants under 2 years, recommend professional medical care for most symptoms
- Be extremely cautious with medication recommendations
- When in doubt, recommend professional medical evaluation
- Many OTC medications are NOT safe for young children` 
: `
- Consider age-specific contraindications
- Include appropriate dosing for adult age groups
- List specific precautions for the recommended medications
- Consider interactions with common conditions`}

- If symptoms suggest anything beyond mild severity, recommend professional medical care
- Be specific about emergency warning signs
- Include age-appropriate alternatives and lifestyle modifications`;

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

    // Additional safety validation for children
    if (isChild && recommendation.severity !== 'mild') {
      recommendation.medications = [];
      recommendation.severity = 'serious';
      recommendation.instructions = "For children of this age, please consult a healthcare provider for proper evaluation and treatment.";
    }

    return recommendation;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    toast.error('Failed to generate recommendation. Please try again.');
    return null;
  }
} 