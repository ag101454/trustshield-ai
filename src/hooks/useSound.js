import { useCallback } from 'react';

// Web Audio API sound effects (no files needed)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, duration, type = 'sine', volume = 0.1) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export function useSound() {
  const playClick = useCallback(() => {
    playTone(800, 0.1, 'sine', 0.05);
  }, []);

  const playSuccess = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.08);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.08), 150);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.08), 300);
  }, []);

  const playError = useCallback(() => {
    playTone(200, 0.2, 'square', 0.06);
    setTimeout(() => playTone(150, 0.3, 'square', 0.06), 200);
  }, []);

  const playHover = useCallback(() => {
    playTone(600, 0.05, 'sine', 0.03);
  }, []);

  const playNotification = useCallback(() => {
    playTone(880, 0.1, 'sine', 0.06);
    setTimeout(() => playTone(1100, 0.2, 'sine', 0.06), 100);
  }, []);

  const playScan = useCallback(() => {
    playTone(440, 0.1, 'sine', 0.04);
    setTimeout(() => playTone(550, 0.1, 'sine', 0.04), 150);
    setTimeout(() => playTone(660, 0.1, 'sine', 0.04), 300);
    setTimeout(() => playTone(880, 0.4, 'sine', 0.06), 450);
  }, []);

  const playUnlock = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.1), i * 200);
    });
  }, []);

  const playVoiceStart = useCallback(() => {
    playTone(600, 0.1, 'sine', 0.05);
    setTimeout(() => playTone(800, 0.15, 'sine', 0.06), 100);
  }, []);
  
  const playVoiceStop = useCallback(() => {
    playTone(800, 0.1, 'sine', 0.05);
    setTimeout(() => playTone(600, 0.15, 'sine', 0.06), 100);
  }, []);

  return {
    playVoiceStart,
    playVoiceStop,
    playClick,
    playSuccess,
    playError,
    playHover,
    playNotification,
    playScan,
    playUnlock
  };
}