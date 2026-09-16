import { describe, expect, it } from 'vitest';
import {
  analyzeWeakness,
  computeDiff,
  diffDirection,
  formatDiff,
  generatePracticeMenu,
  markGameCompleted,
  menuProgress,
  nextFlight,
  pickMissions,
  ratingTrend,
  recommendFromWeakness,
} from './engine';
import type { DailyStats, GameResult, MissionMaster } from '../types';

function mission(name: string, overrides: Partial<MissionMaster> = {}): MissionMaster {
  return { id: name, name, active: true, isCustom: false, createdAt: '2026-01-01T00:00:00Z', ...overrides };
}

describe('nextFlight', () => {
  it('walks C -> CC -> B -> BB -> A -> AA -> SA (§6)', () => {
    expect(nextFlight('C')).toBe('CC');
    expect(nextFlight('CC')).toBe('B');
    expect(nextFlight('A')).toBe('AA');
    expect(nextFlight('SA')).toBeNull();
  });
});

describe('computeDiff / diffDirection / formatDiff (§30)', () => {
  const prev: DailyStats = {
    date: '2026-09-14',
    rating: 5.39,
    flight: 'CC',
    zeroOne: 56.1,
    cricket: 2.02,
    countUp: 412.2,
    practiceMinutes: 60,
    gamesPlayed: 5,
    missionCompleted: 2,
    missionTotal: 3,
  };

  it('matches the worked example in §30 exactly', () => {
    const diff = computeDiff(prev, { rating: 5.47, zeroOne: 56.8, cricket: 2.08, countUp: 421.3 });
    expect(diff).toEqual({ rating: 0.08, zeroOne: 0.7, cricket: 0.06, countUp: 9.1 });
    expect(diffDirection(diff!.rating)).toBe('UP');
    expect(formatDiff(diff!.rating)).toBe('+0.08');
  });

  it('is undefined with no previous entry, and reports FLAT / DOWN correctly', () => {
    expect(computeDiff(undefined, { rating: 5, zeroOne: 1, cricket: 1, countUp: 1 })).toBeUndefined();
    expect(diffDirection(0)).toBe('FLAT');
    expect(diffDirection(-0.5)).toBe('DOWN');
    expect(formatDiff(0)).toBe('±0.00');
    expect(formatDiff(-0.08)).toBe('-0.08');
  });
});

describe('ratingTrend', () => {
  const history: DailyStats[] = [
    { date: '2026-09-01', rating: 5.0 } as DailyStats,
    { date: '2026-09-05', rating: 5.2 } as DailyStats,
    { date: '2026-09-10', rating: 5.1 } as DailyStats,
  ];
  it('is UNKNOWN with fewer than 2 points, else compares first vs last in the window', () => {
    expect(ratingTrend([], 7)).toBe('UNKNOWN');
    expect(ratingTrend(history, 30)).toBe('UP'); // 5.0 -> 5.1 over the whole window
  });
});

describe('pickMissions (§9, §11)', () => {
  const masters = [mission('a'), mission('b'), mission('c', { active: false })];

  it('only picks from active missions', () => {
    const picked = pickMissions(masters, [], 5, 'RANDOM');
    expect(picked.every((m) => m.active)).toBe(true);
    expect(picked.length).toBe(2);
  });

  it('UNACHIEVED_PRIORITY puts never-completed missions first', () => {
    const entries = [{ id: 'e1', missionId: 'a', date: '2026-09-14', status: 'DONE' as const }];
    const picked = pickMissions(masters, entries, 1, 'UNACHIEVED_PRIORITY');
    expect(picked[0].id).toBe('b');
  });

  it('LEAST_RECENT prefers missions with the oldest lastAssignedAt', () => {
    const withHistory = [
      mission('old', { lastAssignedAt: '2026-01-01T00:00:00Z' }),
      mission('never'),
      mission('recent', { lastAssignedAt: '2026-09-14T00:00:00Z' }),
    ];
    const picked = pickMissions(withHistory, [], 1, 'LEAST_RECENT');
    expect(picked[0].id).toBe('never'); // undefined lastAssignedAt sorts first
  });
});

describe('generatePracticeMenu (§26, §27, §36, §37)', () => {
  it('always includes the mission step plus at least one practice step, even for 30 minutes', () => {
    const menu = generatePracticeMenu({ flight: 'CC', minutes: 30, fatigue: 'NORMAL' });
    expect(menu[0].step).toBe('A_MISSION');
    expect(menu.length).toBeGreaterThan(1);
  });

  it('includes LIVE MATCH for a 120-minute session at higher flights', () => {
    const menu = generatePracticeMenu({ flight: 'AA', minutes: 120, fatigue: 'NORMAL' });
    expect(menu.some((m) => m.step === 'H_LIVE_MATCH')).toBe(true);
  });

  it('drops match / live-match steps when fatigue is TIRED (§37)', () => {
    const menu = generatePracticeMenu({ flight: 'AA', minutes: 120, fatigue: 'TIRED' });
    expect(menu.some((m) => m.step === 'H_LIVE_MATCH')).toBe(false);
    expect(menu.some((m) => m.step === 'G_MATCH')).toBe(false);
  });

  it('markGameCompleted / menuProgress track completion across steps', () => {
    const menu = generatePracticeMenu({ flight: 'CC', minutes: 90, fatigue: 'NORMAL' });
    const before = menuProgress(menu);
    const updated = markGameCompleted(menu, 'COUNT_UP');
    const after = menuProgress(updated);
    expect(after.done).toBe(before.done + 1);
  });
});

describe('analyzeWeakness / recommendFromWeakness (§34)', () => {
  function numberPracticeResult(target: 20 | 19 | 18 | 17 | 16 | 15, single: number, miss: number): GameResult {
    return {
      id: `r-${target}`,
      sessionId: null,
      date: '2026-09-15',
      playedAt: new Date().toISOString(),
      payload: {
        gameId: 'NUMBER_PRACTICE',
        data: { mode: 'GAME', sets: [{ target, darts: single + miss, single, double: 0, triple: 0, miss }] },
      },
    };
  }

  it('ranks numbers with enough attempts by ascending hit rate, ignoring low-sample numbers', () => {
    const results = [
      numberPracticeResult(19, 2, 8), // 10 attempts, 20% hit — weak
      numberPracticeResult(20, 9, 1), // 10 attempts, 90% hit — strong
      numberPracticeResult(17, 1, 1), // only 2 attempts — below MIN_ATTEMPTS, excluded
    ];
    const weak = analyzeWeakness(results, 365);
    expect(weak.map((w) => w.number)).toEqual(['19', '20']);
    expect(weak[0].hitRate).toBe(20);

    const recs = recommendFromWeakness(weak, 1);
    expect(recs[0]).toContain('19');
  });
});
