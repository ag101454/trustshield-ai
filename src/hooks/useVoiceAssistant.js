import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Speech synthesis for AI responses
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 0.9;
  
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => 
    v.lang.startsWith('en') && v.name.includes('Female')
  ) || voices.find(v => v.lang.startsWith('en'));
  
  if (femaleVoice) utterance.voice = femaleVoice;
  
  window.speechSynthesis.speak(utterance);
}

// Command patterns
const commands = {
  'scan': {
    patterns: ['scan', 'check', 'analyze', 'verify'],
    response: (url) => `Scanning ${url}. I'll check it against 70 security engines right now.`,
  },
  'go to scanner': {
    patterns: ['go to scanner', 'open scanner', 'website scanner', 'scan page'],
    response: () => 'Opening the website scanner for you.',
    action: 'navigate', value: '/dashboard'
  },
  'go home': {
    patterns: ['go home', 'home page', 'main page', 'landing page'],
    response: () => 'Taking you to the home page.',
    action: 'navigate', value: '/'
  },
  'login': {
    patterns: ['login', 'sign in', 'log in'],
    response: () => 'Opening the login page.',
    action: 'navigate', value: '/login'
  },
  'community': {
    patterns: ['community', 'reports', 'scam reports'],
    response: () => 'Opening community scam reports.',
    action: 'navigate', value: '/community'
  },
  'contact': {
    patterns: ['contact', 'support', 'help me', 'get help'],
    response: () => 'Opening the contact page. You can reach our support team there.',
    action: 'navigate', value: '/contact'
  },
  'hello': {
    patterns: ['hello', 'hi', 'hey', 'greetings'],
    response: () => 'Hello! I am your TrustShield AI assistant. I can help you scan websites, check emails, and detect scams. Just say a command like "scan google.com" or "go to scanner".',
  },
  'what can you do': {
    patterns: ['what can you do', 'help', 'commands', 'what do you do'],
    response: () => 'I can help you with: Scanning websites by saying "scan" followed by a URL. Opening pages like scanner, community, or home. Try saying "scan google.com" or "go to scanner".',
  },
  'thank you': {
    patterns: ['thank you', 'thanks', 'appreciate'],
    response: () => 'You are welcome! Stay safe from online scams.',
  },
  'email scanner': {
    patterns: ['email scanner', 'check email', 'email check'],
    response: () => 'Opening the email scanner. You can paste emails there to check for phishing.',
    action: 'navigate', value: '/dashboard'
  },
  'dark mode': {
    patterns: ['dark mode', 'night mode', 'switch theme', 'change theme', 'light mode'],
    response: (theme) => `Switching to ${theme} mode.`,
  },
  'clear': {
    patterns: ['stop listening', 'stop', 'quiet', 'shut up', 'go away'],
    response: () => 'Alright, I will stop listening. Click the microphone to talk to me again.',
  }
};

export function useVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        setTranscript(command);
        processCommand(command);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (event.error === 'no-speech') {
          setResponse('I didn\'t hear anything. Try again.');
        } else if (event.error === 'not-allowed') {
          setResponse('Please allow microphone access to use voice commands.');
        }
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        // Auto restart if still supposed to be listening
        if (isListening) {
          setTimeout(() => {
            try { recognition.start(); } catch (e) {}
          }, 500);
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Process voice command
  const processCommand = useCallback((command) => {
    console.log('Voice command:', command);
    
    // Check for scan + URL pattern
    const scanMatch = command.match(/(?:scan|check|analyze|verify)\s+(.+\.(?:com|org|net|io|ai|app|dev))/i);
    if (scanMatch) {
      const url = scanMatch[1].trim();
      const responseText = commands['scan'].response(url);
      setResponse(responseText);
      speak(responseText);
      
      // Navigate to dashboard to show scan
      setTimeout(() => {
        navigate('/dashboard');
        // Could also auto-fill the URL in the scanner
      }, 1500);
      return;
    }

    // Check other commands
    for (const [key, cmd] of Object.entries(commands)) {
      if (cmd.patterns.some(pattern => command.includes(pattern))) {
        let responseText;
        if (typeof cmd.response === 'function') {
          responseText = cmd.response();
        } else {
          responseText = cmd.response;
        }
        
        setResponse(responseText);
        speak(responseText);
        
        // Execute action
        if (cmd.action === 'navigate' && cmd.value) {
          setTimeout(() => {
            navigate(cmd.value);
          }, 1000);
        }
        
        return;
      }
    }
    
    // Unknown command
    const unknownResponse = `I heard "${command}" but I don't understand that command yet. Try saying "help" to see what I can do.`;
    setResponse(unknownResponse);
    speak(unknownResponse);
  }, [navigate]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
        setResponse('Listening...');
      } catch (e) {
        console.error('Start error:', e);
      }
    } else {
      setResponse('Speech recognition is not supported in your browser. Try Chrome.');
      speak('Speech recognition is not supported in your browser.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setShowAssistant(!showAssistant);
    if (!showAssistant) {
      setTimeout(() => {
        startListening();
        const welcomeMsg = 'Hello! I am your TrustShield AI voice assistant. How can I help you today?';
        setResponse(welcomeMsg);
        speak(welcomeMsg);
      }, 500);
    } else {
      stopListening();
      const goodbyeMsg = 'Assistant stopped. Click the microphone anytime you need me.';
      setResponse(goodbyeMsg);
      speak(goodbyeMsg);
    }
  }, [showAssistant, startListening, stopListening]);

  return {
    isListening,
    transcript,
    response,
    isSpeaking,
    showAssistant,
    startListening,
    stopListening,
    toggleAssistant,
  };
}