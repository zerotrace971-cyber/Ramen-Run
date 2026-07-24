import { useCallback, useRef, useState } from 'react';

type SoundName = 'tap' | 'collect' | 'boost' | 'hit' | 'win' | 'dialogue';
const frequencies: Record<SoundName, number[]> = { tap: [520], collect: [740, 980], boost: [180, 310], hit: [130, 80], win: [523, 659, 784, 1046], dialogue: [280] };

export function useSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const play = useCallback((name: SoundName) => {
    if (!soundOn) return;
    try {
      const context = contextRef.current ?? new AudioContext(); contextRef.current = context;
      const now = context.currentTime;
      frequencies[name].forEach((frequency, index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = name === 'hit' ? 'sawtooth' : name === 'boost' ? 'square' : 'triangle';
        oscillator.frequency.setValueAtTime(frequency, now + index * .07);
        gain.gain.setValueAtTime(name === 'dialogue' ? .025 : .055, now + index * .07);
        gain.gain.exponentialRampToValueAtTime(.001, now + index * .07 + (name === 'win' ? .24 : .13));
        oscillator.connect(gain).connect(context.destination); oscillator.start(now + index * .07); oscillator.stop(now + index * .07 + .27);
      });
    } catch { /* sound gracefully remains optional where Web Audio is unavailable */ }
  }, [soundOn]);
  return { soundOn, setSoundOn, play };
}
