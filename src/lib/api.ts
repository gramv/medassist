import Groq from "groq-sdk";
import { toast } from "react-hot-toast";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface AnalyzeResponse {
  recommendations: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
}

export const analyzeSymptomsAndRecommend = async (
  symptoms: string,
  allergies: string[]
): Promise<AnalyzeResponse> => {
  try {
    const prompt = `As a healthcare AI assistant, analyze these symptoms and provide recommendations. 
    Return a JSON object with two fields:
    1. severity: either "low", "medium", "high", or "emergency"
    2. recommendations: detailed recommendations for over-the-counter medications

    Consider these allergies: ${allergies.join(", ")}
    Symptoms: ${symptoms}

    Rules:
    - Only recommend OTC medications, no prescription drugs
    - Include dosage and usage instructions
    - List potential side effects
    - If symptoms suggest emergency care, set severity to "emergency"
    - Keep recommendations concise but informative
    
    Format the response EXACTLY like this example:
    {
      "severity": "low",
      "recommendations": "Detailed recommendations here"
    }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response received from API");
    }

    try {
      const result = JSON.parse(content);
      
      if (!result.severity || !result.recommendations) {
        throw new Error("Invalid response format");
      }

      return {
        recommendations: result.recommendations,
        severity: result.severity as AnalyzeResponse['severity']
      };
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      throw new Error("Unable to parse API response");
    }
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred");
  }
};