import { useCallback, useRef, useState } from 'react';

type SoundName = 'tap' | 'collect' | 'boost' | 'hit' | 'win' | 'dialogue' | 'engine' | 'powerup';
const frequencies: Record<SoundName, number[]> = {
  tap: [520], collect: [740, 980, 1240], boost: [145, 220, 340], hit: [130, 80], win: [523, 659, 784, 1046], dialogue: [280], engine: [104, 156], powerup: [392, 587, 784, 1174],
};

export function useSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const play = useCallback((name: SoundName) => {
    if (!soundOn) return;
    try {
      const context = contextRef.current ?? new AudioContext(); contextRef.current = context;
      if (context.state === 'suspended') void context.resume();
      const now = context.currentTime;
      frequencies[name].forEach((frequency, index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain();
        const start = now + index * (name === 'win' || name === 'powerup' ? .075 : .045);
        const duration = name === 'win' || name === 'powerup' ? .27 : name === 'engine' ? .17 : .14;
        oscillator.type = name === 'hit' ? 'sawtooth' : name === 'engine' ? 'sawtooth' : name === 'boost' ? 'square' : 'triangle';
        oscillator.frequency.setValueAtTime(frequency, start);
        if (name === 'engine') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.72, start + duration);
        if (name === 'hit') oscillator.frequency.exponentialRampToValueAtTime(Math.max(34, frequency * .48), start + duration);
        gain.gain.setValueAtTime(name === 'dialogue' ? .025 : name === 'engine' ? .032 : .058, start);
        gain.gain.exponentialRampToValueAtTime(.001, start + duration);
        oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start + duration + .03);
      });
    } catch { /* sound gracefully remains optional where Web Audio is unavailable */ }
  }, [soundOn]);
  return { soundOn, setSoundOn, play };
}
