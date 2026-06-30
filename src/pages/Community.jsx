import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiThumbsUp, 
  FiThumbsDown, 
  FiMessageSquare, 
  FiFlag,
  FiTrendingUp,
  FiClock,
  FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Sample community reports
const SAMPLE_REPORTS = [
  {
    id: 1,
    type: 'Website',
    title: 'Fake Amazon Prime Giveaway',
    description: 'Website claiming to be Amazon giving away free iPhones. Asks for credit card details for "shipping".',
    reporter: 'User123',
    date: '2 hours ago',
    votes: { up: 45, down: 3 },
    comments: 12,
    verified: true,
    url: 'amazon-prime-giveaway.xyz',
    severity: 'High'
  },
  {
    id: 2,
    type: 'Email',
    title: 'Netflix Account Suspension Scam',
    description: 'Email pretending to be from Netflix saying account is suspended. Links to fake login page.',
    reporter: 'SecurityNinja',
    date: '5 hours ago',
    votes: { up: 32, down: 1 },
    comments: 8,
    verified: true,
    severity: 'High'
  },
  {
    id: 3,
    type: 'Phone',
    title: 'IRS Tax Refund Scam Call',
    description: 'Caller claiming to be from IRS demanding immediate payment for back taxes. Threatening legal action.',
    reporter: 'TaxPayer2024',
    date: '1 day ago',
    votes: { up: 28, down: 2 },
    comments: 15,
    verified: true,
    phone: '+1-555-0199',
    severity: 'Critical'
  }
];

export default function Community() {
  const [reports, setReports] = useState(SAMPLE_REPORTS);
  const [showReportForm, setShowReportForm] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'Website',
    title: '',
    description: '',
    url: ''
  });

  const handleVote = (id, type) => {
    setReports(reports.map(report => {
      if (report.id === id) {
        return {
          ...report,
          votes: {
            ...report.votes,
            [type]: report.votes[type] + 1
          }
        };
      }
      return report;
    }));
    toast.success(`${type === 'up' ? 'Upvoted' : 'Downvoted'} report`);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!newReport.title || !newReport.description) {
      toast.error('Please fill in all fields');
      return;
    }

    const report = {
      id: reports.length + 1,
      ...newReport,
      reporter: 'Anonymous',
      date: 'Just now',
      votes: { up: 0, down: 0 },
      comments: 0,
      verified: false
    };

    setReports([report, ...reports]);
    setShowReportForm(false);
    setNewReport({ type: 'Website', title: '', description: '', url: '' });
    toast.success('Report submitted! Community will review it.');
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community Reports</h1>
            <p className="text-gray-400">
              Real-time scam reports from our community. Together we fight scams.
            </p>
          </div>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="btn-primary flex items-center gap-2"
          >
            <FiFlag />
            Report Scam
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">1,247</div>
            <div className="text-sm text-gray-400">Reports Today</div>
          </div>
          <div className="glass p-4 text-center">
            <div className="text-2xl font-bold text-green-400">892</div>
            <div className="text-sm text-gray-400">Verified Scams</div>
          </div>
          <div className="glass p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">45.2K</div>
            <div className="text-sm text-gray-400">Community Members</div>
          </div>
        </div>

        {/* Report Form */}
        <AnimatePresence>
          {showReportForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass p-6 mb-8 overflow-hidden"
            >
              <h2 className="text-xl font-bold mb-4">Report a Scam</h2>
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Website">Website</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Message">Message</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {newReport.type === 'Website' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">URL</label>
                    <input
                      type="url"
                      value={newReport.url}
                      onChange={(e) => setNewReport({ ...newReport, url: e.target.value })}
                      placeholder="https://scam-website.com"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Brief title describing the scam"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Describe the scam in detail..."
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-6 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reports List */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <button className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center gap-2">
              <FiTrendingUp /> Trending
            </button>
            <button className="px-4 py-2 text-gray-400 hover:text-white rounded-lg flex items-center gap-2">
              <FiClock /> Latest
            </button>
          </div>

          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 text-xs rounded-lg font-semibold ${
                    report.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    report.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {report.severity}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FiUser size={14} /> {report.reporter}
                      </span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{report.type}</span>
                    </div>
                  </div>
                </div>
                {report.verified && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    Verified ✓
                  </span>
                )}
              </div>

              <p className="text-gray-300 mb-4">{report.description}</p>
              
              {report.url && (
                <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 font-mono">{report.url}</p>
                </div>
              )}

              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleVote(report.id, 'up')}
                  className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  <FiThumbsUp /> {report.votes.up}
                </button>
                <button
                  onClick={() => handleVote(report.id, 'down')}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <FiThumbsDown /> {report.votes.down}
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                  <FiMessageSquare /> {report.comments} Comments
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-8 py-3 glass-hover rounded-lg text-gray-400 hover:text-white transition-all">
            Load More Reports
          </button>
        </div>
      </div>
    </div>
  );
}