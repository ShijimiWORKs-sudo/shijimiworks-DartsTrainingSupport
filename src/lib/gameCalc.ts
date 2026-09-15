import type {
  CountUpResult,
  CricketCountUpResult,
  EaglesEyeResult,
  NumberPracticeSet,
  ShootOutResult,
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
// SHOOT OUT (§22)
// ---------------------------------------------------------------------------
export function shootOutWeakNumbers(r: ShootOutResult, limit = 3): { number: string; rate: number }[] {
  return Object.entries(r.numbers)
    .filter(([, v]) => v.total > 0)
    .map(([number, v]) => ({ number, rate: round1((v.hit / v.total) * 100) }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, limit);
}
