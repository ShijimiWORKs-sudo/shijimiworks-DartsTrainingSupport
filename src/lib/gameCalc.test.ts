import { describe, expect, it } from 'vitest';
import {
  countUp8RoundTotal,
  countUpBullRoundsHit,
  cricketCountUpAimAccuracy,
  eaglesEyeBullRate,
  numberPracticeStats,
  shootOutWeakNumbers,
} from './gameCalc';

describe('eaglesEyeBullRate', () => {
  it('computes (DBULL+SBULL)/totalDarts as a percentage (§16 reference: 8/24 = 33.33%)', () => {
    const rate = eaglesEyeBullRate({ score: 225, dbull: 1, sbull: 7, miss: 16, hattrick: 1, totalDarts: 24 });
    expect(rate).toBeCloseTo(33.3, 1);
  });

  it('handles zero darts without dividing by zero', () => {
    expect(eaglesEyeBullRate({ score: 0, dbull: 0, sbull: 0, miss: 0, hattrick: 0, totalDarts: 0 })).toBe(0);
  });
});

describe('countUp helpers', () => {
  it('counts rounds that had at least one BULL', () => {
    const result = {
      score: 400,
      bullCount: 3,
      roundsOver100: 1,
      bestRound: 140,
      roundScores: [100, 90, 140, 20, 10, 15, 15, 10],
      bullByRound: [true, false, true, false, false, true, false, false],
    };
    expect(countUpBullRoundsHit(result)).toBe(3);
    expect(countUp8RoundTotal(result)).toBe(400);
  });
});

describe('cricketCountUpAimAccuracy', () => {
  it('is the percentage of rounds where the aimed number was actually hit (§17)', () => {
    const result = {
      score: 100,
      rounds: [
        { target: 20 as const, hits: [20 as const] },
        { target: 20 as const, hits: [18 as const] }, // aimed 20, landed 18 → miss for aim purposes
        { target: 'BULL' as const, hits: ['BULL' as const] },
        { target: 19 as const, hits: [] as (20 | 19 | 18 | 17 | 16 | 15 | 'BULL')[] },
      ],
    };
    expect(cricketCountUpAimAccuracy(result)).toBe(50);
  });
});

describe('numberPracticeStats', () => {
  it('computes hit rate and triple rate from a single NUMBER PRACTICE set (§18)', () => {
    const stats = numberPracticeStats({ target: 19, darts: 10, single: 4, double: 2, triple: 1, miss: 3 });
    expect(stats.hits).toBe(7);
    expect(stats.hitRate).toBe(70);
    expect(stats.tripleRate).toBe(10);
  });

  it('does not divide by zero when no darts were thrown', () => {
    const stats = numberPracticeStats({ target: 19, darts: 0, single: 0, double: 0, triple: 0, miss: 0 });
    expect(stats.hitRate).toBe(0);
    expect(stats.tripleRate).toBe(0);
  });
});

describe('shootOutWeakNumbers', () => {
  it('ranks numbers ascending by hit rate and ignores untried numbers', () => {
    const result = {
      numbers: {
        '20': { hit: 8, total: 10 },
        '19': { hit: 2, total: 10 },
        '18': { hit: 0, total: 0 },
      },
    };
    const weak = shootOutWeakNumbers(result, 2);
    expect(weak.map((w) => w.number)).toEqual(['19', '20']);
  });
});
