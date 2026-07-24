import { beforeEach, describe, expect, it } from 'vitest';
import { levels, quests } from './data';
import { defaultProgress, loadProgress } from './progress';

describe('Suzume game progression', () => {
  beforeEach(() => localStorage.clear());

  it('ships a route ladder with increasing challenge targets', () => {
    expect(levels.map(level => level.target)).toEqual([120, 180, 250, 340]);
    expect(new Set(levels.map(level => level.id)).size).toBe(levels.length);
  });

  it('contains character quests with distinct objectives and rewards', () => {
    expect(quests).toHaveLength(4);
    expect(new Set(quests.map(quest => quest.id)).size).toBe(quests.length);
    expect(quests.every(quest => quest.amount > 0 && quest.reward.length > 4)).toBe(true);
  });

  it('gives every character quest a unique game mode and illustrated stage', () => {
    expect(new Set(quests.map(quest => quest.mode)).size).toBe(quests.length);
    expect(new Set(quests.map(quest => quest.stage)).size).toBe(quests.length);
    expect(quests.every(quest => Number(quest.xlmReward.split(' ')[0]) > 0)).toBe(true);
  });

  it('recovers to a safe starting save state when storage is malformed', () => {
    localStorage.setItem('suzume-game-progress-v2', '{not-json');
    expect(loadProgress()).toEqual(defaultProgress);
  });
});
