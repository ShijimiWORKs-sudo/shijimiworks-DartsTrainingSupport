import { beforeEach, describe, expect, it } from 'vitest';
import { exportJson, importJson, loadDb, resetDb, saveDb } from './storage';

beforeEach(() => {
  localStorage.clear();
  resetDb();
});

describe('storage (§39, §40)', () => {
  it('seeds sensible defaults on first load (baseline values from §5, initial missions from §10)', () => {
    const db = loadDb();
    expect(db.settings.baseline).toEqual(
      expect.objectContaining({ flight: 'CC', rating: 5.39, zeroOne: 56.1, cricket: 2.02, countUp: 412.2 }),
    );
    expect(db.missionMaster.length).toBe(7);
    expect(db.missionMaster.map((m) => m.name)).toContain('COUNT-UPを1回');
  });

  it('round-trips through JSON export/import without losing data', () => {
    const db = loadDb();
    db.dailyStats.push({
      date: '2026-09-15',
      rating: 5.5,
      flight: 'CC',
      zeroOne: 57,
      cricket: 2.1,
      countUp: 420,
      practiceMinutes: 90,
      gamesPlayed: 6,
      missionCompleted: 2,
      missionTotal: 3,
    });
    saveDb(db);

    const json = exportJson();
    resetDb();
    expect(loadDb().dailyStats.length).toBe(0);

    const result = importJson(json);
    expect(result.ok).toBe(true);
    expect(loadDb().dailyStats.length).toBe(1);
    expect(loadDb().dailyStats[0].rating).toBe(5.5);
  });

  it('reports a clear failure for invalid JSON instead of throwing', () => {
    const result = importJson('{ not valid json');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
