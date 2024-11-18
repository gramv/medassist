import { useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';

interface Props {
  onImageAnalyzed: (analysis: any) => void;
}

function ImageUploader({ onImageAnalyzed }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setAnalyzing(true);
      const base64 = await convertToBase64(file);
      const analysis = await analyzeSymptomImage(base64, userInfo);
      onImageAnalyzed(analysis);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {!image ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Upload an image of your symptom</p>
            </label>
          </div>
        ) : (
          <div className="relative">
            <img src={image} alt="Symptom" className="max-h-64 rounded-lg" />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 