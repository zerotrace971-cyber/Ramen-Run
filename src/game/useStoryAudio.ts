import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type StorySoundscape = 'rain' | 'kitchen' | 'neon' | 'train' | 'lantern' | 'shrine';

const tones: Record<StorySoundscape, [number, number]> = {
  rain: [146.83, 220], kitchen: [196, 293.66], neon: [164.81, 246.94], train: [110, 220], lantern: [261.63, 392], shrine: [174.61, 523.25],
};

/** A small Web Audio soundscape; it remains silent until a user clicks a story control. */
export function useStoryAudio() {
  const contextRef = useRef<AudioContext | null>(null); const nodesRef = useRef<AudioNode[]>([]); const [enabled, setEnabled] = useState(false);
  const stop = useCallback(() => { nodesRef.current.forEach(node => { try { node.disconnect(); } catch { /* already disconnected */ } }); nodesRef.current = []; }, []);
  const play = useCallback((scene: StorySoundscape) => {
    if (!enabled) return;
    stop();
    try {
      const context = contextRef.current ?? new AudioContext(); contextRef.current = context; void context.resume();
      const [root, shimmer] = tones[scene]; const master = context.createGain(); master.gain.value = .018; master.connect(context.destination);
      const drone = context.createOscillator(); drone.type = scene === 'train' ? 'sawtooth' : 'sine'; drone.frequency.value = root; drone.connect(master); drone.start();
      const bell = context.createOscillator(); const bellGain = context.createGain(); bell.type = 'triangle'; bell.frequency.value = shimmer; bellGain.gain.value = .013; bell.connect(bellGain).connect(master); bell.start();
      const lfo = context.createOscillator(); const lfoGain = context.createGain(); lfo.frequency.value = scene === 'rain' ? 1.8 : .45; lfoGain.gain.value = .012; lfo.connect(lfoGain).connect(master.gain); lfo.start();
      nodesRef.current = [drone, bell, lfo, master, bellGain, lfoGain];
    } catch { /* Story stays usable if Web Audio is unavailable. */ }
  }, [enabled, stop]);
  useEffect(() => () => stop(), [stop]);
  return useMemo(() => ({ enabled, setEnabled, play, stop }), [enabled, play, stop]);
}
