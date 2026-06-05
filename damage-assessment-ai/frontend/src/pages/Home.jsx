import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeImage } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await analyzeImage(formData);
      
      if (result.success) {
        // Store result in sessionStorage for Results page
        sessionStorage.setItem('analysisResult', JSON.stringify(result));
        navigate('/results');
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.error || 'Error analyzing image. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏢 Building Damage Assessment AI
          </h1>
          <p className="text-gray-600">
            AI-powered analysis of post-disaster building damage
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Features */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Features
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Upload Image</h3>
                  <p className="text-gray-600 text-sm">
                    Select a photo of a damaged building
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">AI Detection</h3>
                  <p className="text-gray-600 text-sm">
                    YOLO detects buildings in the image
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Damage Assessment</h3>
                  <p className="text-gray-600 text-sm">
                    ResNet50 classifies damage level
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Results & Recommendations</h3>
                  <p className="text-gray-600 text-sm">
                    Get detailed damage assessment and next steps
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-800">
                <strong>Damage Levels:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>🔴 <strong>Destroyed</strong> - Immediate demolition assessment</li>
                <li>🟠 <strong>Major Damage</strong> - Structural inspection required</li>
                <li>🟡 <strong>Minor Damage</strong> - Repair and monitoring</li>
                <li>🟢 <strong>No Damage</strong> - No intervention required</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Upload Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Analyze Building Damage
            </h2>

            <form onSubmit={handleSubmit}>
              {/* File Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Upload Building Image
                </label>
                
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {preview ? (
                    <div className="space-y-4">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-gray-600 font-medium">
                        {file?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📸</div>
                      <p className="text-gray-700 font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm">
                        PNG, JPG, BMP (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Analyzing...
                    </span>
                  ) : (
                    '🚀 Analyze Building'
                  )}
                </button>

                {file && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                All images are processed locally. No data is stored.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
