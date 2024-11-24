import React from 'react';
import { AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface ConditionDetails {
  name: string;
  commonName?: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  expectedDuration: string;
  symptoms: {
    primary: string[];
    associated: string[];
    progression: string;
  };
  riskFactors: string[];
}

interface Props {
  condition: ConditionDetails;
}

const ConditionOverviewSection: React.FC<Props> = ({ condition }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header with Severity */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {condition.name}
          </h2>
          {condition.commonName && (
            <p className="text-sm text-gray-500 mt-1">
              Also known as: {condition.commonName}
            </p>
          )}
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getSeverityColor(condition.severity)}`}>
          {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)} Condition
        </span>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-blue-900">Expected Duration</h3>
          </div>
          <p className="text-sm text-blue-800">{condition.expectedDuration}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-medium text-purple-900">Progression</h3>
          </div>
          <p className="text-sm text-purple-800">{condition.symptoms.progression}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="font-medium text-orange-900">Risk Level</h3>
          </div>
          <p className="text-sm text-orange-800">
            {condition.riskFactors.length > 0 ? 
              `${condition.riskFactors.length} risk factors identified` : 
              'No significant risk factors'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">About This Condition</h3>
        <p className="text-gray-700 leading-relaxed">
          {condition.description}
        </p>
      </div>

      {/* Symptoms */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Primary Symptoms</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {condition.symptoms.primary.map((symptom, index) => (
              <li key={index}>{symptom}</li>
            ))}
          </ul>
        </div>

        {condition.symptoms.associated.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Associated Symptoms</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {condition.symptoms.associated.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
        )}

        {condition.riskFactors.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Risk Factors</h3>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              {condition.riskFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionOverviewSection; 