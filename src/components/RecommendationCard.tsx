import React from 'react';
import { AlertCircle } from 'lucide-react';

interface RecommendationCardProps {
  recommendations: string;
  severity: string;
}

const severityColors = {
  low: 'bg-green-50 text-green-800 border-green-200',
  medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  high: 'bg-red-50 text-red-800 border-red-200',
};

export default function RecommendationCard({ recommendations, severity }: RecommendationCardProps) {
  const severityColor = severityColors[severity as keyof typeof severityColors] || severityColors.medium;

  return (
    <div className="mt-8">
      <div className={`p-4 rounded-lg border ${severityColor} mb-4`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium capitalize">
            {severity} Priority
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-600">
            {recommendations}
          </pre>
        </div>
      </div>
    </div>
  );
}