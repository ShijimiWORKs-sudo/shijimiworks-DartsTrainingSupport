/**
 * Darts Training Support — core data model.
 *
 * Design notes (see 開発指示書 §57):
 *   - The DARTSLIVE "official" RATING / 01 / CRICKET / COUNT-UP values are
 *     never calculated by this app. They are values the user reads off the
 *     DARTSLIVE machine/app and types in here as-is (`DailyStats`).
 *   - Anything this app derives (weak points, recommended menus, trend
 *     deltas) is clearly a *derived* / *predicted* value and must never be
 *     presented as an official DARTSLIVE number.
 */

// ---------------------------------------------------------------------------
// Rating / Flight
// ---------------------------------------------------------------------------

export type RankFlight = 'C' | 'CC' | 'B' | 'BB' | 'A' | 'AA' | 'SA';

/** Ascending order, C (lowest) -> SA (highest). */
export const RANK_ORDER: RankFlight[] = ['C', 'CC', 'B', 'BB', 'A', 'AA', 'SA'];

// ---------------------------------------------------------------------------
// Settings / baseline
// ---------------------------------------------------------------------------

export interface BaselineSnapshot {
  flight: RankFlight;
  rating: number;
  zeroOne: number;
  cricket: number;
  countUp: number;
  recordedAt: string; // ISO date (YYYY-MM-DD)
}

export type PracticeMinutes = 30 | 60 | 90 | 120;
export type FatigueLevel = 'GREAT' | 'NORMAL' | 'TIRED';

export interface Settings {
  userName: string;
  baseline: BaselineSnapshot;
  defaultPracticeMinutes: PracticeMinutes;
}

// ---------------------------------------------------------------------------
// Game master (§13, §28)
// ---------------------------------------------------------------------------

export type GameId =
  | 'COUNT_UP'
  | 'CRICKET_COUNT_UP'
  | 'EAGLES_EYE'
  | 'SHOOT_OUT'
  | 'HALF_IT'
  | 'FINISH_TRAINER'
  | 'BIG_BULL'
  | 'ZERO_ONE'
  | 'STANDARD_CRICKET'
  | 'HIDDEN_CRICKET'
  | 'NUMBER_PRACTICE'
  | 'LIVE_MATCH';

/**
 * Whether a game session as logged in *this app* is treated as affecting
 * the official DARTSLIVE rating, pure technical practice, or unconfirmed.
 * This is the user's own classification from the spec (§28), not a claim
 * about DARTSLIVE's real algorithm.
 */
export type RatingImpact = 'PRACTICE_ONLY' | 'RATING_TARGET' | 'UNKNOWN';

export type MenuStep =
  | 'A_MISSION'
  | 'B_WARMUP'
  | 'C_BULL'
  | 'D_CRICKET_NUMBER'
  | 'E_NUMBER_VARIETY'
  | 'F_FINISH'
  | 'G_MATCH'
  | 'H_LIVE_MATCH';

export interface GameMasterEntry {
  id: GameId;
  nameJa: string;
  purpose: string;
  ratingImpact: RatingImpact;
  step: MenuStep;
}

// ---------------------------------------------------------------------------
// Missions (§9, §10, §11, §42)
// ---------------------------------------------------------------------------

export interface MissionMaster {
  id: string;
  name: string;
  active: boolean;
  isCustom: boolean;
  createdAt: string;
  lastAssignedAt?: string;
}

export type MissionStatus = 'PENDING' | 'DONE' | 'SKIPPED';

export interface DailyMissionEntry {
  id: string;
  missionId: string;
  date: string; // YYYY-MM-DD
  status: MissionStatus;
}

// ---------------------------------------------------------------------------
// Practice session (§8, §26, §36, §37, §48, §49)
// ---------------------------------------------------------------------------

export interface PracticeMenuItem {
  step: MenuStep;
  label: string;
  gameIds: GameId[];
  completedGameIds: GameId[];
}

export interface PracticeSession {
  id: string;
  date: string; // session date, fixed at start so a rollover past midnight doesn't break it (§49)
  startedAt: string;
  endedAt?: string;
  plannedMinutes: PracticeMinutes;
  fatigue: FatigueLevel;
  flightAtStart: RankFlight;
  menu: PracticeMenuItem[];
  gameResultIds: string[];
  missionEntryIds: string[];
  memo?: string;
}

// ---------------------------------------------------------------------------
// Per-game result payloads (§15-§25)
// ---------------------------------------------------------------------------

export interface CountUpResult {
  score: number;
  bullCount: number;
  roundsOver100: number;
  bestRound: number;
  roundScores: number[];
  bullByRound: boolean[];
}

export interface EaglesEyeResult {
  score: number;
  dbull: number;
  sbull: number;
  miss: number;
  hattrick: number;
  totalDarts: number;
}

export type CricketNumber = 20 | 19 | 18 | 17 | 16 | 15 | 'BULL';

