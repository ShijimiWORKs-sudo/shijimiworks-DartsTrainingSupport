import { describe, expect, it } from 'vitest';
import {
  bigBullStats,
  countUp8RoundTotal,
  countUpBullRoundsHit,
  cricketCountUpAimAccuracy,
  eaglesEyeBullRate,
  halfItStats,
  numberPracticeStats,
} from './gameCalc';
import { HALF_IT_TARGETS } from '../types';
import type { HalfItRound } from '../types';

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

describe('halfItStats', () => {
  it('sums S/D/T/MISS across the fixed 9 rounds and computes hit rate + halved-round count (§23 feedback)', () => {
    function round(target: HalfItRound['target'], patch: Partial<HalfItRound>): HalfItRound {
      return { target, single: 0, double: 0, triple: 0, miss: 0, halved: false, ...patch };
    }
    const rounds: HalfItRound[] = HALF_IT_TARGETS.map((target) => round(target, {}));
    rounds[0] = round('15', { single: 2, miss: 1 }); // hit
    rounds[2] = round('DOUBLE', { miss: 3, halved: true }); // fully missed -> halved
    rounds[8] = round('BULL', { double: 1, miss: 2 });

    const stats = halfItStats({ rounds, finalScore: 45 });
    expect(stats.hits).toBe(3); // 2 single (15) + 1 double (BULL)
    expect(stats.totalDarts).toBe(9); // 3 darts/round * 3 rounds populated above
    expect(stats.hitRate).toBeCloseTo(33.3, 1);
    expect(stats.halvedRounds).toBe(1);
  });
});

describe('bigBullStats', () => {
  it('computes bull rate and inner rate from OUTER/INNER BULL counts (§25 feedback)', () => {
    const stats = bigBullStats({ outerBull: 4, innerBull: 2, miss: 18, totalDarts: 24, finalScore: 340 });
    expect(stats.bullRate).toBeCloseTo(25, 1); // (4+2)/24
    expect(stats.innerRate).toBeCloseTo(8.3, 1); // 2/24
  });

  it('handles zero darts without dividing by zero', () => {
    expect(bigBullStats({ outerBull: 0, innerBull: 0, miss: 0, totalDarts: 0, finalScore: 0 })).toEqual({
      bullRate: 0,
      innerRate: 0,
    });
  });
});
