import { create } from 'zustand';

export const useScanStore = create((set) => ({
  scans: [],
  currentScan: null,
  loading: false,
  error: null,

  scanWebsite: async (url) => {
    set({ loading: true, error: null });
    
    // Simulate API call (replace with real Firebase call later)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = {
      trustScore: Math.floor(Math.random() * 60) + 40,
      riskLevel: 'Medium',
      domainAge: '5 years',
      ssl: true,
      blacklisted: false,
      malware: false,
      explanation: 'This website appears legitimate based on our analysis.',
      timestamp: new Date().toISOString()
    };
    
    set({ currentScan: result, loading: false });
    return result;
  },

  scanEmail: async (email) => {
    set({ loading: true, error: null });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = {
      threatScore: 85,
      spoofing: false,
      urgencyDetected: true,
      scamType: 'Phishing Attempt',
      explanation: 'Suspicious email detected with urgency language.',
      timestamp: new Date().toISOString()
    };
    
    set({ currentScan: result, loading: false });
    return result;
  },

  clearScan: () => set({ currentScan: null, error: null })
}));