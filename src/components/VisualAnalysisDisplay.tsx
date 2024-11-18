import { DetailedAnalysis } from '../types';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  analysis: DetailedAnalysis;
  onContinue: () => void;
}

function VisualAnalysisDisplay({ analysis, onContinue }: Props) {
  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent multiple clicks
    onContinue();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Analysis Results
        </h2>
        <p className="text-gray-600">
          Here's what we found based on the image analysis
        </p>
      </div>

      {/* Condition Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Condition Details
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">Location</h4>
            <p className="text-gray-600 mt-1">
              {analysis.analysis.condition.affectedArea.description}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Symptoms</h4>
            <ul className="mt-1 space-y-1">
              {analysis.analysis.condition.visualSymptoms.map((symptom, index) => (
                <li key={index} className="text-gray-600">• {symptom}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700">Possible Conditions</h4>
            <ul className="mt-1 space-y-1">
              {analysis.analysis.condition.possibleDiagnoses.map((diagnosis, index) => (
                <li key={index} className="text-gray-600">• {diagnosis}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Medical Attention */}
      {analysis.analysis.urgency.requiresMedicalAttention && (
        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900">
                Medical Attention Recommended
              </h3>
              <p className="text-red-700 mt-1">
                Timeframe: {analysis.analysis.urgency.timeframe}
              </p>
              <div className="mt-3">
                <h4 className="font-medium text-red-800">Reasons:</h4>
                <ul className="mt-2 space-y-2">
                  {analysis.analysis.urgency.factors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-700">
                      <span>•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Questions
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default VisualAnalysisDisplay; 