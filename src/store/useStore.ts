import { create } from 'zustand';
import type {
  DailyMissionEntry,
  DailyStats,
  DartsDatabase,
  FatigueLevel,
  GameId,
  GamePayload,
  GameResult,
  MissionStatus,
  PracticeMinutes,
  PracticeSession,
  RankFlight,
  Settings,
} from '../types';
import { loadDb, saveDb, exportJson, importJson, resetDb, type ImportResult } from '../lib/storage';
import { newId } from '../lib/id';
import { nowIso, todayStr } from '../lib/dateUtils';
import {
  computeDiff,
  generatePracticeMenu,
  markGameCompleted,
  pickMissions,
  type MissionSelectMode,
} from '../lib/engine';

interface StoreState {
  db: DartsDatabase;

  // settings
  updateSettings: (patch: Partial<Settings>) => void;

  // missions
  addCustomMission: (name: string) => void;
  setMissionActive: (missionId: string, active: boolean) => void;
  deleteMission: (missionId: string) => void;
  ensureTodaysMissions: (count?: number, mode?: MissionSelectMode) => void;
  regenerateTodaysMissions: (count?: number, mode?: MissionSelectMode) => void;
  setMissionStatus: (entryId: string, status: MissionStatus) => void;
  todaysMissionEntries: () => DailyMissionEntry[];

  // sessions
  currentSession: () => PracticeSession | undefined;
  startSession: (opts: { minutes: PracticeMinutes; fatigue: FatigueLevel; flight: RankFlight }) => string;
  endSession: (sessionId: string, memo?: string) => void;

  // game results
  addGameResult: (sessionId: string | null, payload: GamePayload, extra?: { purpose?: string; selfRating?: 1 | 2 | 3 | 4 | 5; memo?: string }) => string;

  // daily stats
  saveDailyStats: (input: {
    date?: string;
    rating: number;
    flight: RankFlight;
    zeroOne: number;
    cricket: number;
    countUp: number;
    memo?: string;
  }) => DailyStats;

  // backup
  exportBackup: () => string;
  importBackup: (json: string) => ImportResult;
  resetAll: () => void;
}

function persist(db: DartsDatabase) {
  saveDb(db);
}

