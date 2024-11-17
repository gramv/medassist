import { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import AssessmentForm from './components/AssessmentForm';
import QuestionnaireForm from './components/QuestionnaireForm';
import RecommendationDisplay from './components/RecommendationDisplay';
import { UserInfo, Question, Recommendation } from './types';
import { generateFollowUpQuestions, generateRecommendation } from './utils/api';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const handleAssessmentSubmit = async (userInfo: UserInfo) => {
    try {
      setLoading(true);
      setCurrentUserInfo(userInfo);
      
      const generatedQuestions = await generateFollowUpQuestions(userInfo);
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setShowQuestionnaire(true);
      } else {
        toast.error('Failed to generate questions. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
    try {
      setLoading(true);
      if (!currentUserInfo) {
        throw new Error('User information not found');
      }

      const generatedRecommendation = await generateRecommendation(currentUserInfo, answers);
      if (generatedRecommendation) {
        setRecommendation(generatedRecommendation);
      } else {
        toast.error('Failed to generate recommendation');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setShowQuestionnaire(false);
    setQuestions([]);
    setCurrentUserInfo(null);
    setRecommendation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold text-blue-600">
                OTCMed Assist
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!started ? (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Get Over-the-Counter Medicine Recommendations
            </h1>
            <button
              onClick={() => setStarted(true)}
              className="inline-flex items-center justify-center px-8 py-3 
                       rounded-lg text-white bg-blue-600 hover:bg-blue-700 
                       font-medium transition-colors duration-200 shadow-sm"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {!showQuestionnaire ? (
                <AssessmentForm 
                  onSubmit={handleAssessmentSubmit}
                  loading={loading}
                />
              ) : recommendation ? (
                <RecommendationDisplay 
                  recommendation={recommendation}
                  onReset={handleReset}
                />
              ) : (
                <QuestionnaireForm 
                  questions={questions}
                  onComplete={handleQuestionnaireComplete}
                  loading={loading}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} OTCMed Assist. This tool is for informational purposes only. 
            Always consult with a healthcare professional before starting any medication.
          </p>
        </div>
      </footer>

      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;