import React, { useState } from 'react';
import { Pill, DollarSign, AlertTriangle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { DrugRecommendation } from '../types';

interface Props {
  primary: DrugRecommendation;
  alternatives: DrugRecommendation[];
}

const PrimaryMedicationsSection: React.FC<Props> = ({ primary, alternatives }) => {
  const [expandedMedication, setExpandedMedication] = useState<string | null>(primary.name);

  const renderEffectivenessStars = (effectiveness: number, evidence?: string) => (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < effectiveness 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {evidence && (
        <span className="text-sm text-gray-500">
          ({evidence})
        </span>
      )}
    </div>
  );

  const renderMedicationCard = (medication: DrugRecommendation) => {
    const isExpanded = expandedMedication === medication.name;

    const warnings = {
      precautions: medication.warnings?.precautions || 
                   medication.sideEffects?.warnings || // fallback to sideEffects.warnings
                   [],
      interactions: medication.warnings?.interactions || [],
      contraindications: medication.warnings?.contraindications || []
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {medication.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {medication.activeIngredient}
              </p>
            </div>
            {medication.isMainRecommendation && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Primary Recommendation
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Form: {medication.dosageForm}
              </p>
              {renderEffectivenessStars(medication.effectiveness)}
            </div>
            <button
              onClick={() => setExpandedMedication(isExpanded ? null : medication.name)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            {/* Dosage Information */}
            <div className="p-6 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-4">Dosage Instructions</h4>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Amount:</span> {medication.typicalDosage.amount}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Frequency:</span> {medication.typicalDosage.frequency}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Duration:</span> {medication.typicalDosage.duration}
                </p>
                {medication.typicalDosage.specialInstructions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">Special Instructions:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {medication.typicalDosage.specialInstructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Available Brands */}
            <div className="p-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Available Brands</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medication.brands.map((brand, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="font-medium text-gray-900">{brand.name}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">{brand.form}, {brand.strength}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>
                          {brand.priceRange.min.toFixed(2)} - {brand.priceRange.max.toFixed(2)} {brand.priceRange.currency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Availability: {brand.availability}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Effects & Warnings */}
            <div className="p-6 border-t border-gray-200 bg-red-50">
              <h4 className="font-medium text-red-900 mb-4">Side Effects & Warnings</h4>
              <div className="space-y-4">
                {medication.sideEffects.common.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-800">Common Side Effects:</p>
                    <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                      {medication.sideEffects.common.map((effect, idx) => (
                        <li key={idx}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {medication.sideEffects.rare.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-800">Rare but Serious Side Effects:</p>
                    <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                      {medication.sideEffects.rare.map((effect, idx) => (
                        <li key={idx}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {warnings.precautions.length > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm font-medium text-red-800">Important Precautions:</p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {warnings.precautions.map((precaution, idx) => (
                        <li key={idx}>{precaution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Medication */}
      {renderMedicationCard(primary)}

      {/* Alternative Medications */}
      {alternatives.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Alternative Options
          </h3>
          <div className="space-y-4">
            {alternatives.map((medication, idx) => renderMedicationCard(medication))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimaryMedicationsSection; 