import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ScannerDemo() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const sectionRef = React.useRef();
  const isInView = useInView(sectionRef);

  const handleScan = () => {
    if (!url) return;
    
    setScanning(true);
    setResult(null);
    
    setTimeout(() => {
      setScanning(false);
      setResult({
        safe: Math.random() > 0.5,
        score: Math.floor(Math.random() * 40) + 60,
        details: {
          ssl: true,
          age: '2 years',
          reputation: 'Good'
        }
      });
    }, 2000);
  };

  return (
    <section ref={sectionRef} className="py-32 px-4 relative" id="demo">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See It in <span className="gradient-text">Action</span>
          </h2>
          <p className="text-xl text-gray-400">
            Our AI analyzes thousands of data points in seconds
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Scanner UI */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-500 ml-2">TrustShield Scanner</span>
              </div>

              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                />
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  {scanning ? 'Scanning...' : 'Scan'}
                </button>
              </div>

              {/* Scanning Animation */}
              {scanning && (
                <div className="space-y-3">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-400">Analyzing with AI...</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-black/20 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Trust Score</span>
                    <span className={`text-3xl font-bold ${result.safe ? 'text-green-400' : 'text-red-400'}`}>
                      {result.score}/100
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>SSL Certificate</span>
                      <span className="text-green-400">✓ Valid</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Domain Age</span>
                      <span className="text-green-400">{result.details.age}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Reputation</span>
                      <span className="text-green-400">{result.details.reputation}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {[
              { icon: '🤖', title: 'AI-Powered Analysis', desc: 'Machine learning detects patterns humans miss' },
              { icon: '⚡', title: 'Real-Time Results', desc: 'Get instant trust scores and recommendations' },
              { icon: '🛡️', title: 'Multi-Layer Security', desc: 'Checks against 10+ threat databases' },
              { icon: '👥', title: 'Community Verified', desc: 'Reports from thousands of users worldwide' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="glass p-6 flex items-start gap-4"
              >
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}