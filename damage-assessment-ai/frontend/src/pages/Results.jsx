import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get result from sessionStorage
    const storedResult = sessionStorage.getItem('analysisResult');
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch (error) {
        console.error('Error parsing result:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-700">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-800">Results</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-6">No analysis results found.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              ← Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  const getDamageColor = (level) => {
    switch (level) {
      case 'Destroyed':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'Major Damage':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'Minor Damage':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'No Damage':
        return 'bg-green-100 border-green-500 text-green-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getDamageEmoji = (level) => {
    switch (level) {
      case 'Destroyed':
        return '🔴';
      case 'Major Damage':
        return '🟠';
      case 'Minor Damage':
        return '🟡';
      case 'No Damage':
        return '🟢';
      default:
        return '❓';
    }
  };

  const formattedConfidence = result.confidence != null ? Number(result.confidence).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Assessment Results
              </h1>
              <p className="text-gray-600">
                Building damage analysis report
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              ← New Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div className="space-y-6">
            {/* Annotated Result Image */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🖼️</span> Detection & Analysis
                </h2>
                <div className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/30 shadow-sm">
                  <span className="font-bold">{result.buildings_detected}</span> <span className="text-sm opacity-90">Buildings</span>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                {result.annotated_image_path ? (
                  <div className="relative rounded-xl overflow-hidden shadow-inner bg-gray-200 border border-gray-300 flex items-center justify-center p-1 min-h-[300px]">
                    <img 
                      src={`http://localhost:8000${result.annotated_image_path}`}
                      alt="Annotated result"
                      className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[300px] bg-gray-200 rounded-xl border-2 border-dashed border-gray-400">
                    <p className="text-gray-500 font-medium text-lg">Image analysis unavailable</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 text-center">
                     <p className="text-gray-700 text-lg">
                       AI Model Detected <span className="text-2xl font-black text-indigo-600 mx-2">{result.buildings_detected}</span> Structure{result.buildings_detected !== 1 ? 's' : ''}
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Assessment Results */}
          <div className="space-y-6">
            {/* Damage Level Card */}
            <div className={`border-l-4 rounded-lg shadow-lg p-6 ${getDamageColor(result.damage_level)}`}>
              <h2 className="text-lg font-bold mb-2">
                {getDamageEmoji(result.damage_level)} Damage Level
              </h2>
              <p className="text-3xl font-bold mb-2">
                {result.damage_level}
              </p>
              <p className="text-sm opacity-75">
                Confidence: <span className="font-bold">{formattedConfidence}%</span>
              </p>
            </div>

            {/* Recommendation Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                📋 Recommended Action
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {result.recommendation}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-4 overflow-hidden">
                <p className="text-gray-600 text-sm">Confidence Score</p>
                <p className="text-3xl font-bold text-blue-600 truncate" title={`${result.confidence}%`}>{formattedConfidence}%</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <p className="text-gray-600 text-sm">Buildings Found</p>
                <p className="text-3xl font-bold text-blue-600">{result.buildings_detected}</p>
              </div>
            </div>

            {/* Mode Badge */}
            {result.mode === 'mock' && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>ℹ️ Note:</strong> This result is from the MOCK AI system for testing.
                  Real models will provide actual damage assessments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Damage Assessment Guide */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📚 Damage Assessment Guide
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold text-red-700 text-lg mb-2">
                🔴 Destroyed (0% - 25%)
              </h3>
              <p className="text-gray-700 text-sm">
                Building is severely damaged or completely destroyed. Structure integrity is compromised. 
                <strong> Immediate demolition assessment required.</strong>
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-bold text-orange-700 text-lg mb-2">
                🟠 Major Damage (25% - 50%)
              </h3>
              <p className="text-gray-700 text-sm">
                Building has significant structural damage. 
                <strong> Structural inspection by professionals required.</strong>
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold text-yellow-700 text-lg mb-2">
                🟡 Minor Damage (50% - 75%)
              </h3>
              <p className="text-gray-700 text-sm">
                Building has limited damage. Structural integrity is mostly intact. 
                <strong> Repair and continuous monitoring recommended.</strong>
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-green-700 text-lg mb-2">
                🟢 No Damage (75% - 100%)
              </h3>
              <p className="text-gray-700 text-sm">
                Building is unaffected or has negligible damage. 
                <strong> No major intervention required.</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
