import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import AssessmentForm from './components/AssessmentForm';
import QuestionnaireForm from './components/QuestionnaireForm';
import ImageAnalyzer from './components/ImageAnalyzer';
import ConditionMismatchPrompt from './components/ConditionMismatchPrompt';
import VisualAnalysisDisplay from './components/VisualAnalysisDisplay';
import RecommendationDisplay from './components/RecommendationDisplay';
import { 
  UserInfo, 
  Question, 
  FinalRecommendation,
  ImageAnalysisResult,
  DetailedAnalysis,
  AssessmentData
} from './types';
import { 
  checkConditionMatch, 
  generateFollowUpQuestions, 
  generateRecommendation,
  shouldRequestImage,
  generateDetailedAnalysis,
  mapTimeframe
} from './utils/api';
import Layout from './components/Layout';
import TransitionLoader from './components/TransitionLoader';

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const [showMismatchPrompt, setShowMismatchPrompt] = useState(false);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [recommendation, setRecommendation] = useState<FinalRecommendation | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [transition, setTransition] = useState<{
    loading: boolean;
    type: 'analysis' | 'questions' | 'recommendations' | 'default';
    message?: string;
  }>({
    loading: false,
    type: 'default'
  });

  const handleAssessmentSubmit = async (userInfo: UserInfo) => {
    try {
      setTransition({ loading: true, type: 'analysis', message: 'Analyzing your symptoms...' });
      setCurrentUserInfo(userInfo);
      
      // Initialize assessment data
      const newAssessmentData: AssessmentData = {
        userInfo,
        questionnaireAnswers: {}
      };
      setAssessmentData(newAssessmentData);

      console.log("Checking if image needed for:", userInfo.primaryIssue);
      const imageCheck = await shouldRequestImage(userInfo);
      console.log("Image check response:", imageCheck);  // Add this log to debug

      if (imageCheck && imageCheck.requiresImage) {
        setShowImageAnalyzer(true);
        toast.success(imageCheck.reason);
      } else {
        try {
          console.log("Generating questions without image");
          const generatedQuestions = await generateFollowUpQuestions(newAssessmentData);
          if (generatedQuestions && generatedQuestions.length > 0) {
            setQuestions(generatedQuestions);
            setShowQuestionnaire(true);
          } else {
            throw new Error('No questions generated');
          }
        } catch (error) {
          console.error('Failed to generate questions:', error);
          toast.error('Failed to generate follow-up questions. Please try again.');
        }
      }
    } catch (error) {
      console.error('Assessment submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setTransition({ loading: false, type: 'default' });
    }
  };

  const handleImageAnalysis = async (analysis: ImageAnalysisResult) => {
    try {
      setTransition({ loading: true, type: 'analysis', message: 'Processing image analysis...' });
      if (!currentUserInfo) {
        throw new Error('User info not found');
      }

      // Format the analysis for comparison
      const formattedAnalysis = {
        ...analysis,
        clinicalAssessment: {
          ...analysis.clinicalAssessment,
          primaryCondition: analysis.condition.type // Use condition.type instead
        }
      };

      console.log("Checking condition match for:", {
        reported: currentUserInfo.primaryIssue,
        detected: formattedAnalysis.condition.type
      });

      const matchResult = await checkConditionMatch(
        currentUserInfo.primaryIssue, 
        formattedAnalysis
      );

      if (matchResult.shouldShowMismatch) {
        setShowImageAnalyzer(false);
        setImageAnalysis(analysis);
        setShowMismatchPrompt(true);
      } else {
        try {
          console.log("Generating detailed analysis...");
          const detailed = await generateDetailedAnalysis(analysis);
          console.log("Detailed analysis generated:", detailed);
          
          setDetailedAnalysis(detailed);
          setImageAnalysis(analysis);
          setShowImageAnalyzer(false);
          setShowAnalysisResults(true);
        } catch (error) {
          console.error('Failed to generate detailed analysis:', error);
          toast.error('Failed to analyze image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      toast.error('Failed to process image analysis');
    } finally {
      setTransition({ loading: false, type: 'default' });
    }
  };

  const handleContinueWithImage = async () => {
    try {
      setLoading(true);
      if (!imageAnalysis || !currentUserInfo || !assessmentData) return;

      // Update user info with detected condition
      const updatedUserInfo = {
        ...currentUserInfo,
        primaryIssue: imageAnalysis.clinicalAssessment.primaryCondition
      };
      setCurrentUserInfo(updatedUserInfo);

      // Generate detailed analysis
      const detailedResults = await generateDetailedAnalysis(imageAnalysis);
      console.log('Detailed analysis generated:', detailedResults);
      setDetailedAnalysis(detailedResults);

      // Update assessment data
      const updatedAssessmentData = {
        ...assessmentData,
        userInfo: updatedUserInfo,
        imageAnalysis: imageAnalysis,
        detailedAnalysis: detailedResults
      };
      setAssessmentData(updatedAssessmentData);

      // Generate questions
      console.log('Generating questions...');
      const generatedQuestions = await generateFollowUpQuestions(updatedAssessmentData);
      console.log('Generated questions:', generatedQuestions);
      
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('No questions generated');
      }

      setQuestions(generatedQuestions);
      setShowMismatchPrompt(false);
      setShowQuestionnaire(true);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate analysis');
    } finally {
      setLoading(false);
      }
    };

    const handleContinueWithReported = async () => {
      try {
        setLoading(true);
        if (!currentUserInfo || !assessmentData) return;

        const generatedQuestions = await generateFollowUpQuestions({
          ...assessmentData,
          userInfo: currentUserInfo
        });

        if (generatedQuestions && generatedQuestions.length > 0) {
          setQuestions(generatedQuestions);
          setShowMismatchPrompt(false);
          setShowQuestionnaire(true);
        } else {
          throw new Error('No questions generated');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to generate questions');
      } finally {
        setLoading(false);
      }
    };

    const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
      try {
        setTransition({ 
          loading: true, 
          type: 'recommendations', 
          message: 'Generating personalized recommendations...' 
        });
        if (!assessmentData) {
          throw new Error('Assessment data not found');
        }

        // Update assessment data with answers
        const updatedAssessmentData = {
          ...assessmentData,
          questionnaireAnswers: answers
        };
        setAssessmentData(updatedAssessmentData);

        // Generate recommendation
        console.log('Generating recommendation with data:', updatedAssessmentData);
        const generatedRecommendation = await generateRecommendation(updatedAssessmentData);
        console.log('Generated recommendation:', generatedRecommendation);

        if (generatedRecommendation) {
          setRecommendation(generatedRecommendation);
          setShowQuestionnaire(false); // Hide questionnaire
          console.log('Setting recommendation:', generatedRecommendation);
        } else {
          throw new Error('No recommendation generated');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to generate recommendation');
      } finally {
        setTransition({ loading: false, type: 'default' });
      }
    };

    const handleReset = () => {
      setStarted(false);
      setShowQuestionnaire(false);
      setShowImageAnalyzer(false);
      setShowMismatchPrompt(false);
      setShowAnalysisResults(false);
      setQuestions([]);
      setCurrentUserInfo(null);
      setRecommendation(null);
      setImageAnalysis(null);
      setDetailedAnalysis(null);
      setAssessmentData(null);
    };

    const handleAnalysisContinue = () => {
      console.log('Analysis continue clicked, questions:', questions);
      if (questions && questions.length > 0) {
        setShowAnalysisResults(false);
        setShowQuestionnaire(true);
      } else {
        // If no questions, generate them first
        handleContinueWithImage().then(() => {
          setShowAnalysisResults(false);
          setShowQuestionnaire(true);
        }).catch(error => {
          console.error('Failed to generate questions:', error);
          toast.error('Failed to load questions. Please try again.');
        });
      }
    };

    const renderContent = () => {
      if (!started) {
        return (
          <Layout>
            {/* Landing Page Content */}
            <div className="text-center space-y-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to Your Health Assistant
              </h1>
              <p className="text-xl text-gray-600">
                Get personalized health guidance and recommendations
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="inline-block p-3 bg-blue-50 rounded-lg mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Visual Analysis
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced AI analysis of medical conditions through image processing
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="inline-block p-3 bg-blue-50 rounded-lg mb-4">
                    <span className="text-2xl">💊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Treatment Recommendations
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Personalized medication and care suggestions based on your condition
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="inline-block p-3 bg-blue-50 rounded-lg mb-4">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Medical Guidance
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Clear advice on whether professional medical attention is needed
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="inline-block p-3 bg-blue-50 rounded-lg mb-4">
                    <span className="text-2xl">🌿</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Alternative Treatments
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Natural remedies and lifestyle recommendations for your condition
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Start Health Assessment
                <Heart className="ml-2 h-5 w-5" />
              </button>
            </div>
          </Layout>
        );
      }

      return (
        <Layout onReset={handleReset}>
          {!showQuestionnaire && !showImageAnalyzer && !showMismatchPrompt && 
           !showAnalysisResults && !recommendation ? (
            <AssessmentForm 
              onSubmit={handleAssessmentSubmit}
              loading={loading}
            />
          ) : showImageAnalyzer ? (
            <ImageAnalyzer 
              onImageAnalyzed={handleImageAnalysis}
              onSkipImage={async () => {
                try {
                  setLoading(true);
                  if (!currentUserInfo || !assessmentData) return;

                  const generatedQuestions = await generateFollowUpQuestions({
                    ...assessmentData,
                    userInfo: currentUserInfo
                  });

                  if (generatedQuestions && generatedQuestions.length > 0) {
                    setQuestions(generatedQuestions);
                    setShowImageAnalyzer(false);
                    setShowQuestionnaire(true);
                  } else {
                    throw new Error('No questions generated');
                  }
                } catch (error) {
                  console.error('Error:', error);
                  toast.error('Failed to generate questions');
                } finally {
                  setLoading(false);
                }
              }}
              condition={currentUserInfo?.primaryIssue || ''}
              loading={loading}
              userInfo={currentUserInfo}
            />
          ) : showMismatchPrompt && imageAnalysis ? (
            <ConditionMismatchPrompt 
              reportedCondition={currentUserInfo?.primaryIssue || ''}
              imageAnalysis={imageAnalysis}
              onContinueWithImage={handleContinueWithImage}
              onContinueWithReported={handleContinueWithReported}
            />
          ) : showAnalysisResults && detailedAnalysis ? (
            <VisualAnalysisDisplay
              analysis={detailedAnalysis}
              onContinue={handleAnalysisContinue}
            />
          ) : showQuestionnaire ? (
            <QuestionnaireForm
              questions={questions}
              onSubmit={handleQuestionnaireComplete}
              loading={loading}
            />
          ) : recommendation ? (
            <RecommendationDisplay
              recommendation={recommendation}
              onReset={handleReset}
            />
          ) : null}
        </Layout>
      );
    };

    return (
      <>
        {transition.loading && (
          <TransitionLoader 
            type={transition.type}
            message={transition.message}
          />
        )}
        
        {renderContent()}
        <Toaster position="top-center" />
      </>
    );
  }

  export default App;