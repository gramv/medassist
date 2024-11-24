import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ConditionOverviewProps {
  condition: {
    name: string;
    commonName: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: {
      summary: string;
      mechanism: string;
      affectedArea: string;
      commonTriggers: string[];
      riskFactors: string[];
    };
    expectedDuration: {
      typical: string;
      untreated: string;
      factors: string[];
      recoveryPhases: {
        phase: string;
        duration: string;
        expectations: string;
      }[];
    };
    progression: {
      currentStage: string;
      naturalCourse: string;
      modifyingFactors: string[];
    };
  };
}

const ConditionOverview: React.FC<ConditionOverviewProps> = ({ condition }) => {
  const [expanded, setExpanded] = React.useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {condition.name}
          </h2>
          {condition.commonName && (
            <p className="text-sm text-gray-500 mt-1">
              Commonly known as: {condition.commonName}
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(condition.severity)}`}>
          {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)}
        </span>
      </div>

      {/* Basic Information */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {condition.description.summary}
        </p>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-blue-900">Expected Duration</h3>
          </div>
          <p className="text-sm text-blue-800">{condition.expectedDuration.typical}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-medium text-purple-900">Current Stage</h3>
          </div>
          <p className="text-sm text-purple-800">{condition.progression.currentStage}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="font-medium text-orange-900">Affected Area</h3>
          </div>
          <p className="text-sm text-orange-800">{condition.description.affectedArea}</p>
        </div>
      </div>

      {/* Expandable Detailed Information */}
      <div className="mt-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left text-gray-600 hover:text-gray-900"
        >
          <span className="font-medium">Detailed Information</span>
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-6">
            {/* Common Triggers */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Common Triggers</h3>
              <div className="grid grid-cols-2 gap-2">
                {condition.description.commonTriggers.map((trigger, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                    {trigger}
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery Phases */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recovery Timeline</h3>
              <div className="space-y-4">
                {condition.expectedDuration.recoveryPhases.map((phase, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-1">{phase.phase}</h4>
                    <p className="text-sm text-gray-600 mb-2">Duration: {phase.duration}</p>
                    <p className="text-sm text-gray-600">{phase.expectations}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Factors</h3>
              <div className="bg-red-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {condition.description.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionOverview; 