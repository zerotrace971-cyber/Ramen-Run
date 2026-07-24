import { describe, expect, it } from 'vitest';
import { formatXlm, relativeTime, shortenAddress } from './format';
import { missions, storyPanels } from './mission-data';

describe('display helpers', () => {
  it('shortens a Stellar address without losing both ends', () => {
    expect(shortenAddress('GABCDE12345ZYXWV')).toBe('GABCD…YXWV');
  });
  it('formats XLM without unnecessary decimal places', () => {
    expect(formatXlm(1248)).toBe('1,248');
  });
  it('uses human-friendly relative time', () => {
    expect(relativeTime(24)).toBe('just now');
    expect(relativeTime(121)).toBe('2m ago');
  });
});

describe('game content', () => {
  it('has uniquely addressable on-chain route IDs', () => {
    expect(new Set(missions.map(mission => mission.id)).size).toBe(missions.length);
  });
  it('ships a complete three-panel prologue', () => {
    expect(storyPanels).toHaveLength(3);
    expect(storyPanels.at(-1)?.title).toContain('sponsor');
  });
});
