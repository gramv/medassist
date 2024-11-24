import React, { useState } from 'react';
import { 
  Pill, Heart, Calendar, AlertCircle, Clock, 
  Leaf, Activity, DollarSign, AlertTriangle,
  ChevronDown, ChevronUp, ExternalLink, 
  ShieldAlert, Stethoscope, ArrowRight, Printer
} from 'lucide-react';
import { ComprehensiveRecommendation } from '../types';
import PrintableReport from './PrintableReport';
import PrimaryMedicationsSection from './sections/PrimaryMedicationsSection';

interface Props {
  recommendation: ComprehensiveRecommendation;
  onReset: () => void;
}

function RecommendationDisplay({ recommendation, onReset }: Props) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    medications: true,
    natural: false,
    lifestyle: false,
    emergency: false,
    followUp: false
  });

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  if (!recommendation || 
      !recommendation.condition || 
      !recommendation.medications || 
      !recommendation.medications.primary) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Unable to load recommendation details</p>
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Try Again
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    );
  }

  const {
    condition,
    medications,
    naturalRemedies = [],
    lifestyle = [],
    emergencyGuidelines,
    followUp,
    prevention = { shortTerm: [], longTerm: [] }
  } = recommendation;

  const severity = condition?.severity || 'moderate';
  const description = condition?.description || '';
  const expectedDuration = condition?.expectedDuration || '';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Medical Alert Card */}
      {(recommendation.condition.severity === 'moderate' || recommendation.condition.severity === 'severe') && (
        <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-100">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Please Consult a Medical Professional
              </h2>
              <p className="text-red-700 mb-3">
                The following recommendations are for temporary relief only. Given the {recommendation.condition.severity} 
                nature of your condition, we strongly advise consulting a healthcare provider 
                {recommendation.medicalAttention.timeframe === 'immediate' 
                  ? ' immediately' 
                  : recommendation.medicalAttention.timeframe === '24_hours'
                  ? ' within 24 hours'
                  : ' as soon as possible'}.
              </p>
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">Reasons for Medical Consultation:</h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {recommendation.medicalAttention.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
              {recommendation.emergencyGuidelines?.medicalContactInfo && (
                <div className="mt-4 flex items-center text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Recommended: {recommendation.emergencyGuidelines.medicalContactInfo.recommendation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer for all cases */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            These over-the-counter recommendations are for informational purposes and temporary symptom relief only. 
            They are not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>

      {/* Condition Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Treatment Recommendations
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${severity === 'mild' ? 'bg-green-100 text-green-800' :
              severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </span>
          {expectedDuration && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{expectedDuration}</span>
            </>
          )}
        </div>
        {description && (
          <p className="text-gray-700 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Primary Medications */}
      {medications?.primary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('medications')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Pill className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recommended Medications
                </h3>
                <p className="text-sm text-gray-500">
                  Primary and alternative treatment options
                </p>
              </div>
            </div>
            {expandedSections.medications ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.medications && (
            <div className="px-6 pb-6">
              <PrimaryMedicationsSection 
                primary={medications.primary}
                alternatives={medications.alternatives}
              />
            </div>
          )}
        </div>
      )}

      {/* Natural Remedies */}
      {naturalRemedies && naturalRemedies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('natural')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Leaf className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Natural Remedies
                </h3>
                <p className="text-sm text-gray-500">
                  Evidence-based natural treatments
                </p>
              </div>
            </div>
            {expandedSections.natural ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.natural && (
            <div className="px-6 pb-6">
              <div className="grid gap-4">
                {naturalRemedies.map((remedy, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{remedy.name}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full
                        ${remedy.scientificEvidence === 'strong' ? 'bg-green-100 text-green-800' :
                          remedy.scientificEvidence === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {remedy.scientificEvidence} evidence
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Usage:</span> {remedy.usage.method}</p>
                      <p><span className="font-medium">Frequency:</span> {remedy.usage.frequency}</p>
                      <p><span className="font-medium">Duration:</span> {remedy.usage.duration}</p>
                    </div>
                    {remedy.precautions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-600">Precautions:</p>
                        <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                          {remedy.precautions.map((precaution, i) => (
                            <li key={i}>{precaution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lifestyle Recommendations */}
      {lifestyle && lifestyle.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('lifestyle')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lifestyle Changes
                </h3>
                <p className="text-sm text-gray-500">
                  Recommended adjustments and activities
                </p>
              </div>
            </div>
            {expandedSections.lifestyle ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.lifestyle && (
            <div className="px-6 pb-6">
              {lifestyle.map((item, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-lg font-medium text-gray-900 capitalize">
                      {item.category}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full
                      ${item.priority === 'essential' ? 'bg-red-100 text-red-800' :
                        item.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}>
                      {item.priority}
                    </span>
                  </div>
                  {item.recommendations.map((rec, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <p className="text-gray-700 mb-2">{rec.action}</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {rec.tips.map((tip, j) => (
                          <li key={j}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emergency Guidelines */}
      {emergencyGuidelines && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('emergency')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Warning Signs
                </h3>
                <p className="text-sm text-gray-500">
                  When to seek immediate medical attention
                </p>
              </div>
            </div>
            {expandedSections.emergency ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.emergency && (
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-medium text-red-800 mb-2">
                    Warning Symptoms
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {emergencyGuidelines.warningSymptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    Immediate Actions
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {emergencyGuidelines.immediateActions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
                {emergencyGuidelines.medicalContactInfo && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-base font-medium text-blue-900 mb-2">
                      Medical Contact Information
                    </h4>
                    <p className="text-sm text-blue-800">
                      {emergencyGuidelines.medicalContactInfo.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Care */}
      {followUp && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('followUp')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Follow-up Care
                </h3>
                <p className="text-sm text-gray-500">
                  Monitoring and recovery timeline
                </p>
              </div>
            </div>
            {expandedSections.followUp ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.followUp && (
            <div className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">
                    Recovery Timeline
                  </h4>
                  <div className="space-y-4">
                    {followUp.checkpoints.map((checkpoint, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <p className="text-sm text-gray-700">{checkpoint}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-medium text-green-900 mb-2">
                    Signs of Improvement
                  </h4>
                  <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                    {followUp.improvementSigns.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-base font-medium text-red-900 mb-2">
                    Warning Signs
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {followUp.worseningSigns.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prevention */}
      {prevention && (prevention.shortTerm.length > 0 || prevention.longTerm.length > 0) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Prevention Tips
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {prevention.shortTerm.length > 0 && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">
                  Short-term Prevention
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {prevention.shortTerm.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {prevention.longTerm.length > 0 && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">
                  Long-term Prevention
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {prevention.longTerm.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Start New Assessment
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default RecommendationDisplay; 