import clsx from 'clsx';
import type { DiffDirection } from '../../lib/engine';

const DIFF_STYLE: Record<DiffDirection, string> = {
  UP: 'text-good',
  DOWN: 'text-bad',
  FLAT: 'text-flat',
};

const DIFF_ARROW: Record<DiffDirection, string> = {
  UP: '↑',
  DOWN: '↓',
  FLAT: '→',
};

export function StatTile({
  label,
  value,
  unit,
  diffLabel,
  diffDirection,
  big,
}: {
  label: string;
  value: string | number;
  unit?: string;
  diffLabel?: string;
  diffDirection?: DiffDirection;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white shadow-card border border-black/[0.04] px-4 py-3.5 flex flex-col gap-1 min-w-0">
      <span className="text-[11px] font-bold uppercase tracking-wide text-ink-900/45 truncate">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={clsx('font-extrabold tabular-nums text-ink-900', big ? 'text-3xl' : 'text-2xl')}>
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-ink-900/40">{unit}</span>}
      </div>
      {diffLabel && diffDirection && (
        <span className={clsx('text-xs font-bold', DIFF_STYLE[diffDirection])}>
          {diffLabel} {DIFF_ARROW[diffDirection]}
        </span>
      )}
    </div>
  );
}
