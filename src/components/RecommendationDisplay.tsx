import { Recommendation } from '../types';
import { 
  PillIcon, 
  RotateCcw, 
  AlertCircle, 
  ShieldCheck,
  Printer,
  Sparkles
} from 'lucide-react';

interface Props {
  recommendation: Recommendation;
  onReset: () => void;
}

function RecommendationDisplay({ recommendation, onReset }: Props) {
  return (
    <div className="space-y-8">
      {/* Severity Alert */}
      {recommendation.severity !== 'mild' && (
        <div className={`rounded-lg p-4 ${
          recommendation.severity === 'serious' 
            ? 'bg-red-50 border-l-4 border-red-500' 
            : 'bg-yellow-50 border-l-4 border-yellow-500'
        }`}>
          <div className="flex items-start">
            <AlertCircle className={`h-6 w-6 ${
              recommendation.severity === 'serious' ? 'text-red-600' : 'text-yellow-600'
            } mt-0.5 flex-shrink-0`} />
            <div className="ml-3">
              <h3 className={`text-lg font-semibold ${
                recommendation.severity === 'serious' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {recommendation.severity === 'serious' 
                  ? 'Immediate Medical Attention Recommended'
                  : 'Medical Consultation Recommended'
                }
              </h3>
              <p className={`text-sm mt-1 ${
                recommendation.severity === 'serious' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {recommendation.severity === 'serious'
                  ? 'Based on your symptoms, please seek immediate medical care. The following recommendations are for temporary relief only.'
                  : 'Based on your symptoms, we recommend consulting a healthcare professional soon. The following recommendations can help manage your symptoms in the meantime.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">Treatment Recommendations</h2>
        <p className="mt-2 text-gray-600">
          Personalized guidance for symptom management
        </p>
      </div>

      {/* Primary Recommendation */}
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Primary Recommendation</h3>
          {recommendation.medications.map((med, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-800">{med.name}</h4>
              <div className="bg-white rounded-lg p-4 space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Routine</h5>
                  <div className="grid gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Dosage</span>
                      <p className="font-medium text-gray-900">{med.dosage}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Frequency</span>
                      <p className="font-medium text-gray-900">{med.frequency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alternative Options */}
        <div className="bg-purple-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Alternative Options</h3>
          </div>
          <div className="space-y-4">
            {/* Natural Remedies */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">Natural Remedies</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {recommendation.alternatives.naturalRemedies.map((remedy, index) => (
                  <li key={index}>{remedy}</li>
                ))}
              </ul>
            </div>
            {/* Alternative Medications */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">Alternative Medications</h4>
              <div className="space-y-3">
                {recommendation.alternatives.alternativeMedications.map((med, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    <p className="font-medium text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-700">{med.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lifestyle Recommendations */}
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Lifestyle Recommendations</h3>
          </div>
          <div className="bg-white rounded-lg p-4">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {recommendation.lifestyle.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Precautions */}
        <div className="bg-yellow-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Important Precautions</h3>
          </div>
          <ul className="space-y-2">
            {recommendation.precautions.map((precaution, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold text-sm mt-1">•</span>
                <span className="text-gray-700">{precaution}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* When to Seek Help */}
        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">When to Seek Medical Help</h3>
          </div>
          <p className="text-gray-700">{recommendation.seekHelp}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Assessment
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>
    </div>
  );
}

export default RecommendationDisplay; 