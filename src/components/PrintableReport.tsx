import React from 'react';
import { ComprehensiveRecommendation } from '../types';

interface Props {
  recommendation: ComprehensiveRecommendation;
}

const PrintableReport: React.FC<Props> = ({ recommendation }) => {
  console.log('Print Report - Received recommendation:', recommendation);

  if (!recommendation || !recommendation.condition) {
    return (
      <div className="print-content p-4">
        <p>Unable to generate report. Missing data.</p>
      </div>
    );
  }

  return (
    <div className="print-content p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">OTC Medical Recommendation Report</h1>
        <p className="text-sm text-gray-600 mt-2">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Condition Overview */}
      <div className="mb-6 print-section">
        <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-2 mb-3">Condition Assessment</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p><strong>Condition:</strong> {recommendation.condition.name}</p>
            <p><strong>Severity:</strong> {recommendation.condition.severity}</p>
            <p><strong>Expected Duration:</strong> {recommendation.condition.expectedDuration}</p>
            <p className="mt-2">{recommendation.condition.description}</p>
          </div>
        </div>
      </div>

      {/* Primary Treatment */}
      {recommendation.medications?.primary && (
        <div className="mb-6 print-section">
          <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-2 mb-3">Recommended Treatment</h2>
          <div>
            <h3 className="font-semibold text-lg mb-2">Primary Medication</h3>
            <div className="pl-4">
              <p><strong>Medication:</strong> {recommendation.medications.primary.name}</p>
              <p><strong>Active Ingredient:</strong> {recommendation.medications.primary.activeIngredient}</p>
              <p><strong>Form:</strong> {recommendation.medications.primary.dosageForm}</p>
              
              <div className="mt-2">
                <p className="font-medium">Dosage Instructions:</p>
                <ul className="list-disc ml-6">
                  <li>Amount: {recommendation.medications.primary.typicalDosage.amount}</li>
                  <li>Frequency: {recommendation.medications.primary.typicalDosage.frequency}</li>
                  <li>Duration: {recommendation.medications.primary.typicalDosage.duration}</li>
                </ul>
              </div>

              {recommendation.medications.primary.brands && (
                <div className="mt-4">
                  <p className="font-medium">Available Brands:</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {recommendation.medications.primary.brands.map((brand, idx) => (
                      <div key={idx} className="border p-2 rounded">
                        <p><strong>{brand.name}</strong></p>
                        <p>{brand.form}, {brand.strength}</p>
                        <p>Price: {brand.priceRange.min}-{brand.priceRange.max} {brand.priceRange.currency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warning Signs */}
      {recommendation.emergencyGuidelines && (
        <div className="mb-6 print-section">
          <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-2 mb-3">Important Warnings</h2>
          <div className="grid grid-cols-2 gap-4">
            {recommendation.emergencyGuidelines.warningSymptoms.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Warning Signs</h3>
                <ul className="list-disc ml-6">
                  {recommendation.emergencyGuidelines.warningSymptoms.map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prevention Guidelines */}
      {recommendation.prevention && (
        <div className="mb-6 print-section">
          <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-2 mb-3">Prevention Guidelines</h2>
          <div className="grid grid-cols-2 gap-4">
            {recommendation.prevention.shortTerm.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Short-term Prevention</h3>
                <ul className="list-disc ml-6">
                  {recommendation.prevention.shortTerm.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.prevention.longTerm.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Long-term Prevention</h3>
                <ul className="list-disc ml-6">
                  {recommendation.prevention.longTerm.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 pt-4 border-t text-xs text-gray-500">
        <p className="font-bold mb-1">Important Notice:</p>
        <p>This report is generated for informational purposes only and does not constitute professional medical advice. 
           Please consult with a qualified healthcare provider for proper medical evaluation and treatment.</p>
        <p className="mt-2">Generated by OTC Med Recommendation System</p>
      </div>
    </div>
  );
};

export default PrintableReport; 