import React from 'react';
import { AlertTriangle, Clock, Stethoscope, ClipboardList } from 'lucide-react';

interface MedicalAttentionInfo {
  required: boolean;
  timeframe: string;
  reasons: string[];
  doctorType: string;
  urgencyLevel: string;
  preparationInstructions?: string[];
  immediateActions?: string[];
}

interface Props {
  medicalAttention: MedicalAttentionInfo;
  severity: 'mild' | 'moderate' | 'severe';
}

const MedicalAttentionSection: React.FC<Props> = ({ medicalAttention, severity }) => {
  if (!medicalAttention.required && severity === 'mild') {
    return null;
  }

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'immediate':
        return 'bg-red-100 text-red-800 border-red-200';
      case '24_hours':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'routine':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-100">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <Stethoscope className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-800 mb-4">
            Medical Consultation Required
          </h2>

          {/* Urgency Level */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getUrgencyColor(medicalAttention.urgencyLevel)}`}>
            <Clock className="h-4 w-4 mr-2" />
            {medicalAttention.timeframe.replace('_', ' ')}
          </div>

          {/* Reasons */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Reasons for Medical Consultation:</h3>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {medicalAttention.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Doctor Type */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Recommended Healthcare Provider:</h3>
            <p className="text-sm text-red-700">{medicalAttention.doctorType}</p>
          </div>

          {/* Preparation Instructions */}
          {medicalAttention.preparationInstructions && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Before Your Visit:</h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {medicalAttention.preparationInstructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Immediate Actions */}
          {medicalAttention.immediateActions && (
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Take These Steps Now:</h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {medicalAttention.immediateActions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalAttentionSection; 