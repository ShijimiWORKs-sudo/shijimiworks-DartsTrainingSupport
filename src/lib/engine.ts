import { GAME_MASTER, MENU_STEP_LABEL, MENU_STEP_ORDER } from './gameMaster';
import { round1, round2 } from './gameCalc';
import type {
  DailyMissionEntry,
  DailyStats,
  DailyStatsDiff,
  FatigueLevel,
  GameId,
  GameResult,
  MenuStep,
  MissionMaster,
  PracticeMenuItem,
  PracticeMinutes,
  RankFlight,
} from '../types';
import { RANK_ORDER } from '../types';

// ---------------------------------------------------------------------------
// Rank / Flight helpers (§6, §33)
// ---------------------------------------------------------------------------

export function nextFlight(flight: RankFlight): RankFlight | null {
  const idx = RANK_ORDER.indexOf(flight);
  if (idx === -1 || idx === RANK_ORDER.length - 1) return null;
  return RANK_ORDER[idx + 1];
}

export type Trend = 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN';

/**
 * Rating trend over the given history window. This never invents a
 * DARTSLIVE rating value — it only compares the earliest vs. latest
 * *user-entered* values already on file for the window.
 */
export function ratingTrend(history: DailyStats[], days: number): Trend {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const windowed = sorted.slice(-days);
  if (windowed.length < 2) return 'UNKNOWN';
  const delta = windowed[windowed.length - 1].rating - windowed[0].rating;
  if (delta > 0.001) return 'UP';
  if (delta < -0.001) return 'DOWN';
  return 'FLAT';
}

// ---------------------------------------------------------------------------
// Daily stats diff (§30)
// ---------------------------------------------------------------------------

export function computeDiff(
  prev: DailyStats | undefined,
  curr: { rating: number; zeroOne: number; cricket: number; countUp: number },
): DailyStatsDiff | undefined {
  if (!prev) return undefined;
  return {
    rating: round2(curr.rating - prev.rating),
    zeroOne: round2(curr.zeroOne - prev.zeroOne),
    cricket: round2(curr.cricket - prev.cricket),
    countUp: round1(curr.countUp - prev.countUp),
  };
}

export type DiffDirection = 'UP' | 'DOWN' | 'FLAT';

export function diffDirection(v: number): DiffDirection {
  if (v > 0) return 'UP';
  if (v < 0) return 'DOWN';
  return 'FLAT';
}

export function formatDiff(v: number, digits = 2): string {
  const sign = v > 0 ? '+' : v < 0 ? '' : '±';
  return `${sign}${v.toFixed(digits)}`;
}

export function latestDailyStats(history: DailyStats[]): DailyStats | undefined {
  return [...history].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
}

// ---------------------------------------------------------------------------
// Mission selection (§9, §11)
// ---------------------------------------------------------------------------

export type MissionSelectMode = 'RANDOM' | 'UNACHIEVED_PRIORITY' | 'LEAST_RECENT';

/**
 * Pick `count` missions from the active mission master list.
 *   - RANDOM: uniform random pick.
 *   - UNACHIEVED_PRIORITY: missions never yet marked DONE come first.
 *   - LEAST_RECENT: missions with the oldest (or no) lastAssignedAt come first.
 */
export function pickMissions(
  masters: MissionMaster[],
  allEntries: DailyMissionEntry[],
  count: number,
  mode: MissionSelectMode = 'RANDOM',
): MissionMaster[] {
  const active = masters.filter((m) => m.active);
  if (active.length === 0) return [];

  if (mode === 'RANDOM') {
    const pool = [...active];
    const picked: MissionMaster[] = [];
    while (pool.length && picked.length < count) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }

  if (mode === 'UNACHIEVED_PRIORITY') {
    const doneIds = new Set(allEntries.filter((e) => e.status === 'DONE').map((e) => e.missionId));
    const sorted = [...active].sort((a, b) => Number(doneIds.has(a.id)) - Number(doneIds.has(b.id)));
    return sorted.slice(0, count);
  }

  // LEAST_RECENT
  const sorted = [...active].sort((a, b) => {
    const aTime = a.lastAssignedAt ? Date.parse(a.lastAssignedAt) : 0;
    const bTime = b.lastAssignedAt ? Date.parse(b.lastAssignedAt) : 0;
    return aTime - bTime;
  });
  return sorted.slice(0, count);
}

// ---------------------------------------------------------------------------
// Practice menu generation (§26, §27, §36, §37)
// ---------------------------------------------------------------------------

const STEP_COST_MIN: Record<MenuStep, number> = {
  A_MISSION: 0,
  B_WARMUP: 10,
  C_BULL: 15,
  D_CRICKET_NUMBER: 15,
  E_NUMBER_VARIETY: 15,
  F_FINISH: 10,
  G_MATCH: 20,
  H_LIVE_MATCH: 30,
};

/**
 * Per-flight emphasis order (§27) — which steps this rating tier should
 * prioritize first when time is limited. This is the app's own training
 * design, not an official DARTSLIVE curriculum (§27 closing note).
 */
