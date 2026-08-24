export const MAX_INTEGRITY = 3;

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
