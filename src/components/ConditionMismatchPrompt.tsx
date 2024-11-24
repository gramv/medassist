// In components/ConditionMismatchPrompt.tsx

import { ImageAnalysisResult } from '../types';
import { AlertTriangle, CircleDot, Eye } from 'lucide-react';

interface Props {
  reportedCondition: string;
  imageAnalysis: ImageAnalysisResult;
  onContinueWithImage: () => void;
  onContinueWithReported: () => void;
}

function ConditionMismatchPrompt({
  reportedCondition,
  imageAnalysis,
  onContinueWithImage,
  onContinueWithReported
}: Props) {
  // Safely access nested properties
  const detectedLocation = imageAnalysis?.bodyPart?.detected || 'detected area';
  const conditionType = imageAnalysis?.condition?.type || 'detected condition';
  const characteristics = imageAnalysis?.condition?.characteristics || [];

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900">
              Different Location Detected
            </h3>
            <p className="mt-2 text-yellow-800">
              You reported symptoms in your <span className="font-medium">{reportedCondition}</span>,
              but the image shows a condition on your {detectedLocation}.
            </p>
            
            <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900">Image Analysis:</h4>
              <ul className="mt-2 space-y-1 text-yellow-800">
                <li>• Location: {detectedLocation}</li>
                <li>• Condition: {conditionType}</li>
                {characteristics.length > 0 && (
                  <li>• Characteristics: {characteristics.join(', ')}</li>
                )}
              </ul>
            </div>

            <p className="mt-4 text-sm text-yellow-700">
              Would you like to:
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={onContinueWithImage}
          className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CircleDot className="h-5 w-5" />
          Get help for the condition shown in image
          <span className="text-sm opacity-90">
            ({conditionType} on {detectedLocation})
          </span>
        </button>

        <button
          onClick={onContinueWithReported}
          className="flex items-center justify-center gap-2 p-4 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Eye className="h-5 w-5" />
          Upload a new image for reported condition
          <span className="text-sm opacity-90">
            ({reportedCondition})
          </span>
        </button>
      </div>
    </div>
  );
}

export default ConditionMismatchPrompt;