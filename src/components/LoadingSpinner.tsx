import { Loader } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <Loader className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );
}

export default LoadingSpinner; 