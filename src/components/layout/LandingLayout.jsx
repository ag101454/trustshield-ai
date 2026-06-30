import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cyber-dark">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-lg">
              🛡️
            </div>
            <span className="text-xl font-bold text-white">TrustShield AI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <a href="#features" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Demo
            </a>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Scanner
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary px-6 py-2 text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}