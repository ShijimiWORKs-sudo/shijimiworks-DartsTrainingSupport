import type {
  BigBullResult,
  CountUpResult,
  CricketCountUpResult,
  EaglesEyeResult,
  HalfItResult,
  NumberPracticeSet,
} from '../types';

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// EAGLE'S EYE (§16) — BULL RATE = (DBULL + SBULL) / total darts
// ---------------------------------------------------------------------------
export function eaglesEyeBullRate(r: EaglesEyeResult): number {
  if (!r.totalDarts) return 0;
  return round1(((r.dbull + r.sbull) / r.totalDarts) * 100);
}

// ---------------------------------------------------------------------------
// COUNT-UP (§15) — 「8ラウンドで各ラウンド最低1BULL」の可視化
// ---------------------------------------------------------------------------
export function countUpBullRoundsHit(r: CountUpResult): number {
  return r.bullByRound.filter(Boolean).length;
}

export function countUp8RoundTotal(r: CountUpResult): number {
  return r.roundScores.reduce((sum, v) => sum + v, 0);
}

// ---------------------------------------------------------------------------
// CRICKET COUNT-UP (§17) — 狙い(target) と 実際(hits) を分離
// ---------------------------------------------------------------------------
export function cricketCountUpAimAccuracy(r: CricketCountUpResult): number {
  if (!r.rounds.length) return 0;
  const hitCount = r.rounds.filter((round) => round.hits.includes(round.target)).length;
  return round1((hitCount / r.rounds.length) * 100);
}

// ---------------------------------------------------------------------------
// 1501 NUMBER PRACTICE (§18)
// ---------------------------------------------------------------------------
export interface NumberPracticeStats {
  hits: number;
  hitRate: number;
  tripleRate: number;
}

export function numberPracticeStats(set: NumberPracticeSet): NumberPracticeStats {
  const hits = set.single + set.double + set.triple;
  const hitRate = set.darts ? round1((hits / set.darts) * 100) : 0;
  const tripleRate = set.darts ? round1((set.triple / set.darts) * 100) : 0;
  return { hits, hitRate, tripleRate };
}

// ---------------------------------------------------------------------------
// HALF-IT (§23) — 9ラウンド固定。STATSはS/D/T命中・MISSの合計から算出。
// ---------------------------------------------------------------------------
export interface HalfItStats {
  totalDarts: number;
  hits: number;
  hitRate: number;
  halvedRounds: number;
}

export function halfItStats(r: HalfItResult): HalfItStats {
  let single = 0;
  let double = 0;
  let triple = 0;
  let miss = 0;
  let halvedRounds = 0;
  for (const round of r.rounds) {
    single += round.single;
    double += round.double;
    triple += round.triple;
    miss += round.miss;
    if (round.halved) halvedRounds += 1;
  }
  const hits = single + double + triple;
  const totalDarts = hits + miss;
  return { totalDarts, hits, hitRate: totalDarts ? round1((hits / totalDarts) * 100) : 0, halvedRounds };
}

// ---------------------------------------------------------------------------
// BIG BULL — OUTER BULL / INNER BULLの命中率STATS
// ---------------------------------------------------------------------------
export interface BigBullStats {
  bullRate: number; // (OUTER+INNER) / totalDarts
  innerRate: number; // INNER / totalDarts
}

export function bigBullStats(r: BigBullResult): BigBullStats {
  if (!r.totalDarts) return { bullRate: 0, innerRate: 0 };
  return {
    bullRate: round1(((r.outerBull + r.innerBull) / r.totalDarts) * 100),
    innerRate: round1((r.innerBull / r.totalDarts) * 100),
  };
}
