import { Groq } from 'groq-sdk';
import { UserInfo, ImageAnalysis } from '../types';
import toast from 'react-hot-toast';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeImage(
  imageBase64: string,
  userInfo: UserInfo
): Promise<ImageAnalysis | null> {
  try {
    const prompt = `As a medical professional, analyze this image for a patient with:
Age: ${userInfo.age} ${userInfo.ageUnit}
Gender: ${userInfo.gender}
Reported Symptom: ${userInfo.primaryIssue}

Provide analysis in this format:
{
  "symptoms": ["visible symptom 1", "visible symptom 2"],
  "severity": "mild | moderate | severe",
  "firstAid": ["step 1", "step 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "requiresMedicalAttention": boolean
}

Consider:
1. Age-appropriate assessment
2. Visible symptoms and characteristics
3. Immediate first aid if needed
4. Whether professional medical care is required
5. Safety recommendations`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: imageBase64 }
          ]
        }
      ],
      model: "llama2-70b-vision",
      temperature: 0.1,
    });

    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error('Error analyzing image:', error);
    toast.error('Failed to analyze image');
    return null;
  }
} 