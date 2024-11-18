import { useState } from 'react';
import { Camera, Upload, X, AlertCircle, Loader } from 'lucide-react';
import { ImageAnalysisResult } from '../types';
import { analyzeImage } from '../utils/api';
import toast from 'react-hot-toast';

interface Props {
  onImageAnalyzed: (analysis: ImageAnalysisResult) => void;
  condition: string;
  loading: boolean;
}

function ImageAnalyzer({ onImageAnalyzed, condition, loading }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const maxSize = 4 * 1024 * 1024; // 4MB
      if (file.size > maxSize) {
        toast.error('Image size must be less than 4MB');
        return;
      }

      setAnalyzing(true);
      const base64 = await convertToBase64(file);
      setImage(base64);
      
      try {
        console.log('Starting image analysis...');
        const analysis = await analyzeImage(base64);
        console.log('Analysis complete:', analysis);
        onImageAnalyzed(analysis);
      } catch (error: any) {
        console.error('Analysis error:', error);
        toast.error('Failed to analyze image');
      }
      
      setAnalyzing(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Let's Take a Look at Your Condition
        </h2>
        <p className="text-gray-600">
          Upload a clear image to help us provide the most accurate assessment
        </p>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">For Best Results:</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• Use good lighting</li>
              <li>• Keep the image clear and focused</li>
              <li>• Show the entire affected area</li>
              <li>• Include something for size reference if possible</li>
              <li>• Ensure the area is clean and visible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Upload Area */}
      {!image ? (
        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
            <div className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center space-y-3">
                <Upload className="h-10 w-10 text-blue-500" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Share Your Concern</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click or drag an image to upload
                  </p>
                </div>
                <span className="text-xs text-gray-400">Maximum file size: 4MB</span>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={image} 
            alt="Medical condition" 
            className="w-full rounded-lg shadow-md"
          />
          {(analyzing || loading) ? (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-600 mt-2">Analyzing image...</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageAnalyzer; 