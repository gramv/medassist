import { type FC, useState } from 'react';
import { Groq } from 'groq-sdk';
import toast from 'react-hot-toast';
import type { SymptomAssessment, MedicationRecommendation } from '../types/medical';
import SymptomAssessmentForm from './SymptomAssessmentForm';
import RecommendationDisplay from './RecommendationDisplay';

const SymptomChecker: FC = () => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<MedicationRecommendation | null>(null);

  const handleAssessmentSubmit = async (assessment: SymptomAssessment) => {
    setLoading(true);
    try {
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = `
        Act as a medical expert providing over-the-counter medication recommendations. 
        Based on the following patient assessment, provide detailed recommendations:

        Patient Profile:
        - Age: ${assessment.age} years old
        - Gender: ${assessment.gender}
        
        Symptoms Information:
        - Category: ${assessment.category}
        - Primary Symptom: ${assessment.primarySymptom}
        - Severity: ${assessment.severity}
        - Duration: ${assessment.duration}
        - Additional Symptoms: ${assessment.additionalSymptoms.join(', ')}
        
        Medical Background:
        - Previous Medication: ${assessment.previousMedication || 'None'}
        - Medical History: ${assessment.medicalHistory || 'None reported'}
        - Current Medications: ${assessment.currentMedications || 'None'}
        - Allergies: ${assessment.allergies || 'None reported'}

        Consider the patient's age and gender when providing recommendations. Adjust dosages and medications accordingly.
        Some medications may have different effects or risks based on age and gender.

        Provide recommendations in the following JSON format:
        {
          "primaryMedication": {
            "name": "Medication name",
            "dosage": "Specific dosage based on age/gender",
            "frequency": "How often to take",
            "duration": "How long to take",
            "warnings": ["List of specific warnings including age/gender specific concerns"]
          },
          "alternativeOptions": [
            {
              "name": "Alternative medication",
              "context": "When to consider this alternative"
            }
          ],
          "lifestyle": ["List of lifestyle recommendations"],
          "warnings": ["General warnings"],
          "seekMedicalAttention": boolean,
          "urgencyLevel": "routine|soon|urgent"
        }

        Consider potential drug interactions, severity, duration of symptoms, and any age or gender-specific concerns.
        Always err on the side of caution and recommend seeking medical attention when appropriate.
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'mixtral-8x7b-32768',
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from AI');
      }

      const parsedResponse = JSON.parse(response) as MedicationRecommendation;
      setRecommendation(parsedResponse);
      
      if (parsedResponse.seekMedicalAttention) {
        toast.error('Based on your symptoms, we recommend consulting a healthcare professional.');
      } else {
        toast.success('Recommendations generated successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendation(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
        <p className="mt-4 text-gray-600">Analyzing symptoms and generating recommendations...</p>
      </div>
    );
  }

  return recommendation ? (
    <RecommendationDisplay 
      recommendation={recommendation} 
      onReset={handleReset}
    />
  ) : (
    <SymptomAssessmentForm onSubmit={handleAssessmentSubmit} />
  );
};

export default SymptomChecker;