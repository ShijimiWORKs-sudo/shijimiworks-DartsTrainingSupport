import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { analyzeWeakness, recommendFromWeakness } from '../lib/engine';
import { numberPracticeStats } from '../lib/gameCalc';
import type { NumberPracticeSet, PracticeNumber } from '../types';

const PRACTICE_NUMBERS: PracticeNumber[] = [20, 19, 18, 17, 16, 15];

export function WeaknessPage() {
  const gameResults = useStore((s) => s.db.gameResults);

  const weaknesses = useMemo(() => analyzeWeakness(gameResults, 30), [gameResults]);
  const recommendations = useMemo(() => recommendFromWeakness(weaknesses, 3), [weaknesses]);

  const numberPracticeTotals = useMemo(() => {
    const totals = new Map<PracticeNumber, NumberPracticeSet>();
    for (const n of PRACTICE_NUMBERS) totals.set(n, { target: n, darts: 0, single: 0, double: 0, triple: 0, miss: 0 });
    for (const r of gameResults) {
      if (r.payload.gameId !== 'NUMBER_PRACTICE') continue;
      for (const set of r.payload.data.sets) {
        const cur = totals.get(set.target);
        if (!cur) continue;
        cur.darts += set.darts;
        cur.single += set.single;
        cur.double += set.double;
        cur.triple += set.triple;
        cur.miss += set.miss;
      }
    }
    return totals;
  }, [gameResults]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">弱点分析</h1>
        <p className="text-sm text-ink-900/50">直近30日間の記録から、命中率の低いナンバーを抽出します（§34）。</p>
      </header>

      <Card>
        <SectionTitle>現在の弱点</SectionTitle>
        {weaknesses.length === 0 ? (
          <p className="text-sm text-ink-900/50">
            まだ弱点を判定できるデータがありません（NUMBER PRACTICE / CRICKET COUNT-UP / SHOOT OUTを一定数記録すると表示されます）。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {weaknesses.slice(0, 8).map((w) => (
              <li key={w.number} className="flex items-center justify-between rounded-lg bg-ink-900/[0.03] px-3 py-2.5">
                <span className="font-bold text-ink-900/85">{w.number}</span>
                <span className="text-sm text-ink-900/60">
                  命中率 <span className="font-extrabold text-ink-900">{w.hitRate}%</span>（{w.attempts}本）
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle>おすすめ練習</SectionTitle>
        {recommendations.length === 0 ? (
          <p className="text-sm text-ink-900/50">データが集まるとここにおすすめが表示されます。</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {recommendations.map((rec) => (
              <li key={rec} className="text-sm font-medium text-ink-900/80">
                → {rec}
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-ink-900/35 mt-2">
          ※ これはアプリ独自の練習提案（予測）です。DARTSLIVE公式のレーティング判定とは無関係です（§57）。
        </p>
      </Card>

      <Card>
        <SectionTitle>1501 NUMBER PRACTICE 累計 (20〜15)</SectionTitle>
        <div className="flex flex-col divide-y divide-ink-900/5">
          <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-2 pb-1.5 text-[11px] font-bold text-ink-900/40 uppercase">
            <span>NUM</span>
            <span className="text-center">本数</span>
            <span className="text-center">HIT RATE</span>
            <span className="text-center">TRIPLE RATE</span>
          </div>
          {PRACTICE_NUMBERS.map((n) => {
            const set = numberPracticeTotals.get(n)!;
            const stats = numberPracticeStats(set);
            return (
              <div key={n} className="grid grid-cols-[2.5rem_1fr_1fr_1fr] items-center gap-2 py-2">
                <span className="text-sm font-extrabold text-ink-900/80">{n}</span>
                <span className="text-center text-sm text-ink-900/60">{set.darts}</span>
                <span className="text-center text-sm font-bold text-ink-900/80">{stats.hitRate}%</span>
                <span className="text-center text-sm font-bold text-ink-900/80">{stats.tripleRate}%</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
