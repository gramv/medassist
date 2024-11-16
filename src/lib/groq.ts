import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: "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",
});

export const analyzeSymptomsAndRecommend = async (
  symptoms: string,
  allergies: string[]
): Promise<string> => {
  const prompt = `As a healthcare AI assistant, analyze these symptoms and suggest over-the-counter medications, considering these allergies: ${allergies.join(
    ", "
  )}. Symptoms: ${symptoms}. 
  
  Important: Only recommend OTC medications, no prescription drugs. Include common side effects and usage instructions. Format as JSON.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "mixtral-8x7b-32768",
    temperature: 0.5,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "";
};

export const validateSymptoms = async (symptoms: string): Promise<boolean> => {
  const prompt = `Validate if these symptoms require immediate medical attention or can be treated with OTC medications. Return only "EMERGENCY" or "OTC". Symptoms: ${symptoms}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "mixtral-8x7b-32768",
    temperature: 0.1,
    max_tokens: 32,
  });

  return completion.choices[0]?.message?.content === "OTC";
};