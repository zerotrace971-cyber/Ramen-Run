import { describe, expect, it } from 'vitest';
import { comboScore, getComboMultiplier, getRouteDistrict, isNearMiss } from './mechanics';

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
});
