import { Heart } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

function Layout({ children, onReset }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Logo Header */}
      <div 
        onClick={onReset}
        className="fixed top-4 left-4 cursor-pointer"
      >
        <div className="flex items-center">
          <span className="text-xl font-semibold text-blue-600">OTCMed</span>
          <Heart className="h-5 w-5 ml-1 text-blue-600" />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
          <p className="font-medium mb-1">Important Medical Disclaimer</p>
          <p>
            This tool provides general guidance only and is not a substitute for professional medical advice. 
            Always consult a healthcare provider for medical conditions. In case of emergency, contact emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Layout; 