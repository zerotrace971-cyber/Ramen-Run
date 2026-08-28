export const MAX_INTEGRITY = 3;
export const BOSS_START_PROGRESS = .72;
export const BOSS_CLEAR_PROGRESS = .91;

export type RunGrade = 'S' | 'A' | 'B' | 'C';

export type NightShiftState = {
  ramen: number;
  nearMisses: number;
  integrity: number;
  bossDefeated: boolean;
};

export type RouteDistrict = {
  name: string;
  japanese: string;
  intensity: 'warm-up' | 'rush hour' | 'final approach';
};

export function getRouteDistrict(distance: number, goal: number): RouteDistrict {
  const progress = goal > 0 ? distance / goal : 0;
  if (progress >= .67) return { name: 'Moon Shrine', japanese: '月神社', intensity: 'final approach' };
  if (progress >= .34) return { name: 'Shibuya Skyrail', japanese: '渋谷空路', intensity: 'rush hour' };
  return { name: 'Neon Market', japanese: '夜市', intensity: 'warm-up' };
}

export function getComboMultiplier(combo: number) {
  if (combo >= 12) return 3;
  if (combo >= 7) return 2;
  if (combo >= 3) return 1.5;
  return 1;
}

export function comboScore(base: number, combo: number) {
  return Math.round(base * getComboMultiplier(combo));
}

export function isNearMiss(playerY: number, entityY: number, entityHeight: number) {
  const playerCenter = playerY;
  const entityCenter = entityY + entityHeight / 2;
  return Math.abs(playerCenter - entityCenter) < entityHeight / 2 + 78;
}

export function getNightShiftObjectives(state: NightShiftState) {
  return {
    ramen: state.ramen >= 6,
    nearMisses: state.nearMisses >= 3,
    integrity: state.integrity >= 2,
    boss: state.bossDefeated,
  };
}

export function countCompletedObjectives(state: NightShiftState) {
  return Object.values(getNightShiftObjectives(state)).filter(Boolean).length;
}

export function calculateRunGrade(run: NightShiftState & { delivered: boolean; score: number; hitsTaken: number }): RunGrade {
  let rankPoints = run.delivered ? 2 : 0;
  rankPoints += countCompletedObjectives(run);
  if (run.score >= 1_800) rankPoints += 1;
  if (run.hitsTaken === 0) rankPoints += 1;
  if (rankPoints >= 7) return 'S';
  if (rankPoints >= 5) return 'A';
  if (rankPoints >= 3) return 'B';
  return 'C';
}

export function objectiveCoinBonus(completedObjectives: number, bossDefeated: boolean) {
  return completedObjectives * 20 + (bossDefeated ? 40 : 0);
}

export function bestRunGrade(current: RunGrade, candidate: RunGrade): RunGrade {
  const order: RunGrade[] = ['C', 'B', 'A', 'S'];
  return order.indexOf(candidate) > order.indexOf(current) ? candidate : current;
}
