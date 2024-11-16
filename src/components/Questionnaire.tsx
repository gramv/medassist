import { useState } from 'react';
import { FollowUpQuestion } from '../types';
import { Loader } from 'lucide-react';

interface Props {
  questions: FollowUpQuestion[];
  onComplete: (answers: Record<string, string>) => void;
  loading: boolean;
}

function Questionnaire({ questions, onComplete, loading }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = {
      ...answers,
      [currentQuestion.question]: answer
    };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {currentQuestion.question}
        </h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full p-4 text-left rounded-lg border border-gray-300 
                       hover:border-blue-500 hover:bg-blue-50 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Questionnaire; 