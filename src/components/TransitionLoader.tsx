import React from 'react';
import { Loader, Activity, Stethoscope, Pill } from 'lucide-react';

interface Props {
  type?: 'analysis' | 'questions' | 'recommendations' | 'default';
  message?: string;
}

const TransitionLoader: React.FC<Props> = ({ 
  type = 'default',
  message = 'Processing...'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'analysis':
        return <Activity className="h-8 w-8 text-blue-500 animate-pulse" />;
      case 'questions':
        return <Stethoscope className="h-8 w-8 text-green-500 animate-pulse" />;
      case 'recommendations':
        return <Pill className="h-8 w-8 text-purple-500 animate-pulse" />;
      default:
        return <Loader className="h-8 w-8 text-blue-500 animate-spin" />;
    }
  };

  const messages = {
    analysis: [
      "Analyzing your symptoms...",
      "Processing medical data...",
      "Evaluating condition...",
      "Almost there..."
    ],
    questions: [
      "Preparing relevant questions...",
      "Customizing assessment...",
      "Almost ready..."
    ],
    recommendations: [
      "Generating personalized recommendations...",
      "Analyzing treatment options...",
      "Preparing your care plan...",
      "Almost complete..."
    ],
    default: [
      "Processing...",
      "Please wait...",
      "Almost there..."
    ]
  };

  const [currentMessage, setCurrentMessage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => 
        (prev + 1) % messages[type].length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [type]);

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
      <div className="text-center space-y-4 p-8 rounded-xl bg-white shadow-lg border border-gray-100">
        <div className="flex justify-center">
          {getIcon()}
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {message || messages[type][currentMessage]}
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          This may take a few moments
        </p>
      </div>
    </div>
  );
};

export default TransitionLoader; 