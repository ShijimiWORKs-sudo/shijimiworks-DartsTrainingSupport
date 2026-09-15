import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from './useStore';

beforeEach(() => {
  localStorage.clear();
  useStore.getState().resetAll();
});

describe('mission master CRUD (§9, §10, §11, §50)', () => {
  it('adds a custom mission and it becomes selectable', () => {
    useStore.getState().addCustomMission('19に10本入れる');
    const names = useStore.getState().db.missionMaster.map((m) => m.name);
    expect(names).toContain('19に10本入れる');
  });

  it('ignores blank input', () => {
    const before = useStore.getState().db.missionMaster.length;
    useStore.getState().addCustomMission('   ');
    expect(useStore.getState().db.missionMaster.length).toBe(before);
  });

  it('deletes a mission from the master list', () => {
    useStore.getState().addCustomMission('テストミッション');
    const target = useStore.getState().db.missionMaster.find((m) => m.name === 'テストミッション')!;
    useStore.getState().deleteMission(target.id);
    expect(useStore.getState().db.missionMaster.some((m) => m.id === target.id)).toBe(false);
  });

  it('assigns and completes today\'s missions', () => {
    useStore.getState().ensureTodaysMissions(3, 'RANDOM');
    const entries = useStore.getState().todaysMissionEntries();
    expect(entries.length).toBeGreaterThan(0);
    useStore.getState().setMissionStatus(entries[0].id, 'DONE');
    const updated = useStore.getState().todaysMissionEntries().find((e) => e.id === entries[0].id);
    expect(updated?.status).toBe('DONE');
  });

  it('does not re-assign missions twice in the same day unless regenerated', () => {
    useStore.getState().ensureTodaysMissions(3, 'RANDOM');
    const first = useStore.getState().todaysMissionEntries().map((e) => e.id);
    useStore.getState().ensureTodaysMissions(3, 'RANDOM');
    const second = useStore.getState().todaysMissionEntries().map((e) => e.id);
    expect(second).toEqual(first);
  });
});

describe('practice session + game results', () => {
  it('starting a session generates a menu and records game results against it', () => {
    const sessionId = useStore.getState().startSession({ minutes: 60, fatigue: 'NORMAL', flight: 'CC' });
    const session = useStore.getState().currentSession();
    expect(session?.id).toBe(sessionId);
    expect(session?.menu.length).toBeGreaterThan(1);

    useStore.getState().addGameResult(sessionId, {
      gameId: 'COUNT_UP',
      data: {
        score: 300,
        bullCount: 2,
        roundsOver100: 1,
        bestRound: 120,
        roundScores: [120, 40, 30, 20, 20, 20, 20, 30],
        bullByRound: [true, false, true, false, false, false, false, false],
      },
    });

    const updatedSession = useStore.getState().currentSession();
    expect(updatedSession?.gameResultIds.length).toBe(1);
    const warmUp = updatedSession?.menu.find((m) => m.step === 'B_WARMUP');
    expect(warmUp?.completedGameIds).toContain('COUNT_UP');
  });
});

describe('saveDailyStats (§30, §31, §43, §50)', () => {
  it('computes the diff against the previous day and stores derived fields', () => {
    useStore.getState().saveDailyStats({
      date: '2026-09-14',
      rating: 5.39,
      flight: 'CC',
      zeroOne: 56.1,
      cricket: 2.02,
      countUp: 412.2,
    });
    const today = useStore.getState().saveDailyStats({
      date: '2026-09-15',
      rating: 5.47,
      flight: 'CC',
      zeroOne: 56.8,
      cricket: 2.08,
      countUp: 421.3,
    });
    expect(today.diffFromPrevious).toEqual({ rating: 0.08, zeroOne: 0.7, cricket: 0.06, countUp: 9.1 });
  });

  it('upserts (re-saving the same date replaces it rather than duplicating)', () => {
    useStore.getState().saveDailyStats({ date: '2026-09-15', rating: 5, flight: 'CC', zeroOne: 50, cricket: 2, countUp: 400 });
    useStore.getState().saveDailyStats({ date: '2026-09-15', rating: 5.2, flight: 'CC', zeroOne: 51, cricket: 2, countUp: 400 });
    const entries = useStore.getState().db.dailyStats.filter((d) => d.date === '2026-09-15');
    expect(entries.length).toBe(1);
    expect(entries[0].rating).toBe(5.2);
  });
});

describe('backup export/import via the store', () => {
  it('round-trips the whole store through JSON', () => {
    useStore.getState().addCustomMission('バックアップテスト');
    const json = useStore.getState().exportBackup();
    useStore.getState().resetAll();
    expect(useStore.getState().db.missionMaster.some((m) => m.name === 'バックアップテスト')).toBe(false);
    const result = useStore.getState().importBackup(json);
    expect(result.ok).toBe(true);
    expect(useStore.getState().db.missionMaster.some((m) => m.name === 'バックアップテスト')).toBe(true);
  });
});
