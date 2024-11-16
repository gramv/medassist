import { type FC, useState } from 'react';
import { ChevronRight, AlertCircle, X } from 'lucide-react';
import type { SymptomAssessment } from '../types/medical';

interface Props {
  onSubmit: (assessment: SymptomAssessment) => void;
}

const SymptomAssessmentForm: FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    age: '',
    ageMonths: '',
    showMonths: false,
    gender: '',
    symptoms: '',
    severity: '5',
    duration: '',
    hasMedications: 'no',
    medications: '',
    hasAllergies: 'no',
    allergies: '',
  });

  const [showMedicationsModal, setShowMedicationsModal] = useState(false);
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assessment: SymptomAssessment = {
      category: determineCategory(formData.symptoms),
      primarySymptom: formData.symptoms,
      severity: determineSeverity(formData.severity),
      duration: determineDuration(formData.duration),
      gender: formData.gender as any,
      age: parseInt(formData.age),
      additionalSymptoms: [],
      currentMedications: formData.hasMedications === 'yes' ? formData.medications : undefined,
      allergies: formData.hasAllergies === 'yes' ? formData.allergies : undefined,
    };

    onSubmit(assessment);
  };

  // Helper functions to map user-friendly inputs to required formats
  const determineSeverity = (severity: string): 'mild' | 'moderate' | 'severe' => {
    const painLevel = parseInt(severity);
    if (painLevel <= 3) return 'mild';
    if (painLevel <= 7) return 'moderate';
    return 'severe';
  };

  const determineDuration = (duration: string): 'just_started' | 'few_hours' | 'one_day' | 'few_days' | 'week_plus' => {
    const hours = parseInt(duration);
    if (hours <= 2) return 'just_started';
    if (hours <= 24) return 'few_hours';
    if (hours <= 48) return 'one_day';
    if (hours <= 168) return 'few_days';
    return 'week_plus';
  };

  const determineCategory = (symptoms: string): 'pain' | 'respiratory' | 'digestive' | 'skin' | 'allergies' | 'fever' | 'other' => {
    const symptomLower = symptoms.toLowerCase();
    if (symptomLower.includes('pain') || symptomLower.includes('ache')) return 'pain';
    if (symptomLower.includes('cough') || symptomLower.includes('breath')) return 'respiratory';
    if (symptomLower.includes('stomach') || symptomLower.includes('nausea')) return 'digestive';
    if (symptomLower.includes('skin') || symptomLower.includes('rash')) return 'skin';
    if (symptomLower.includes('allerg')) return 'allergies';
    if (symptomLower.includes('fever') || symptomLower.includes('temperature')) return 'fever';
    return 'other';
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value;
    setFormData(prev => ({
      ...prev,
      age,
      showMonths: age !== '' && parseInt(age) <= 4,
      ageMonths: age !== '' && parseInt(age) <= 4 ? prev.ageMonths : ''
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
        <h3 className="text-xl font-semibold">Symptom Assessment</h3>
        <p className="text-sm opacity-90 mt-1">Please provide your information for recommendations</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  id="age"
                  min="0"
                  max="120"
                  required
                  value={formData.age}
                  onChange={handleAgeChange}
                  className="w-24 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Age"
                />
                <span className="text-gray-600">years</span>
              </div>
              
              {formData.showMonths && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    id="ageMonths"
                    min="0"
                    max="11"
                    required
                    value={formData.ageMonths}
                    onChange={e => setFormData(prev => ({ ...prev, ageMonths: e.target.value }))}
                    className="w-24 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Months"
                  />
                  <span className="text-gray-600">months</span>
                </div>
              )}
              
              {formData.showMonths && (
                <p className="text-sm text-blue-600">
                  For children under 4, please specify months for more accurate recommendations
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                <label
                  key={option}
                  className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                    formData.gender === option
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="sr-only"
                    required
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Symptoms Section */}
        <div className="space-y-2">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
            What's bothering you today?
          </label>
          <textarea
            id="symptoms"
            required
            value={formData.symptoms}
            onChange={e => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Describe your symptoms in detail..."
          />
        </div>

        {/* Severity Section */}
        <div className="space-y-2">
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            How severe are your symptoms? (1-10)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="severity"
              min="1"
              max="10"
              required
              value={formData.severity}
              onChange={e => setFormData(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full"
            />
            <span className="w-12 text-center font-medium text-gray-700">{formData.severity}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Mild</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Duration Section */}
        <div className="space-y-2">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            How long have you had these symptoms?
          </label>
          <select
            id="duration"
            required
            value={formData.duration}
            onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select duration</option>
            <option value="2">Just started (last couple hours)</option>
            <option value="12">Several hours</option>
            <option value="24">About a day</option>
            <option value="72">Few days</option>
            <option value="168">A week or more</option>
          </select>
        </div>

        {/* Medical Information Section */}
        <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Are you taking any medications?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasMedications"
                  value="no"
                  checked={formData.hasMedications === 'no'}
                  onChange={e => setFormData(prev => ({ ...prev, hasMedications: e.target.value }))}
                  className="mr-2"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasMedications"
                  value="yes"
                  checked={formData.hasMedications === 'yes'}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, hasMedications: e.target.value }));
                    setShowMedicationsModal(true);
                  }}
                  className="mr-2"
                />
                Yes
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Any allergies to medications?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasAllergies"
                  value="no"
                  checked={formData.hasAllergies === 'no'}
                  onChange={e => setFormData(prev => ({ ...prev, hasAllergies: e.target.value }))}
                  className="mr-2"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasAllergies"
                  value="yes"
                  checked={formData.hasAllergies === 'yes'}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, hasAllergies: e.target.value }));
                    setShowAllergiesModal(true);
                  }}
                  className="mr-2"
                />
                Yes
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Get Recommendations
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Modals */}
      {showMedicationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
              <button onClick={() => setShowMedicationsModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={formData.medications}
                onChange={e => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="List all medications you are currently taking..."
              />
              <button
                onClick={() => setShowMedicationsModal(false)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllergiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Medication Allergies</h3>
              <button onClick={() => setShowAllergiesModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={formData.allergies}
                onChange={e => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="List any known allergies to medications..."
              />
              <button
                onClick={() => setShowAllergiesModal(false)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            This tool provides general recommendations only. Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SymptomAssessmentForm; 