import { ImageAnalysisResult, SymptomMatch } from '../types';
import { AlertTriangle, Upload, ArrowRight } from 'lucide-react';

interface Props {
  imageAnalysis: ImageAnalysisResult;
  symptomMatch: SymptomMatch;
  onRetry: () => void;
  onContinue: () => void;
  onMultipleSymptoms: () => void;
}

function ImageMismatchHandler({ 
  imageAnalysis, 
  symptomMatch, 
  onRetry, 
  onContinue,
  onMultipleSymptoms 
}: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="space-y-3">
            <h3 className="font-semibold text-yellow-900">
              Image and Reported Symptom Mismatch
            </h3>
            <p className="text-yellow-800">{symptomMatch.explanation}</p>
            
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">What we found:</h4>
              <ul className="space-y-1 text-yellow-800">
                <li>• Body part: {imageAnalysis.bodyPart.detected}</li>
                <li>• Condition: {imageAnalysis.condition.type}</li>
                <li>• Characteristics: {imageAnalysis.condition.characteristics.join(', ')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Image of Reported Symptom
        </button>

        <button
          onClick={onMultipleSymptoms}
          className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          I Have Multiple Symptoms
        </button>

        <p className="text-sm text-gray-500 text-center">
          Choose "Multiple Symptoms" if you're experiencing both conditions
        </p>
      </div>
    </div>
  );
}

export default ImageMismatchHandler; 