export const useStore = create<StoreState>((set, get) => ({
  db: loadDb(),

  updateSettings: (patch) =>
    set((s) => {
      const db = { ...s.db, settings: { ...s.db.settings, ...patch } };
      persist(db);
      return { db };
    }),

  addCustomMission: (name) =>
    set((s) => {
      const trimmed = name.trim();
      if (!trimmed) return s;
      const db = {
        ...s.db,
        missionMaster: [
          ...s.db.missionMaster,
          { id: newId('mission'), name: trimmed, active: true, isCustom: true, createdAt: nowIso() },
        ],
      };
      persist(db);
      return { db };
    }),

  setMissionActive: (missionId, active) =>
    set((s) => {
      const db = {
        ...s.db,
        missionMaster: s.db.missionMaster.map((m) => (m.id === missionId ? { ...m, active } : m)),
      };
      persist(db);
      return { db };
    }),

  deleteMission: (missionId) =>
    set((s) => {
      const db = { ...s.db, missionMaster: s.db.missionMaster.filter((m) => m.id !== missionId) };
      persist(db);
      return { db };
    }),

  ensureTodaysMissions: (count = 3, mode = 'RANDOM') =>
    set((s) => {
      const date = todayStr();
      const already = s.db.dailyMissions.some((e) => e.date === date);
      if (already) return s;
      const picked = pickMissions(s.db.missionMaster, s.db.dailyMissions, count, mode);
      const newEntries: DailyMissionEntry[] = picked.map((m) => ({
        id: newId('dm'),
        missionId: m.id,
        date,
        status: 'PENDING',
      }));
      const db = {
        ...s.db,
        dailyMissions: [...s.db.dailyMissions, ...newEntries],
        missionMaster: s.db.missionMaster.map((m) =>
          picked.some((p) => p.id === m.id) ? { ...m, lastAssignedAt: nowIso() } : m,
        ),
      };
      persist(db);
      return { db };
    }),

  regenerateTodaysMissions: (count = 3, mode = 'RANDOM') =>
    set((s) => {
      const date = todayStr();
      const picked = pickMissions(s.db.missionMaster, s.db.dailyMissions, count, mode);
      const newEntries: DailyMissionEntry[] = picked.map((m) => ({
        id: newId('dm'),
        missionId: m.id,
        date,
        status: 'PENDING',
      }));
      const db = {
        ...s.db,
        dailyMissions: [...s.db.dailyMissions.filter((e) => e.date !== date), ...newEntries],
        missionMaster: s.db.missionMaster.map((m) =>
          picked.some((p) => p.id === m.id) ? { ...m, lastAssignedAt: nowIso() } : m,
        ),
      };
      persist(db);
      return { db };
    }),

  setMissionStatus: (entryId, status) =>
    set((s) => {
      const db = {
        ...s.db,
        dailyMissions: s.db.dailyMissions.map((e) => (e.id === entryId ? { ...e, status } : e)),
      };
      persist(db);
      return { db };
    }),

  todaysMissionEntries: () => {
    const date = todayStr();
    return get().db.dailyMissions.filter((e) => e.date === date);
  },

  currentSession: () => {
    const date = todayStr();
    return [...get().db.practiceSessions]
      .filter((sess) => sess.date === date && !sess.endedAt)
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0];
  },

  startSession: ({ minutes, fatigue, flight }) => {
    const id = newId('session');
    const date = todayStr();
    const menu = generatePracticeMenu({ flight, minutes, fatigue });
    const session: PracticeSession = {
      id,
      date,
      startedAt: nowIso(),
      plannedMinutes: minutes,
      fatigue,
      flightAtStart: flight,
      menu,
      gameResultIds: [],
      missionEntryIds: get()
        .db.dailyMissions.filter((e) => e.date === date)
        .map((e) => e.id),
    };
    set((s) => {
      const db = { ...s.db, practiceSessions: [...s.db.practiceSessions, session] };
      persist(db);
      return { db };
    });
    return id;
  },

  endSession: (sessionId, memo) =>
    set((s) => {
      const db = {
        ...s.db,
        practiceSessions: s.db.practiceSessions.map((sess) =>
          sess.id === sessionId ? { ...sess, endedAt: nowIso(), memo: memo ?? sess.memo } : sess,
        ),
      };
      persist(db);
      return { db };
    }),

  addGameResult: (sessionId, payload, extra) => {
    const id = newId('result');
    const result: GameResult = {
      id,
      sessionId,
      date: todayStr(),
      playedAt: nowIso(),
      purpose: extra?.purpose,
      selfRating: extra?.selfRating,
      memo: extra?.memo,
      payload,
    };
    set((s) => {
      const db: DartsDatabase = {
        ...s.db,
        gameResults: [...s.db.gameResults, result],
        practiceSessions: sessionId
          ? s.db.practiceSessions.map((sess) =>
              sess.id === sessionId
                ? {
                    ...sess,
                    gameResultIds: [...sess.gameResultIds, id],
                    menu: markGameCompleted(sess.menu, payload.gameId as GameId),
                  }
                : sess,
            )
          : s.db.practiceSessions,
      };
      persist(db);
      return { db };
    });
    return id;
  },

  saveDailyStats: (input) => {
    const date = input.date ?? todayStr();
    const state = get();
    const history = state.db.dailyStats.filter((d) => d.date !== date);
    const prevSorted = [...state.db.dailyStats].filter((d) => d.date < date).sort((a, b) => a.date.localeCompare(b.date));
    const prev = prevSorted.at(-1);

    const todaysSessions = state.db.practiceSessions.filter((s) => s.date === date);
    const practiceMinutes = todaysSessions.reduce((sum, s) => sum + s.plannedMinutes, 0);
    const gamesPlayed = state.db.gameResults.filter((r) => r.date === date).length;
    const missionEntries = state.db.dailyMissions.filter((m) => m.date === date);
    const missionCompleted = missionEntries.filter((m) => m.status === 'DONE').length;

    const eaglesEyeToday = state.db.gameResults.filter(
      (r) => r.date === date && r.payload.gameId === 'EAGLES_EYE',
    );
    let bullRate: number | undefined;
    if (eaglesEyeToday.length) {
      const totals = eaglesEyeToday.reduce(
        (acc, r) => {
          const d = r.payload.gameId === 'EAGLES_EYE' ? r.payload.data : null;
          if (!d) return acc;
          return { hit: acc.hit + d.dbull + d.sbull, total: acc.total + d.totalDarts };
        },
        { hit: 0, total: 0 },
      );
      bullRate = totals.total ? Math.round((totals.hit / totals.total) * 1000) / 10 : undefined;
    }

    const stats: DailyStats = {
      date,
      rating: input.rating,
      flight: input.flight,
      zeroOne: input.zeroOne,
      cricket: input.cricket,
      countUp: input.countUp,
      bullRate,
      practiceMinutes,
      gamesPlayed,
      missionCompleted,
      missionTotal: missionEntries.length,
      memo: input.memo,
      diffFromPrevious: computeDiff(prev, input),
    };

    set(() => {
      const db = { ...state.db, dailyStats: [...history, stats] };
      persist(db);
      return { db };
    });

    return stats;
  },

  exportBackup: () => exportJson(),

  importBackup: (json) => {
    const res = importJson(json);
    if (res.ok) set({ db: loadDb() });
    return res;
  },

  resetAll: () => set({ db: resetDb() }),
}));
