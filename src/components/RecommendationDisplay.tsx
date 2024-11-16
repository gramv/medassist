import { type FC } from 'react';
import { AlertTriangle, Clock, Pill, ShieldAlert, Lightbulb, ArrowRight, AlertCircle } from 'lucide-react';
import type { MedicationRecommendation } from '../types/medical';

interface Props {
  recommendation: MedicationRecommendation;
  onReset: () => void;
}

const RecommendationDisplay: FC<Props> = ({ recommendation, onReset }) => {
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-100';
      case 'soon':
        return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      default:
        return 'text-green-600 bg-green-50 border-green-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          This tool provides general recommendations only. Always consult a healthcare professional for medical advice.
        </p>
      </div>

      {recommendation.seekMedicalAttention && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Medical Attention Recommended</h3>
            <p className="mt-1 text-sm text-red-700">
              Based on your symptoms, we recommend consulting a healthcare professional.
              The following recommendations are for temporary relief only.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-red-500" />
            Primary Recommendation
          </h3>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{recommendation.primaryMedication.name}</h4>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getUrgencyColor(recommendation.urgencyLevel)}`}>
                {recommendation.urgencyLevel.charAt(0).toUpperCase() + recommendation.urgencyLevel.slice(1)}
              </span>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Dosage</p>
                <p className="mt-1 text-sm text-gray-600">{recommendation.primaryMedication.dosage}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Frequency</p>
                <p className="mt-1 text-sm text-gray-600">{recommendation.primaryMedication.frequency}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Duration</p>
              <p className="mt-1 text-sm text-gray-600">{recommendation.primaryMedication.duration}</p>
            </div>

            {recommendation.primaryMedication.warnings.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-yellow-700">
                <ShieldAlert className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <ul className="list-disc list-inside space-y-1">
                  {recommendation.primaryMedication.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {recommendation.alternativeOptions && recommendation.alternativeOptions.length > 0 && (
          <div className="border-t border-gray-100 p-6">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Alternative Options
            </h4>
            <ul className="mt-3 space-y-3">
              {recommendation.alternativeOptions.map((alt, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">{alt.name}</span>
                    <p className="text-sm text-gray-600">{alt.context}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-100 p-6">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-gray-500" />
            Lifestyle Recommendations
          </h4>
          <ul className="mt-3 space-y-2">
            {recommendation.lifestyle.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Start New Assessment
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Print Report
        </button>
      </div>

      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>© {new Date().getFullYear()} MedAssist. All recommendations are for informational purposes only.</p>
      </div>
    </div>
  );
};

export default RecommendationDisplay; 