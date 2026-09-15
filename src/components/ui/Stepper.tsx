import clsx from 'clsx';

// Tailwind needs static class names to scan — a template literal like
// `grid-cols-${n}` would not get generated, so map to literals instead.
const GRID_COLS_CLASS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

/** Large tap-friendly +/- numeric stepper — avoids fiddly keyboard entry (§47). */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-medium text-ink-900/80 shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label} を減らす`}
          className="h-11 w-11 rounded-full bg-ink-900/5 text-xl font-bold text-ink-900 active:bg-ink-900/15 touch-manipulation"
          onClick={() => onChange(clamp(value - step))}
        >
          −
        </button>
        <div className="min-w-[3.5rem] text-center text-2xl font-extrabold tabular-nums">
          {value}
          {suffix && <span className="text-xs font-medium text-ink-900/50 ml-0.5">{suffix}</span>}
        </div>
        <button
          type="button"
          aria-label={`${label} を増やす`}
          className="h-11 w-11 rounded-full bg-brand-500 text-xl font-bold text-white active:bg-brand-600 touch-manipulation"
          onClick={() => onChange(clamp(value + step))}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function SegmentedControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="py-2">
      {label && <div className="text-sm font-medium text-ink-900/80 mb-1.5">{label}</div>}
      <div className={clsx('grid gap-1.5', GRID_COLS_CLASS[Math.min(options.length, 4)])}>

        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={clsx(
              'min-h-[44px] rounded-lg text-sm font-bold touch-manipulation transition-colors',
              value === opt.value
                ? 'bg-brand-500 text-white'
                : 'bg-ink-900/5 text-ink-900/70 active:bg-ink-900/10',
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Small inline counter for dense per-number grids (STANDARD CRICKET, SHOOT OUT, ...). */
export function TinyCounter({
  label,
  value,
  onChange,
  max = 999,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`${label} を減らす`}
        className="h-8 w-8 shrink-0 rounded-md bg-ink-900/5 text-sm font-bold text-ink-900 active:bg-ink-900/15 touch-manipulation"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        −
      </button>
      <div className="w-6 text-center text-sm font-bold tabular-nums">{value}</div>
      <button
        type="button"
        aria-label={`${label} を増やす`}
        className="h-8 w-8 shrink-0 rounded-md bg-brand-500/90 text-sm font-bold text-white active:bg-brand-600 touch-manipulation"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}

/** Grid of TinyCounters per "number" key — used by STANDARD/HIDDEN CRICKET, SHOOT OUT. */
export function NumberStatGrid<K extends string | number>({
  numbers,
  columns,
  renderRow,
}: {
  numbers: K[];
  columns: { key: string; label: string }[];
  renderRow: (num: K) => { key: string; value: number; onChange: (v: number) => void }[];
}) {
  return (
    <div className="flex flex-col divide-y divide-ink-900/5">
      <div className="grid grid-cols-[2.5rem_1fr] gap-2 pb-1.5 text-[11px] font-bold text-ink-900/40 uppercase">
        <span>NUM</span>
        <div className={clsx('grid', GRID_COLS_CLASS[Math.min(columns.length, 4)] ?? 'grid-cols-3')}>
          {columns.map((c) => (
            <span key={c.key} className="text-center">
              {c.label}
            </span>
          ))}
        </div>
      </div>
      {numbers.map((num) => {
        const cells = renderRow(num);
        return (
          <div key={num} className="grid grid-cols-[2.5rem_1fr] items-center gap-2 py-1.5">
            <span className="text-sm font-extrabold text-ink-900/80">{num}</span>
            <div className={clsx('grid', GRID_COLS_CLASS[Math.min(cells.length, 4)] ?? 'grid-cols-3')}>
              {cells.map((cell) => (
                <div key={cell.key} className="flex justify-center">
                  <TinyCounter label={`${num} ${cell.key}`} value={cell.value} onChange={cell.onChange} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block py-2">
      <div className="text-sm font-medium text-ink-900/80 mb-1.5">{label}</div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full min-h-[48px] rounded-lg border border-ink-900/10 bg-white px-3 text-xl font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-900/40">{suffix}</span>
        )}
      </div>
    </label>
  );
}
