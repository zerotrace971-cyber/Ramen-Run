import { describe, expect, it } from 'vitest';
import { bestRunGrade, calculateRunGrade, comboScore, countCompletedObjectives, getComboMultiplier, getNightShiftObjectives, getRouteDistrict, isNearMiss, objectiveCoinBonus } from './mechanics';

describe('Ramen Jetpack mechanics', () => {
  it('moves the courier through three named route districts', () => {
    expect(getRouteDistrict(100, 1200).name).toBe('Neon Market');
    expect(getRouteDistrict(600, 1200).name).toBe('Shibuya Skyrail');
    expect(getRouteDistrict(1100, 1200).name).toBe('Moon Shrine');
  });

  it('rewards sustained combos with a capped three-times multiplier', () => {
    expect([getComboMultiplier(0), getComboMultiplier(3), getComboMultiplier(7), getComboMultiplier(12)]).toEqual([1, 1.5, 2, 3]);
    expect(comboScore(55, 7)).toBe(110);
  });

  it('only awards a near miss when a hazard passes close to Suzume', () => {
    expect(isNearMiss(300, 250, 80)).toBe(true);
    expect(isNearMiss(100, 500, 80)).toBe(false);
  });

  it('tracks all four Night Shift objectives independently', () => {
    const state = { ramen: 6, nearMisses: 2, integrity: 2, bossDefeated: true };
    expect(getNightShiftObjectives(state)).toEqual({ ramen: true, nearMisses: false, integrity: true, boss: true });
    expect(countCompletedObjectives(state)).toBe(3);
    expect(objectiveCoinBonus(3, true)).toBe(100);
  });

  it('awards an S rank only to a complete high-skill delivery', () => {
    expect(calculateRunGrade({ delivered: true, score: 2_200, hitsTaken: 0, ramen: 8, nearMisses: 4, integrity: 3, bossDefeated: true })).toBe('S');
    expect(calculateRunGrade({ delivered: true, score: 900, hitsTaken: 2, ramen: 3, nearMisses: 1, integrity: 1, bossDefeated: true })).toBe('B');
    expect(calculateRunGrade({ delivered: false, score: 200, hitsTaken: 3, ramen: 1, nearMisses: 0, integrity: 0, bossDefeated: false })).toBe('C');
  });

  it('persists only an improved route grade', () => {
    expect(bestRunGrade('B', 'S')).toBe('S');
    expect(bestRunGrade('A', 'C')).toBe('A');
  });
});