const TIER_STEP_PRIORITY: Record<RankFlight, MenuStep[]> = {
  C: ['B_WARMUP', 'C_BULL', 'D_CRICKET_NUMBER', 'E_NUMBER_VARIETY', 'F_FINISH', 'G_MATCH', 'H_LIVE_MATCH'],
  CC: ['B_WARMUP', 'C_BULL', 'D_CRICKET_NUMBER', 'E_NUMBER_VARIETY', 'F_FINISH', 'G_MATCH', 'H_LIVE_MATCH'],
  B: ['B_WARMUP', 'C_BULL', 'D_CRICKET_NUMBER', 'E_NUMBER_VARIETY', 'G_MATCH', 'F_FINISH', 'H_LIVE_MATCH'],
  BB: ['B_WARMUP', 'C_BULL', 'E_NUMBER_VARIETY', 'D_CRICKET_NUMBER', 'G_MATCH', 'F_FINISH', 'H_LIVE_MATCH'],
  A: ['B_WARMUP', 'G_MATCH', 'H_LIVE_MATCH', 'F_FINISH', 'C_BULL', 'D_CRICKET_NUMBER', 'E_NUMBER_VARIETY'],
  AA: ['B_WARMUP', 'H_LIVE_MATCH', 'G_MATCH', 'E_NUMBER_VARIETY', 'F_FINISH', 'C_BULL', 'D_CRICKET_NUMBER'],
  SA: ['B_WARMUP', 'H_LIVE_MATCH', 'G_MATCH', 'D_CRICKET_NUMBER', 'E_NUMBER_VARIETY', 'F_FINISH', 'C_BULL'],
};

function stepGameIds(step: MenuStep): GameId[] {
  return GAME_MASTER.filter((g) => g.step === step).map((g) => g.id);
}

export function generatePracticeMenu(opts: {
  flight: RankFlight;
  minutes: PracticeMinutes;
  fatigue: FatigueLevel;
}): PracticeMenuItem[] {
  let priority = [...TIER_STEP_PRIORITY[opts.flight]];

  // §37: 疲れている場合は実戦系(G/H)を無理に増やさず技術練習中心に。
  if (opts.fatigue === 'TIRED') {
    priority = priority.filter((s) => s !== 'G_MATCH' && s !== 'H_LIVE_MATCH');
    for (const fallback of ['D_CRICKET_NUMBER', 'C_BULL', 'B_WARMUP'] as MenuStep[]) {
      if (!priority.includes(fallback)) priority.unshift(fallback);
    }
  }

  const chosen: MenuStep[] = ['A_MISSION'];
  let budget: number = opts.minutes;

  for (const step of priority) {
    if (chosen.includes(step)) continue;
    const cost = STEP_COST_MIN[step];
    const isFirstPracticeStep = chosen.length === 1; // only A_MISSION so far
    if (cost <= budget || isFirstPracticeStep) {
      chosen.push(step);
      budget -= cost;
    }
    if (budget <= 0) break;
  }

  return MENU_STEP_ORDER.filter((s) => chosen.includes(s)).map((step) => ({
    step,
    label: MENU_STEP_LABEL[step],
    gameIds: stepGameIds(step),
    completedGameIds: [],
  }));
}

export function markGameCompleted(menu: PracticeMenuItem[], gameId: GameId): PracticeMenuItem[] {
  return menu.map((item) =>
    item.gameIds.includes(gameId) && !item.completedGameIds.includes(gameId)
      ? { ...item, completedGameIds: [...item.completedGameIds, gameId] }
      : item,
  );
}

export function menuProgress(menu: PracticeMenuItem[]): { done: number; total: number } {
  const total = menu.filter((m) => m.step !== 'A_MISSION').length;
  const done = menu.filter((m) => m.step !== 'A_MISSION' && m.completedGameIds.length > 0).length;
  return { done, total };
}

// ---------------------------------------------------------------------------
// Weakness analysis (§34)
// ---------------------------------------------------------------------------

export interface NumberWeakness {
  number: string;
  hitRate: number;
  attempts: number;
}

const WEAKNESS_LOOKBACK_DAYS = 30;
const MIN_ATTEMPTS = 5;

export function analyzeWeakness(results: GameResult[], lookbackDays = WEAKNESS_LOOKBACK_DAYS): NumberWeakness[] {
  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const tally = new Map<string, { hit: number; total: number }>();

  const add = (key: string, hit: number, total: number) => {
    const cur = tally.get(key) ?? { hit: 0, total: 0 };
    cur.hit += hit;
    cur.total += total;
    tally.set(key, cur);
  };

  for (const r of results) {
    if (Date.parse(r.playedAt) < cutoff) continue;
    const p = r.payload;
    if (p.gameId === 'NUMBER_PRACTICE') {
      for (const set of p.data.sets) {
        const hits = set.single + set.double + set.triple;
        add(String(set.target), hits, set.darts);
      }
    } else if (p.gameId === 'CRICKET_COUNT_UP') {
      for (const round of p.data.rounds) {
        const hit = round.hits.includes(round.target) ? 1 : 0;
        add(String(round.target), hit, 1);
      }
    } else if (p.gameId === 'SHOOT_OUT') {
      for (const [num, stat] of Object.entries(p.data.numbers)) {
        add(num, stat.hit, stat.total);
      }
    }
  }

  const out: NumberWeakness[] = [];
  for (const [number, v] of tally.entries()) {
    if (v.total < MIN_ATTEMPTS) continue;
    out.push({ number, hitRate: round1((v.hit / v.total) * 100), attempts: v.total });
  }
  return out.sort((a, b) => a.hitRate - b.hitRate);
}

export function recommendFromWeakness(weaknesses: NumberWeakness[], limit = 2): string[] {
  return weaknesses.slice(0, limit).map((w) => `${w.number}を30本 (現在命中率 ${w.hitRate}%)`);
}
