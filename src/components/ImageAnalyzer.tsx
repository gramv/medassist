// In components/ImageAnalyzer.tsx

import { useState, useCallback } from 'react';
import { Camera, Upload, X, AlertCircle, Loader, Image as ImageIcon, ZoomIn, ArrowRight } from 'lucide-react';
import { EnhancedImageAnalysis } from '../types';
import { analyzeImage } from '../utils/api';
import toast from 'react-hot-toast';

interface Props {
  onImageAnalyzed: (analysis: EnhancedImageAnalysis) => void;
  onSkipImage?: () => void;
  condition: string;
  loading?: boolean;
  userInfo?: UserInfo;
}

function ImageAnalyzer({ onImageAnalyzed, onSkipImage, condition, loading = false, userInfo }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageQualityIssue, setImageQualityIssue] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    try {
      console.log("Starting image upload process for file:", file.name, file.type, file.size);
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        console.error("Invalid file type:", file.type);
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        console.error("File too large:", file.size);
        return;
      }

      // Validate image quality
      console.log("Starting image validation...");
      const isValid = await validateImage(file);
      console.log("Image validation result:", isValid);
      
      if (!isValid) {
        console.log("Image validation failed");
        return;
      }

      setAnalyzing(true);
      console.log("Starting image compression...");
      const compressedImage = await compressImage(file);
      console.log("Image compressed successfully");
      
      setImage(compressedImage);
      setPreviewUrl(URL.createObjectURL(file));

      try {
        console.log("Starting image analysis with user info:", userInfo);
        const analysis = await analyzeImage(compressedImage, userInfo);
        console.log("Image analysis completed:", analysis);
        onImageAnalyzed(analysis);
      } catch (error: any) {
        console.error('Analysis error:', error);
        toast.error('Failed to analyze image. Please try again.');
        setImage(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process image');
    } finally {
      setAnalyzing(false);
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log("Starting image validation for file:", file.name);
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      console.log("Created object URL for validation:", objectUrl);
      
      img.onload = () => {
        console.log("Image loaded for validation", {
          width: img.width,
          height: img.height,
          size: file.size
        });

        // Cleanup
        URL.revokeObjectURL(objectUrl);

        // Check file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          console.log("File too large:", file.size);
          setImageQualityIssue('Image size must be less than 5MB');
          resolve(false);
          return;
        }

        // Check minimum dimensions (more lenient)
        if (img.width < 100 || img.height < 100) {
          console.log("Image too small", { width: img.width, height: img.height });
          setImageQualityIssue('Image is too small. Please provide a larger image.');
          resolve(false);
          return;
        }

        // Check maximum dimensions
        if (img.width > 4096 || img.height > 4096) {
          console.log("Image too large", { width: img.width, height: img.height });
          setImageQualityIssue('Image dimensions are too large. Please provide a smaller image.');
          resolve(false);
          return;
        }

        // Check aspect ratio
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 5 || aspectRatio < 0.2) {
          console.log("Invalid aspect ratio:", aspectRatio);
          setImageQualityIssue('Image has unusual dimensions. Please provide a more standard image.');
          resolve(false);
          return;
        }

        // Basic format validation
        const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validFormats.includes(file.type)) {
          console.log("Invalid format:", file.type);
          setImageQualityIssue('Please upload a JPEG, PNG, or WebP image.');
          resolve(false);
          return;
        }

        // All checks passed
        console.log("Image validation passed");
        setImageQualityIssue(null);
        resolve(true);
      };

      img.onerror = (error) => {
        console.error("Error loading image for validation:", error);
        URL.revokeObjectURL(objectUrl);
        setImageQualityIssue('Unable to process image. Please try another.');
        resolve(false);
      };

      img.src = objectUrl;
    });
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Image Upload Guidelines */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Show Us Your Concern
          </h2>
          {onSkipImage && (
            <button
              onClick={onSkipImage}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip Image Upload
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-gray-600">For best results:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Use good lighting</li>
              <li>• Keep the image clear and focused</li>
              <li>• Show the entire affected area</li>
              <li>• Include something for size reference if possible</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Image requirements:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Maximum size: 5MB</li>
              <li>• Minimum resolution: 200x200</li>
              <li>• Supported formats: JPG, PNG</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              console.log("File input change event triggered");
              const files = e.target.files;
              console.log("Files selected:", files?.length);
              if (files?.[0]) {
                console.log("Handling file:", files[0].name);
                handleImageUpload(files[0]);
              }
            }}
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`
              block cursor-pointer border-2 border-dashed rounded-xl p-8
              ${imageQualityIssue 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              } transition-colors
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  Upload an Image
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Click or drag and drop
                </p>
              </div>
              {imageQualityIssue && (
                <p className="text-sm text-red-600 mt-2">
                  {imageQualityIssue}
                </p>
              )}
            </div>
          </label>
          
          {onSkipImage && (
            <div className="mt-4 text-center">
              <button
                onClick={onSkipImage}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Continue without image
              </button>
              <p className="text-xs text-gray-400 mt-1">
                Note: Visual assessment helps provide more accurate recommendations
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain"
              />
            )}
            {analyzing && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                  <span className="text-blue-600 font-medium">
                    Analyzing image...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setImage(null);
              setPreviewUrl(null);
              setImageQualityIssue(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Upload a different image
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageAnalyzer;