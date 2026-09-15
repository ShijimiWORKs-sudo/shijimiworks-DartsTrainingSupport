import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { filterByRange, formatShort, RANGE_LABELS, type RangeKey } from '../lib/dateUtils';

const RANGE_KEYS: RangeKey[] = ['7d', '30d', '90d', 'all'];

function TrendChart({ data, dataKey, color, unit }: { data: { date: string; value: number }[]; dataKey: string; color: string; unit?: string }) {
  if (data.length < 2) {
    return <p className="text-sm text-ink-900/40 py-8 text-center">グラフを表示するにはもう少しデータが必要です。</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#9aa3b2' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9aa3b2' }} axisLine={false} tickLine={false} width={40} domain={['auto', 'auto']} />
        <Tooltip
          labelFormatter={(v) => formatShort(String(v))}
          formatter={(v: unknown) => [`${v}${unit ?? ''}`, dataKey] as [string, string]}
          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name={dataKey} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ChartsPage() {
  const dailyStats = useStore((s) => s.db.dailyStats);
  const [range, setRange] = useState<RangeKey>('30d');

  const filtered = useMemo(
    () => filterByRange(dailyStats, range).sort((a, b) => a.date.localeCompare(b.date)),
    [dailyStats, range],
  );

  const ratingData = filtered.map((d) => ({ date: d.date, value: d.rating }));
  const zeroOneData = filtered.map((d) => ({ date: d.date, value: d.zeroOne }));
  const cricketData = filtered.map((d) => ({ date: d.date, value: d.cricket }));
  const countUpData = filtered.map((d) => ({ date: d.date, value: d.countUp }));
  const bullRateData = filtered.filter((d) => d.bullRate != null).map((d) => ({ date: d.date, value: d.bullRate as number }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">グラフ</h1>
        <p className="text-sm text-ink-900/50">RATING・01・CRICKET・COUNT-UP・BULL率の推移</p>
      </header>

      <div className="grid grid-cols-4 gap-1.5">
        {RANGE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={
              'min-h-[40px] rounded-lg text-sm font-bold touch-manipulation ' +
              (range === key ? 'bg-brand-500 text-white' : 'bg-ink-900/5 text-ink-900/60')
            }
          >
            {RANGE_LABELS[key]}
          </button>
        ))}
      </div>

      <Card>
        <SectionTitle>RATING推移</SectionTitle>
        <TrendChart data={ratingData} dataKey="RATING" color="#1d8cf0" />
      </Card>
      <Card>
        <SectionTitle>01推移</SectionTitle>
        <TrendChart data={zeroOneData} dataKey="01" color="#2fbf71" />
      </Card>
      <Card>
        <SectionTitle>CRICKET推移</SectionTitle>
        <TrendChart data={cricketData} dataKey="CRICKET (MPR)" color="#f0a71d" />
      </Card>
      <Card>
        <SectionTitle>COUNT-UP推移</SectionTitle>
        <TrendChart data={countUpData} dataKey="COUNT-UP" color="#ef4a5f" />
      </Card>
      <Card>
        <SectionTitle>BULL率</SectionTitle>
        <TrendChart data={bullRateData} dataKey="BULL RATE" color="#8b5cf6" unit="%" />
      </Card>
    </div>
  );
}
