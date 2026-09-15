import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { diffDirection, formatDiff } from '../lib/engine';
import { formatDateJa } from '../lib/dateUtils';

export function HistoryPage() {
  const dailyStats = useStore((s) => s.db.dailyStats);
  const sorted = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">履歴</h1>
          <p className="text-sm text-ink-900/50">日付ごとのRATING・01・CRICKET・COUNT-UPの記録</p>
        </div>
        <Link to="/charts" className="text-xs font-bold text-brand-600">
          グラフを見る →
        </Link>
      </header>

      {sorted.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-900/50">まだ記録がありません。練習を終了するとここに記録されます。</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((d) => (
            <Card key={d.date} padded={false} className="px-4 py-3.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-ink-900/85">{formatDateJa(d.date)}</div>
                <div className="text-xs font-bold text-brand-600">{d.flight}</div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                <MiniStat label="RATING" value={d.rating.toFixed(2)} diff={d.diffFromPrevious?.rating} />
                <MiniStat label="01" value={d.zeroOne.toFixed(2)} diff={d.diffFromPrevious?.zeroOne} />
                <MiniStat label="CRICKET" value={d.cricket.toFixed(2)} diff={d.diffFromPrevious?.cricket} />
                <MiniStat label="COUNT-UP" value={d.countUp.toFixed(1)} diff={d.diffFromPrevious?.countUp} digits={1} />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-900/40">
                <span>練習 {d.practiceMinutes}分</span>
                <span>ゲーム {d.gamesPlayed}回</span>
                <span>ミッション {d.missionCompleted}/{d.missionTotal}</span>
                {d.bullRate != null && <span>BULL率 {d.bullRate.toFixed(1)}%</span>}
              </div>
              {d.memo && <p className="mt-1.5 text-xs text-ink-900/50">{d.memo}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, diff, digits = 2 }: { label: string; value: string; diff?: number; digits?: number }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-ink-900/35 uppercase">{label}</div>
      <div className="text-sm font-extrabold text-ink-900">{value}</div>
      {diff != null && (
        <div className={'text-[11px] font-bold ' + (diffDirection(diff) === 'UP' ? 'text-good' : diffDirection(diff) === 'DOWN' ? 'text-bad' : 'text-flat')}>
          {formatDiff(diff, digits)}
        </div>
      )}
    </div>
  );
}
