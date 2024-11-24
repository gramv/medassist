import { useState, useEffect } from 'react';
import { Question } from '../types';
import { AlertTriangle, ArrowRight, CheckCircle, HelpCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  loading?: boolean;
}

function QuestionnaireForm({ questions, onSubmit, loading = false }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [severityScore, setSeverityScore] = useState(0);
  const [emergencyDetected, setEmergencyDetected] = useState(false);
  const [showEmergencyWarning, setShowEmergencyWarning] = useState(false);

  // Emergency keywords to watch for
  const emergencyKeywords = [
    'severe', 'extreme', 'unbearable', 'intense',
    'cannot breathe', 'chest pain', 'unconscious',
    'bleeding heavily', 'worst ever'
  ];

  // Calculate progress
  const progress = Math.round((currentQuestionIndex / questions.length) * 100);

  // Check for emergency conditions based on answer
  const checkForEmergency = (answer: string) => {
    const hasEmergencyKeyword = emergencyKeywords.some(keyword => 
      answer.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasEmergencyKeyword) {
      setEmergencyDetected(true);
      setShowEmergencyWarning(true);
    }

    // Update severity score
    const severityKeywords = {
      mild: 1,
      moderate: 2,
      severe: 3,
      extreme: 4
    };

    Object.entries(severityKeywords).forEach(([keyword, score]) => {
      if (answer.toLowerCase().includes(keyword)) {
        setSeverityScore(prev => Math.max(prev, score));
      }
    });
  };

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Store answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.question]: answer
    }));

    // Check for emergency conditions
    checkForEmergency(answer);

    // Move to next question or submit
    if (currentQuestionIndex === questions.length - 1) {
      // Last question - submit the questionnaire
      if (emergencyDetected) {
        toast.error('Please seek immediate medical attention!');
      }
      onSubmit(answers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Render severity indicator
  const renderSeverityIndicator = () => {
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm text-gray-500">Severity Level:</span>
        <div className="flex gap-1">
          {colors.map((color, i) => (
            <div 
              key={color}
              className={`w-2 h-6 rounded ${i <= severityScore - 1 ? color : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Processing your responses...</span>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        No questions available
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-blue-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {progress}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
          />
        </div>
      </div>

      {/* Emergency Warning */}
      {showEmergencyWarning && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <p className="ml-3 text-red-700">
              Your symptoms may require immediate medical attention.
              Please consider seeking emergency care.
            </p>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          {currentQuestion.question}
          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all
                ${
                  answers[currentQuestion.question] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {answers[currentQuestion.question] === option && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Severity Indicator */}
        {renderSeverityIndicator()}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => {
                if (answers[currentQuestion.question]) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                }
              }}
              disabled={!answers[currentQuestion.question]}
              className="flex items-center text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (answers[currentQuestion.question]) {
                  onSubmit(answers);
                }
              }}
              disabled={!answers[currentQuestion.question]}
              className="flex items-center text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              Submit
              <CheckCircle className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionnaireForm; 