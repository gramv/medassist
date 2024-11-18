export function validateImageAnalysis(analysis: any) {
  if (analysis.requiresMedicalAttention) {
    return {
      safe: false,
      message: "Based on the image analysis, we recommend immediate medical attention.",
      reasons: analysis.concerningSigns
    };
  }
  
  return {
    safe: true,
    recommendations: analysis.recommendations
  };
} 