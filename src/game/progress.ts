import { useCallback, useState } from 'react';
import { emptyJetpackPowerups, type JetpackPowerupInventory } from './jetpack/powerups';
import type { RunGrade } from './jetpack/mechanics';

export type GameProgress = {
  coins: number;
  highScore: number;
  runs: number;
  unlockedLevel: number;
  completedLevels: number[];
  acceptedQuests: string[];
  completedQuests: string[];
  nori: number;
  perfectRuns: number;
  bestCombo: number;
  bestJetpackGrade: RunGrade;
  questReceipts: Record<string, { hash: string; amount: string; paid: boolean }>;
  jetpackPowerups: JetpackPowerupInventory;
};

export const defaultProgress: GameProgress = { coins: 220, highScore: 0, runs: 0, unlockedLevel: 1, completedLevels: [], acceptedQuests: [], completedQuests: [], nori: 0, perfectRuns: 0, bestCombo: 0, bestJetpackGrade: 'C', questReceipts: {}, jetpackPowerups: emptyJetpackPowerups };
const key = 'suzume-game-progress-v2';

export const loadProgress = (): GameProgress => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
    return { ...defaultProgress, ...stored, jetpackPowerups: { ...emptyJetpackPowerups, ...(stored.jetpackPowerups ?? {}) } };
  }
  catch { return defaultProgress; }
};

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(loadProgress);
  const update = useCallback((change: Partial<GameProgress> | ((current: GameProgress) => Partial<GameProgress>)) => {
    setProgress(current => {
      const next = { ...current, ...(typeof change === 'function' ? change(current) : change) };
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, []);
  return { progress, update };
}
