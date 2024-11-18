import { useState } from 'react';
import { Question } from '../types';
import { Loader } from 'lucide-react';

interface Props {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  loading: boolean;
}

function QuestionnaireForm({ questions, onSubmit, loading }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (answer: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestionIndex].question]: answer
    };
    setAnswers(newAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      // If this was the last question, submit all answers
      onSubmit(newAnswers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Follow-up Questions
        </h2>
        <p className="text-gray-600">
          Please answer these questions to help us provide better recommendations
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={loading}
              className={`w-full text-left p-4 rounded-lg border transition-colors
                ${loading 
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-blue-50 hover:border-blue-200 active:bg-blue-100'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center mt-6">
            <Loader className="h-6 w-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-blue-600">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionnaireForm; 