import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { StatTile } from '../components/ui/StatTile';
import { bigButtonClass } from '../components/ui/BigButton';
import { diffDirection, formatDiff, latestDailyStats, nextFlight, ratingTrend } from '../lib/engine';
import { MISSION_MASTER_BY_ID } from '../lib/missionLookup';
import { todayStr } from '../lib/dateUtils';

const TREND_LABEL: Record<string, string> = {
  UP: '直近は上昇傾向 ↑',
  DOWN: '直近は下降傾向 ↓',
  FLAT: '直近は変化なし →',
  UNKNOWN: 'まだ傾向を判定できるデータがありません',
};

export function DashboardPage() {
  const db = useStore((s) => s.db);
  const latest = latestDailyStats(db.dailyStats);

  const current = latest ?? {
    rating: db.settings.baseline.rating,
    flight: db.settings.baseline.flight,
    zeroOne: db.settings.baseline.zeroOne,
    cricket: db.settings.baseline.cricket,
    countUp: db.settings.baseline.countUp,
    bullRate: undefined as number | undefined,
  };

  const next = nextFlight(current.flight);
  const trend7 = ratingTrend(db.dailyStats, 7);
  const diff = latest?.diffFromPrevious;

  const today = todayStr();
  const todaysMissions = db.dailyMissions
    .filter((m) => m.date === today)
    .map((m) => ({ ...m, mission: MISSION_MASTER_BY_ID(db.missionMaster, m.missionId) }));
  const missionDoneCount = todaysMissions.filter((m) => m.status === 'DONE').length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">ダッシュボード</h1>
        <p className="text-sm text-ink-900/50">
          {latest ? `最終更新: ${latest.date}` : 'まだ本日の記録がありません。初期値（設定のベースライン）を表示しています。'}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatTile
          label="CURRENT RATING"
          value={current.rating.toFixed(2)}
          diffLabel={diff ? formatDiff(diff.rating) : undefined}
          diffDirection={diff ? diffDirection(diff.rating) : undefined}
          big
        />
        <StatTile label="FLIGHT" value={current.flight} />
        <StatTile label="NEXT" value={next ?? '最高到達'} />
        <StatTile
          label="01"
          value={current.zeroOne.toFixed(2)}
          diffLabel={diff ? formatDiff(diff.zeroOne) : undefined}
          diffDirection={diff ? diffDirection(diff.zeroOne) : undefined}
        />
        <StatTile
          label="CRICKET"
          value={current.cricket.toFixed(2)}
          diffLabel={diff ? formatDiff(diff.cricket) : undefined}
          diffDirection={diff ? diffDirection(diff.cricket) : undefined}
        />
        <StatTile
          label="COUNT-UP"
          value={current.countUp.toFixed(1)}
          diffLabel={diff ? formatDiff(diff.countUp, 1) : undefined}
          diffDirection={diff ? diffDirection(diff.countUp) : undefined}
        />
        <StatTile label="BULL RATE" value={current.bullRate != null ? current.bullRate.toFixed(1) : '—'} unit="%" />
      </div>

      <Card>
        <SectionTitle>目標への進行</SectionTitle>
        <p className="text-sm text-ink-900/70">
          現在 <span className="font-bold">{current.flight}</span> → 次ランク{' '}
          <span className="font-bold">{next ?? 'SA（最終目標達成）'}</span>。最終目標は{' '}
          <span className="font-bold">SA</span> です。
        </p>
        <p className="text-xs text-ink-900/40 mt-1">{TREND_LABEL[trend7]}</p>
        <p className="text-[11px] text-ink-900/35 mt-2">
          ※ この進行表示はDARTSLIVE公式のランク判定を計算するものではありません。あなたが入力したRATING値の履歴を表示しているだけです。
        </p>
      </Card>

      <Card>
        <SectionTitle
          action={
            <Link to="/missions" className="text-xs font-bold text-brand-600">
              管理する
            </Link>
          }
        >
          今日のミッション
        </SectionTitle>
        {todaysMissions.length === 0 ? (
          <p className="text-sm text-ink-900/50">まだ今日のミッションが設定されていません。</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {todaysMissions.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm">
                <span>{m.status === 'DONE' ? '☑' : m.status === 'SKIPPED' ? '⏭' : '☐'}</span>
                <span className={m.status === 'DONE' ? 'text-ink-900/40 line-through' : 'text-ink-900/80'}>
                  {m.mission?.name ?? '（削除済み）'}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-1 text-xs text-ink-900/40">達成 {missionDoneCount}/{todaysMissions.length}</div>
      </Card>

      <Link to="/training" className={bigButtonClass({ size: 'lg', fullWidth: true })}>
        今日の練習を始める
      </Link>
    </div>
  );
}
