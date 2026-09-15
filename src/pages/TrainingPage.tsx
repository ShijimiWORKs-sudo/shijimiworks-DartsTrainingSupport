import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { BigButton } from '../components/ui/BigButton';
import { SegmentedControl } from '../components/ui/Stepper';
import { getGameMaster, RATING_IMPACT_LABEL } from '../lib/gameMaster';
import { latestDailyStats } from '../lib/engine';
import { MISSION_MASTER_BY_ID } from '../lib/missionLookup';
import { todayStr } from '../lib/dateUtils';
import type { FatigueLevel, PracticeMinutes } from '../types';

const MINUTE_OPTIONS: { value: PracticeMinutes; label: string }[] = [
  { value: 30, label: '30分' },
  { value: 60, label: '60分' },
  { value: 90, label: '90分' },
  { value: 120, label: '120分' },
];

const FATIGUE_OPTIONS: { value: FatigueLevel; label: string }[] = [
  { value: 'GREAT', label: '絶好調' },
  { value: 'NORMAL', label: '普通' },
  { value: 'TIRED', label: '疲れている' },
];

export function TrainingPage() {
  const db = useStore((s) => s.db);
  const startSession = useStore((s) => s.startSession);
  const endSession = useStore((s) => s.endSession);
  const currentSession = useStore((s) => s.currentSession)();
  const navigate = useNavigate();

  const latest = latestDailyStats(db.dailyStats);
  const flight = latest?.flight ?? db.settings.baseline.flight;

  const [minutes, setMinutes] = useState<PracticeMinutes>(db.settings.defaultPracticeMinutes);
  const [fatigue, setFatigue] = useState<FatigueLevel>('NORMAL');

  const today = todayStr();
  const todaysMissions = db.dailyMissions
    .filter((m) => m.date === today)
    .map((m) => ({ ...m, mission: MISSION_MASTER_BY_ID(db.missionMaster, m.missionId) }));

  if (!currentSession) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-xl font-extrabold text-ink-900">今日の練習メニュー</h1>
          <p className="text-sm text-ink-900/50">練習時間と体調に合わせてメニューを自動生成します（現在: {flight}）</p>
        </header>

        <Card>
          <SectionTitle>練習時間</SectionTitle>
          <SegmentedControl value={minutes} onChange={setMinutes} options={MINUTE_OPTIONS} />
        </Card>

        <Card>
          <SectionTitle>今日の体調</SectionTitle>
          <SegmentedControl value={fatigue} onChange={setFatigue} options={FATIGUE_OPTIONS} />
        </Card>

        <BigButton
          size="lg"
          onClick={() => startSession({ minutes, fatigue, flight })}
        >
          このメニューで練習を開始
        </BigButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">TODAY'S TRAINING</h1>
        <p className="text-sm text-ink-900/50">
          {currentSession.plannedMinutes}分 / {FATIGUE_OPTIONS.find((f) => f.value === currentSession.fatigue)?.label}
        </p>
      </header>

      <Card>
        <SectionTitle>Mission</SectionTitle>
        {todaysMissions.length === 0 ? (
          <p className="text-sm text-ink-900/50">ミッションが選ばれていません。</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {todaysMissions.map((m) => (
              <li key={m.id} className="text-sm text-ink-900/80">
                {m.status === 'DONE' ? '☑' : m.status === 'SKIPPED' ? '⏭' : '☐'} {m.mission?.name}
              </li>
            ))}
          </ul>
        )}
        <Link to="/missions" className="text-xs font-bold text-brand-600 inline-block mt-2">
          ミッションを更新する →
        </Link>
      </Card>

      {currentSession.menu
        .filter((item) => item.step !== 'A_MISSION')
        .map((item) => (
          <Card key={item.step}>
            <SectionTitle>{item.label}</SectionTitle>
            <ul className="flex flex-col gap-2">
              {item.gameIds.map((gameId) => {
                const master = getGameMaster(gameId);
                const done = item.completedGameIds.includes(gameId);
                return (
                  <li key={gameId}>
                    <Link
                      to={`/play/${currentSession.id}/${gameId}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-ink-900/[0.03] px-3 py-3 min-h-[52px] touch-manipulation active:bg-ink-900/[0.06]"
                    >
                      <div>
                        <div className="text-sm font-bold text-ink-900/85">{master.nameJa}</div>
                        <div className="text-[11px] text-ink-900/40">
                          {master.purpose} ・ {RATING_IMPACT_LABEL[master.ratingImpact]}
                        </div>
                      </div>
                      <span className={done ? 'text-good text-lg' : 'text-ink-900/25 text-lg'}>
                        {done ? '✓' : '›'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}

      <BigButton
        size="lg"
        variant="secondary"
        onClick={() => {
          endSession(currentSession.id);
          navigate(`/daily-close`);
        }}
      >
        練習を終了する
      </BigButton>
    </div>
  );
}
