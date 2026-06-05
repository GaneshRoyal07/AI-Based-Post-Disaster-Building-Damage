import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getHealth } from './services/api';
import Home from './pages/Home';
import Results from './pages/Results';
import './styles/index.css';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Check if backend API is running
    const checkApi = async () => {
      try {
        await getHealth();
        setApiStatus('connected');
      } catch (error) {
        setApiStatus('disconnected');
      }
    };

    checkApi();
    // Check every 30 seconds
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      {/* Status Banner */}
      <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 ${
        apiStatus === 'connected' 
          ? 'bg-green-500' 
          : apiStatus === 'disconnected'
          ? 'bg-red-500'
          : 'bg-yellow-500'
      }`}>
        {apiStatus === 'connected' && '✅ Backend Connected'}
        {apiStatus === 'disconnected' && '❌ Backend Disconnected - Start: uvicorn app.main:app --reload'}
        {apiStatus === 'checking' && '⏳ Checking Backend...'}
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}
