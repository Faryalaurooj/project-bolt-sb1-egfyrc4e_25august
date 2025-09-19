import { useState, useEffect, useCallback } from 'react';

export function useSound() {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('chatSoundMuted');
    return saved ? JSON.parse(saved) : false;
  });

  const [selectedSound, setSelectedSound] = useState(() => {
    return localStorage.getItem('chatAlertSound') || 'default';
  });

  useEffect(() => {
    localStorage.setItem('chatSoundMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('chatAlertSound', selectedSound);
  }, [selectedSound]);

  const playMessageSound = useCallback(() => {
    if (isMuted) return;

    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const soundFrequencies = {
      default: [800, 600],
      chime: [523, 659, 784],
      ding: [1000],
      bell: [440, 554, 659],
      pop: [200, 400]
    };

    const frequencies = soundFrequencies[selectedSound] || soundFrequencies.default;
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime + (index * 0.1));
      oscillator.stop(audioContext.currentTime + 0.3 + (index * 0.1));
    });
  }, [isMuted, selectedSound]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const changeSound = useCallback((soundName) => {
    setSelectedSound(soundName);
  }, []);

  return {
    isMuted,
    selectedSound,
    playMessageSound,
    toggleMute,
    changeSound
  };
}