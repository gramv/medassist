import { type FC } from 'react';
import { Toaster } from 'react-hot-toast';
import { Heart } from 'lucide-react';
import SymptomChecker from './components/SymptomChecker';

const App: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Heart className="w-8 h-8 text-red-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                OptiMed Assist
              </h1>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-2 text-gray-900">
          Smart Medication Assistant
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Your trusted companion for safe and personalized over-the-counter medication guidance
        </p>
        <div className="max-w-2xl mx-auto">
          <SymptomChecker />
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
};

export default App;