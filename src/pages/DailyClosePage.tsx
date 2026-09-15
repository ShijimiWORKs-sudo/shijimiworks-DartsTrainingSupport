import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { BigButton, bigButtonClass } from '../components/ui/BigButton';
import { NumberField, SegmentedControl } from '../components/ui/Stepper';
import { diffDirection, formatDiff, latestDailyStats } from '../lib/engine';
import { RANK_ORDER } from '../types';
import type { DailyStats } from '../types';
import { analyzeWeakness, recommendFromWeakness } from '../lib/engine';
import { todayStr } from '../lib/dateUtils';

const FLIGHT_OPTIONS = RANK_ORDER.map((f) => ({ value: f, label: f }));

export function DailyClosePage() {
  const db = useStore((s) => s.db);
  const saveDailyStats = useStore((s) => s.saveDailyStats);
  const latest = latestDailyStats(db.dailyStats);

  const [rating, setRating] = useState(latest?.rating ?? db.settings.baseline.rating);
  const [flight, setFlight] = useState(latest?.flight ?? db.settings.baseline.flight);
  const [zeroOne, setZeroOne] = useState(latest?.zeroOne ?? db.settings.baseline.zeroOne);
  const [cricket, setCricket] = useState(latest?.cricket ?? db.settings.baseline.cricket);
  const [countUp, setCountUp] = useState(latest?.countUp ?? db.settings.baseline.countUp);
  const [saved, setSaved] = useState<DailyStats | null>(null);

  const today = todayStr();
  const todaysResults = useMemo(() => db.gameResults.filter((r) => r.date === today), [db.gameResults, today]);
  const todaysSessions = useMemo(() => db.practiceSessions.filter((s) => s.date === today), [db.practiceSessions, today]);
  const practiceMinutesToday = todaysSessions.reduce((sum, s) => sum + s.plannedMinutes, 0);

  const bestResult = useMemo(() => {
    let best: { label: string; score: number } | null = null;
    for (const r of todaysResults) {
      const score = 'score' in r.payload.data ? (r.payload.data as { score: number }).score : undefined;
      if (typeof score === 'number' && (!best || score > best.score)) {
        best = { label: r.payload.gameId, score };
      }
    }
    return best;
  }, [todaysResults]);

  const weaknesses = useMemo(() => analyzeWeakness(db.gameResults), [db.gameResults]);
  const recommendations = recommendFromWeakness(weaknesses);

  function handleSave() {
    const stats = saveDailyStats({ rating, flight, zeroOne, cricket, countUp });
    setSaved(stats);
  }

  if (saved) {
    const diff = saved.diffFromPrevious;
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-xl font-extrabold text-ink-900">TODAY COMPLETE</h1>
          <p className="text-sm text-ink-900/50">{saved.date}</p>
        </header>

        <Card>
          <SectionTitle>Practice</SectionTitle>
          <p className="text-2xl font-extrabold">{practiceMinutesToday} min</p>
          <p className="text-sm text-ink-900/50 mt-1">Mission {saved.missionCompleted} / {saved.missionTotal} COMPLETE</p>
        </Card>

        <Card>
          <SectionTitle>変化</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <DiffRow label="Rating" from={latest?.rating} to={saved.rating} diff={diff?.rating} />
            <DiffRow label="01" from={latest?.zeroOne} to={saved.zeroOne} diff={diff?.zeroOne} />
            <DiffRow label="Cricket" from={latest?.cricket} to={saved.cricket} diff={diff?.cricket} />
            <DiffRow label="Count-Up" from={latest?.countUp} to={saved.countUp} diff={diff?.countUp} digits={1} />
          </div>
        </Card>

        {bestResult && (
          <Card>
            <SectionTitle>Today's Best</SectionTitle>
            <p className="text-sm font-bold text-ink-900/80">
              {bestResult.label} {bestResult.score}
            </p>
          </Card>
        )}

        <Card>
          <SectionTitle>Weak Point / Tomorrow Recommendation</SectionTitle>
          {recommendations.length === 0 ? (
            <p className="text-sm text-ink-900/50">まだ弱点を判定できるデータがありません。</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recommendations.map((rec) => (
                <li key={rec} className="text-sm text-ink-900/80">
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Link to="/" className={bigButtonClass({ size: 'lg', fullWidth: true })}>
          ダッシュボードへ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">練習終了・DARTSLIVE最新値の入力</h1>
        <p className="text-sm text-ink-900/50">DARTSLIVEで確認した最新の値を入力してください。前回との差分を自動計算します。</p>
      </header>

      <Card>
        <NumberField label="RATING" value={rating} step={0.01} onChange={setRating} />
        <SegmentedControl label="FLIGHT" value={flight} onChange={setFlight} options={FLIGHT_OPTIONS} />
        <NumberField label="01" value={zeroOne} step={0.01} onChange={setZeroOne} />
        <NumberField label="CRICKET" value={cricket} step={0.01} onChange={setCricket} />
        <NumberField label="COUNT-UP" value={countUp} step={0.1} onChange={setCountUp} />
      </Card>

      <BigButton size="lg" onClick={handleSave}>
        保存して比較する
      </BigButton>
    </div>
  );
}

function DiffRow({
  label,
  from,
  to,
  diff,
  digits = 2,
}: {
  label: string;
  from?: number;
  to: number;
  diff?: number;
  digits?: number;
}) {
  return (
    <div>
      <div className="text-xs font-bold text-ink-900/40 uppercase">{label}</div>
      <div className="text-sm text-ink-900/60">
        {from != null ? from.toFixed(digits) : '—'} → <span className="font-extrabold text-ink-900">{to.toFixed(digits)}</span>
      </div>
      {diff != null && (
        <div className={'text-sm font-bold ' + (diffDirection(diff) === 'UP' ? 'text-good' : diffDirection(diff) === 'DOWN' ? 'text-bad' : 'text-flat')}>
          {formatDiff(diff, digits)}
        </div>
      )}
    </div>
  );
}
