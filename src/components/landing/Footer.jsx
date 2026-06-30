import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                🛡️
              </div>
              <span className="text-lg font-bold">TrustShield AI</span>
            </div>
            <p className="text-gray-400 text-sm">
              Protecting millions from online scams with AI-powered detection.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-cyan-400">Website Scanner</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400">Email Checker</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400">Browser Extension</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400">API</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-400">About</a></li>
              <li><a href="#" className="hover:text-cyan-400">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 TrustShield AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span>🌐 English</span>
            <span>🇺🇸 United States</span>
          </div>
        </div>
      </div>
    </footer>
  );
}