export interface CricketCountUpRound {
  target: CricketNumber;
  hits: CricketNumber[]; // what actually landed, per dart thrown this round
}

export interface CricketCountUpResult {
  score: number;
  rounds: CricketCountUpRound[];
}

export type PracticeNumber = 20 | 19 | 18 | 17 | 16 | 15;

export interface NumberPracticeSet {
  target: PracticeNumber;
  darts: number;
  single: number;
  double: number;
  triple: number;
  miss: number;
}

export interface NumberPracticeResult {
  sets: NumberPracticeSet[];
}

export type ZeroOneGame = 301 | 501 | 701 | 901 | 1101 | 1501;
export type MatchResult = 'WIN' | 'LOSS' | 'N_A';

export interface ZeroOneResult {
  game: ZeroOneGame;
  darts: number;
  ppd: number;
  result: MatchResult;
  doubleOutSuccess: boolean;
  miss: number;
}

export interface NumberStat {
  single: number;
  double: number;
  triple: number;
}

export type CricketNumberKey = '20' | '19' | '18' | '17' | '16' | '15' | 'BULL';

export const CRICKET_NUMBER_KEYS: CricketNumberKey[] = [
  '20',
  '19',
  '18',
  '17',
  '16',
  '15',
  'BULL',
];

export interface StandardCricketResult {
  mpr: number;
  score: number;
  result: MatchResult;
  numbers: Record<CricketNumberKey, NumberStat>;
}

export interface HiddenCricketResult {
  score: number;
  numbers: Partial<Record<CricketNumberKey, NumberStat>>;
}

export interface ShootOutNumberStat {
  hit: number;
  total: number;
}

export interface ShootOutResult {
  numbers: Record<string, ShootOutNumberStat>; // '1'..'20','BULL'
}

export interface HalfItResult {
  score: number;
  miss: number;
  bull: number;
  highScore: number;
  rounds: number[];
}

export interface FinishTrainerAttempt {
  remaining: number;
  targetOut: string;
  success: boolean;
}

export interface FinishTrainerResult {
  attempts: FinishTrainerAttempt[];
}

export interface BigBullResult {
  bull: number;
  miss: number;
  score: number;
  totalDarts: number;
}

/** LIVE MATCH rules are fixed per §12: 01=701 / CRICKET=STANDARD CRICKET, OPEN IN, DOUBLE OUT, FULL BULL, no handicap. */
export interface LiveMatchResult {
  zeroOne: ZeroOneResult;
  standardCricket: StandardCricketResult;
  overallResult: 'WIN' | 'LOSS';
}

export type GamePayload =
  | { gameId: 'COUNT_UP'; data: CountUpResult }
  | { gameId: 'CRICKET_COUNT_UP'; data: CricketCountUpResult }
  | { gameId: 'EAGLES_EYE'; data: EaglesEyeResult }
  | { gameId: 'SHOOT_OUT'; data: ShootOutResult }
  | { gameId: 'HALF_IT'; data: HalfItResult }
  | { gameId: 'FINISH_TRAINER'; data: FinishTrainerResult }
  | { gameId: 'BIG_BULL'; data: BigBullResult }
  | { gameId: 'ZERO_ONE'; data: ZeroOneResult }
  | { gameId: 'STANDARD_CRICKET'; data: StandardCricketResult }
  | { gameId: 'HIDDEN_CRICKET'; data: HiddenCricketResult }
  | { gameId: 'NUMBER_PRACTICE'; data: NumberPracticeResult }
  | { gameId: 'LIVE_MATCH'; data: LiveMatchResult };

export interface GameResult {
  id: string;
  sessionId: string | null;
  date: string; // YYYY-MM-DD
  playedAt: string; // ISO datetime
  purpose?: string;
  selfRating?: 1 | 2 | 3 | 4 | 5;
  memo?: string;
  payload: GamePayload;
}

// ---------------------------------------------------------------------------
// Daily stats / history (§30, §31, §43)
// ---------------------------------------------------------------------------

export interface DailyStatsDiff {
  rating: number;
  zeroOne: number;
  cricket: number;
  countUp: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD, one entry per day (last write wins)
  rating: number;
  flight: RankFlight;
  zeroOne: number;
  cricket: number;
  countUp: number;
  bullRate?: number;
  practiceMinutes: number;
  gamesPlayed: number;
  missionCompleted: number;
  missionTotal: number;
  memo?: string;
  diffFromPrevious?: DailyStatsDiff;
}

// ---------------------------------------------------------------------------
// Whole-database shape, for JSON export/import (§40)
// ---------------------------------------------------------------------------

export interface DartsDatabase {
  schemaVersion: number;
  settings: Settings;
  missionMaster: MissionMaster[];
  dailyMissions: DailyMissionEntry[];
  practiceSessions: PracticeSession[];
  gameResults: GameResult[];
  dailyStats: DailyStats[];
}
