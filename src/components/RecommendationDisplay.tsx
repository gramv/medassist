import { FinalRecommendation } from '../types';
import { 
  AlertTriangle,
  Pill, 
  RotateCw, 
  Leaf,
  ListChecks,
  AlertCircle,
  MessageSquare,
  FileCheck,
  ArrowRight
} from 'lucide-react';

interface Props {
  recommendation: FinalRecommendation;
  onReset: () => void;
}

function RecommendationDisplay({ recommendation, onReset }: Props) {
  const requiresUrgentCare = 
    recommendation.medicalAttention?.required || 
    recommendation.severity === 'severe' ||
    (recommendation.severity === 'moderate');

  return (
    <div className="space-y-8">
      {requiresUrgentCare && (
        <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900">
                Medical Attention Required
              </h3>
              <p className="text-red-700 mt-1">
                Timeframe: {recommendation.medicalAttention?.timeframe || 'As soon as possible'}
              </p>
              <div className="mt-3 bg-white bg-opacity-50 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Reasons:</h4>
                <ul className="space-y-2">
                  {recommendation.medicalAttention?.reasons?.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-700">
                      <span>•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900">
        Treatment Recommendations
      </h2>
      <p className="text-gray-600">
        Personalized guidance for symptom management
      </p>

      {/* Medication Timeline */}
      {recommendation.medications?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Treatment Timeline
          </h3>
          <div className="space-y-6">
            {recommendation.medications.map((med, index) => (
              <div key={index} className="relative pl-8 pb-6 border-l-2 border-blue-200 last:border-0">
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500" />
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{med.name}</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                    <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                    <p><span className="font-medium">Duration:</span> {med.duration}</p>
                  </div>
                  {med.warnings && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">Important Notes:</p>
                      <ul className="mt-1 space-y-1">
                        {med.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-yellow-700">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitoring Section */}
      {recommendation.monitoring && (
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-900 mb-4">
            Monitoring & Follow-up
          </h3>
          <div className="space-y-4">
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Watch for These Signs:</h4>
              <ul className="space-y-2">
                {recommendation.monitoring?.warningSignals?.map((signal, index) => (
                  <li key={index} className="flex items-start gap-2 text-purple-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">When to Seek Help:</h4>
              <ul className="space-y-2">
                {recommendation.monitoring?.seekHelpIf?.map((condition, index) => (
                  <li key={index} className="flex items-start gap-2 text-purple-800">
                    <span>•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Natural Remedies Section */}
      {recommendation.alternatives?.naturalRemedies?.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-emerald-900">Natural Remedies</h3>
          </div>
          <div className="space-y-4">
            {recommendation.alternatives.naturalRemedies.map((remedy, index) => (
              <div key={index} className="bg-white bg-opacity-50 rounded-lg p-4">
                <h4 className="font-medium text-emerald-800">{remedy.remedy}</h4>
                <div className="mt-2 space-y-2 text-sm text-emerald-700">
                  <p><span className="font-medium">Usage:</span> {remedy.usage}</p>
                  <p><span className="font-medium">Frequency:</span> {remedy.frequency}</p>
                  <p><span className="font-medium">Benefits:</span> {remedy.benefits}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Medications */}
      {recommendation.alternatives?.alternativeMedications?.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-indigo-900">Alternative Medications</h3>
          </div>
          <div className="space-y-4">
            {recommendation.alternatives.alternativeMedications.map((med, index) => (
              <div key={index} className="bg-white bg-opacity-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800">{med.name}</h4>
                <p className="text-sm text-indigo-600 mt-1">
                  Available as: {med.brandNames.join(', ')}
                </p>
                <div className="mt-2 space-y-2 text-sm text-indigo-700">
                  <p><span className="font-medium">When to consider:</span> {med.whenToConsider}</p>
                  <p><span className="font-medium">Benefits:</span> {med.benefits}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Recommendations */}
      {recommendation.lifestyle?.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-6 w-6 text-amber-600" />
            <h3 className="text-xl font-bold text-amber-900">Lifestyle Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendation.lifestyle.map((item, index) => (
              <div key={index} className="bg-white bg-opacity-50 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 capitalize">{item.category}</h4>
                <ul className="mt-2 space-y-2">
                  {item.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-amber-700">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Visit Section - Only for moderate/severe cases */}
      {(recommendation.severity === 'moderate' || recommendation.severity === 'severe') && 
       recommendation.doctorVisit && (
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-900">Questions for Your Doctor</h3>
          </div>
          <div className="space-y-4">
            {/* Questions to Ask */}
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Questions to Ask:</h4>
              <ul className="space-y-2">
                {recommendation.doctorVisit.questionsForDoctor.map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-700">
                    <span>•</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Symptoms to Mention */}
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Important Symptoms to Mention:</h4>
              <ul className="space-y-2">
                {recommendation.doctorVisit.symptomsToMention.map((symptom, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-700">
                    <span>•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Tests */}
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Tests That May Be Needed:</h4>
              <ul className="space-y-2">
                {recommendation.doctorVisit.suggestedTests.map((test, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-700">
                    <span>•</span>
                    <span>{test}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RotateCw className="h-5 w-5" />
          Start New Assessment
        </button>
      </div>
    </div>
  );
}

export default RecommendationDisplay; 