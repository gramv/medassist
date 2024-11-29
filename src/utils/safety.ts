import { AssessmentData, Severity, MedicalUrgency } from '../types';

interface SafetyCheck {
  isSevere: boolean;
  requiresImmediate: boolean;
  canSuggestOTC: boolean;
  canProvidePainRelief: boolean;
  reasons: string[];
  recommendedTimeframe: string;
  warningSymptoms: string[];
}

export async function performSafetyCheck(condition: string, symptoms: string[]): Promise<SafetyCheck> {
  const severeConditions = new Set([
    'chest pain', 'difficulty breathing', 'severe pain',
    'head injury', 'stroke', 'seizure', 'heart attack',
    'severe allergic reaction', 'anaphylaxis', 'severe bleeding',
    'loss of consciousness', 'suspected fracture', 'severe burns',
    'poisoning', 'overdose'
  ]);

  const requiresImmediateAttention = symptoms.some(s => 
    s.includes('severe') || 
    s.includes('intense') || 
    s.includes('extreme') ||
    severeConditions.has(s.toLowerCase())
  );

  const canProvidePainRelief = !symptoms.some(s =>
    s.includes('head injury') ||
    s.includes('internal bleeding') ||
    s.includes('stomach pain') ||
    s.includes('appendicitis')
  );

  return {
    isSevere: requiresImmediateAttention,
    requiresImmediate: requiresImmediateAttention,
    canSuggestOTC: !requiresImmediateAttention,
    canProvidePainRelief,
    reasons: requiresImmediateAttention ? 
      ['Condition requires immediate medical attention'] : 
      ['Condition may be suitable for initial OTC treatment'],
    recommendedTimeframe: requiresImmediateAttention ? 'immediate' : 'within_24_hours',
    warningSymptoms: [
      'Severe or worsening pain',
      'Difficulty breathing',
      'Changes in consciousness',
      'Spreading of symptoms',
      'High fever'
    ]
  };
}

export function formatPainReliefWarning(canProvidePainRelief: boolean): string {
  if (!canProvidePainRelief) {
    return 'DO NOT take pain medication as it may mask important symptoms. Seek immediate medical attention.';
  }
  return 'For temporary pain relief only while seeking medical care. Do not exceed recommended dosage.';
}

export function getEmergencyGuidelines(severity: Severity): string[] {
  const guidelines = [
    'Call emergency services immediately if condition worsens',
    'Document all symptoms and their timeline',
    'Do not eat or drink anything until evaluated by a medical professional',
    'Have someone stay with you until medical help arrives'
  ];

  if (severity === 'severe') {
    guidelines.unshift('Seek immediate emergency care');
  }

  return guidelines;
}

export function validateMedicationSafety(
  condition: string,
  recommendedMed: string,
  userAge: number
): boolean {
  const highRiskConditions = new Set([
    'head injury',
    'internal bleeding',
    'stroke symptoms',
    'severe abdominal pain'
  ]);

  const isHighRisk = [...highRiskConditions].some(c => 
    condition.toLowerCase().includes(c)
  );

  return !isHighRisk;
}