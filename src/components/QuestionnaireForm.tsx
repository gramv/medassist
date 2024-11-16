import { useState } from 'react';
import { Question } from '../types';
import { Loader } from 'lucide-react';

interface Props {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  loading: boolean;
}

function QuestionnaireForm({ questions, onComplete, loading }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (loading || questions.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer
    };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const cleanQuestionText = (text: string) => {
    return text.split('(A)')[0].trim();
  };

  const getOptions = (question: Question) => {
    if (question.options.length > 0 && question.options[0].includes('(A)')) {
      return question.options[0].split(', ').map(opt => {
        const match = opt.match(/\([A-D]\)\s*(.*?)(?=(?:\([A-D]\)|$))/);
        return match ? match[1].trim() : opt.trim();
      });
    }
    return question.options;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {cleanQuestionText(currentQuestion.question)}
        </h3>
        <div className="space-y-3">
          {getOptions(currentQuestion).map((option: string, index: number) => (
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

export default QuestionnaireForm; 