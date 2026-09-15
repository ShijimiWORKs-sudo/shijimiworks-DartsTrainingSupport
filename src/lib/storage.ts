import type { DartsDatabase, MissionMaster, Settings } from '../types';
import { newId } from './id';
import { todayStr } from './dateUtils';

const STORAGE_KEY = 'darts-training-support/db';
const SCHEMA_VERSION = 1;

/**
 * Initial mission list, verbatim from 開発指示書 §10.
 */
const INITIAL_MISSIONS: string[] = [
  'COUNT-UPを1回',
  'COUNT-UPでBULLへ1本入れる',
  'LOWTONを出す',
  'HATTRICKを出す',
  'LIVE MATCHを1回',
  'LIVE MATCHを2回',
  '01を1回',
];

/**
 * User's baseline values at the start of using this app (開発指示書 §5).
 * Editable in Settings — never hardcoded into logic, only used as a seed.
 */
function defaultSettings(): Settings {
  return {
    userName: '',
    baseline: {
      flight: 'CC',
      rating: 5.39,
      zeroOne: 56.1,
      cricket: 2.02,
      countUp: 412.2,
      recordedAt: todayStr(),
    },
    defaultPracticeMinutes: 60,
  };
}

function defaultMissionMaster(): MissionMaster[] {
  const now = new Date().toISOString();
  return INITIAL_MISSIONS.map((name) => ({
    id: newId('mission'),
    name,
    active: true,
    isCustom: false,
    createdAt: now,
  }));
}

function emptyDb(): DartsDatabase {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: defaultSettings(),
    missionMaster: defaultMissionMaster(),
    dailyMissions: [],
    practiceSessions: [],
    gameResults: [],
    dailyStats: [],
  };
}

function migrate(raw: unknown): DartsDatabase {
  if (!raw || typeof raw !== 'object') return emptyDb();
  const db = raw as Partial<DartsDatabase>;
  const base = emptyDb();
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...(db.settings ?? {}) },
    missionMaster: db.missionMaster?.length ? db.missionMaster : base.missionMaster,
    dailyMissions: db.dailyMissions ?? [],
    practiceSessions: db.practiceSessions ?? [],
    gameResults: db.gameResults ?? [],
    dailyStats: db.dailyStats ?? [],
  };
}

let cache: DartsDatabase | null = null;

export function loadDb(): DartsDatabase {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? migrate(JSON.parse(raw)) : emptyDb();
  } catch (err) {
    console.error('Failed to load darts-training-support data, starting fresh.', err);
    cache = emptyDb();
  }
  return cache;
}

export function saveDb(db: DartsDatabase): void {
  cache = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save darts-training-support data.', err);
  }
}

/** Only for tests / "reset app" — wipes everything back to defaults. */
export function resetDb(): DartsDatabase {
  cache = emptyDb();
  saveDb(cache);
  return cache;
}

export function exportJson(): string {
  return JSON.stringify(loadDb(), null, 2);
}

export interface ImportResult {
  ok: boolean;
  error?: string;
}

export function importJson(json: string): ImportResult {
  try {
    const parsed = JSON.parse(json);
    const db = migrate(parsed);
    saveDb(db);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function backupFileName(): string {
  return `darts-training-backup-${todayStr()}.json`;
}
