import { useEffect, useState } from 'react';
import { Assessment, FollowUpQuestion, Recommendation } from '../types';
import { generateFollowUpQuestions, generateRecommendation } from '../utils/api';
import toast from 'react-hot-toast';

interface Props {
  assessment: Assessment;
  setAssessment: (assessment: Assessment) => void;
  setRecommendation: (recommendation: Recommendation | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

function FollowUpQuestions({ 
  assessment, 
  setAssessment, 
  setRecommendation,
  loading,
  setLoading
}: Props) {
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const fetchedQuestions = await generateFollowUpQuestions(assessment.userInfo);
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setAnswers(new Array(fetchedQuestions.length).fill(''));
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [assessment.userInfo, setLoading]);

  const handleNext = async () => {
    if (!answers[currentQuestionIndex]) {
      toast.error('Please provide an answer before continuing');
      return;
    }

    const updatedQuestions = questions.map((q, i) => ({
      ...q,
      response: answers[i]
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setLoading(true);
      const recommendation = await generateRecommendation(
        assessment.userInfo,
        updatedQuestions
      );
      setLoading(false);
      
      if (recommendation) {
        setRecommendation(recommendation);
      }
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <span className="text-sm text-gray-500">
          {Math.round((currentQuestionIndex / questions.length) * 100)}% Complete
        </span>
      </div>
      
      <p className="text-lg">{currentQuestion.question}</p>
      
      <textarea
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={3}
        placeholder="Type your answer here..."
        value={answers[currentQuestionIndex]}
        onChange={(e) => {
          const newAnswers = [...answers];
          newAnswers[currentQuestionIndex] = e.target.value;
          setAnswers(newAnswers);
        }}
      />

      <button
        onClick={handleNext}
        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Get Recommendation'}
      </button>
    </div>
  );
}

export default FollowUpQuestions; 