import { useState } from 'react';
import { Stepper, SegmentedControl, NumberField, NumberStatGrid, TinyCounter } from '../ui/Stepper';
import { bigBullStats, halfItStats, numberPracticeStats } from '../../lib/gameCalc';
import { CRICKET_NUMBER_KEYS, HALF_IT_TARGETS } from '../../types';
import type {
  BigBullResult,
  CountUpResult,
  CricketCountUpResult,
  CricketNumberKey,
  EaglesEyeResult,
  FinishTrainerAttempt,
  FinishTrainerResult,
  HalfItResult,
  HalfItRound,
  HiddenCricketEntry,
  HiddenCricketResult,
  LiveMatchResult,
  MatchResult,
  NumberPracticeMode,
  NumberPracticeResult,
  NumberPracticeSet,
  NumberStat,
  PracticeNumber,
  ShootOutHitType,
  ShootOutResult,
  StandardCricketResult,
  ZeroOneGame,
  ZeroOneResult,
} from '../../types';

const RESULT_OPTIONS: { value: MatchResult; label: string }[] = [
  { value: 'WIN', label: 'WIN' },
  { value: 'LOSS', label: 'LOSS' },
  { value: 'N_A', label: '該当なし' },
];

const NUMBER_PRACTICE_ORDER: Record<NumberPracticeMode, PracticeNumber[]> = {
  ROUND: [15, 16, 17, 18, 19, 20],
  GAME: [20, 19, 18, 17, 16, 15],
};

function emptyNumberStat(): NumberStat {
  return { single: 0, double: 0, triple: 0 };
}

function emptyStandardCricketNumbers(): Record<CricketNumberKey, NumberStat> {
  const out = {} as Record<CricketNumberKey, NumberStat>;
  for (const key of CRICKET_NUMBER_KEYS) out[key] = emptyNumberStat();
  return out;
}

// ---------------------------------------------------------------------------
// COUNT-UP (§15)
// ---------------------------------------------------------------------------

export function defaultCountUpResult(): CountUpResult {
  return {
    score: 0,
    bullCount: 0,
    roundsOver100: 0,
    bestRound: 0,
    roundScores: [0, 0, 0, 0, 0, 0, 0, 0],
    bullByRound: [false, false, false, false, false, false, false, false],
  };
}

export function CountUpForm({ value, onChange }: { value: CountUpResult; onChange: (v: CountUpResult) => void }) {
  return (
    <div>
      <NumberField label="SCORE (8ラウンド合計)" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />
      <div className="grid grid-cols-2 gap-x-4">
        <Stepper label="BULL数" value={value.bullCount} onChange={(v) => onChange({ ...value, bullCount: v })} />
        <Stepper
          label="100点以上ラウンド数"
          value={value.roundsOver100}
          onChange={(v) => onChange({ ...value, roundsOver100: v })}
        />
      </div>
      <Stepper label="最高ラウンド" value={value.bestRound} onChange={(v) => onChange({ ...value, bestRound: v })} />
      <div className="mt-3">
        <div className="text-sm font-medium text-ink-900/80 mb-2">各ラウンド：BULLあり？（8ラウンド最低1BULLの目標管理）</div>
        <div className="grid grid-cols-4 gap-2">
          {value.bullByRound.map((hit, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const next = [...value.bullByRound];
                next[i] = !next[i];
                onChange({ ...value, bullByRound: next });
              }}
              className={
                'min-h-[48px] rounded-lg text-sm font-bold touch-manipulation ' +
                (hit ? 'bg-good/15 text-good' : 'bg-ink-900/5 text-ink-900/40')
              }
            >
              R{i + 1} {hit ? '○' : '×'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EAGLE'S EYE / BIG BULL (§16, §25)
// ---------------------------------------------------------------------------

export function defaultEaglesEyeResult(): EaglesEyeResult {
  return { score: 0, dbull: 0, sbull: 0, miss: 0, hattrick: 0, totalDarts: 24 };
}

export function EaglesEyeForm({ value, onChange }: { value: EaglesEyeResult; onChange: (v: EaglesEyeResult) => void }) {
  return (
    <div>
      <NumberField label="SCORE" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />
      <NumberField label="総投球本数" value={value.totalDarts} onChange={(v) => onChange({ ...value, totalDarts: v })} />
      <Stepper label="DBULL" value={value.dbull} onChange={(v) => onChange({ ...value, dbull: v })} />
      <Stepper label="SBULL" value={value.sbull} onChange={(v) => onChange({ ...value, sbull: v })} />
      <Stepper label="MISS" value={value.miss} onChange={(v) => onChange({ ...value, miss: v })} />
      <Stepper label="HATTRICK" value={value.hattrick} onChange={(v) => onChange({ ...value, hattrick: v })} />
    </div>
  );
}

export function defaultBigBullResult(): BigBullResult {
  return { outerBull: 0, innerBull: 0, miss: 0, totalDarts: 24, finalScore: 0 };
}

export function BigBullForm({ value, onChange }: { value: BigBullResult; onChange: (v: BigBullResult) => void }) {
  const stats = bigBullStats(value);
  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">
        トリプルより内側はBULL判定です。OUTER BULL・トリプルより内側は50点、INNER BULLは70点（§25フィードバック）。
      </p>
      <NumberField label="最終得点" value={value.finalScore} onChange={(v) => onChange({ ...value, finalScore: v })} />
      <NumberField label="総投球本数" value={value.totalDarts} onChange={(v) => onChange({ ...value, totalDarts: v })} />
      <div className="grid grid-cols-2 gap-x-4">
        <Stepper label="OUTER BULL (50点)" value={value.outerBull} onChange={(v) => onChange({ ...value, outerBull: v })} />
        <Stepper label="INNER BULL (70点)" value={value.innerBull} onChange={(v) => onChange({ ...value, innerBull: v })} />
      </div>
      <Stepper label="MISS" value={value.miss} onChange={(v) => onChange({ ...value, miss: v })} />
      <div className="mt-2 rounded-lg bg-ink-900/[0.03] p-3 text-sm">
        <div className="text-xs font-bold text-ink-900/50 uppercase mb-1.5">STATS（アプリ独自集計）</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            BULL RATE <span className="font-extrabold text-ink-900">{stats.bullRate}%</span>
          </div>
          <div>
            INNER RATE <span className="font-extrabold text-ink-900">{stats.innerRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CRICKET COUNT-UP (§17) — 狙い/実際 を分離した集計入力
// ---------------------------------------------------------------------------

export interface CricketCountUpUi {
  score: number;
  byNumber: Record<CricketNumberKey, { targeted: number; hit: number }>;
}

export function defaultCricketCountUpUi(): CricketCountUpUi {
  const byNumber = {} as CricketCountUpUi['byNumber'];
  for (const key of CRICKET_NUMBER_KEYS) byNumber[key] = { targeted: 0, hit: 0 };
  return { score: 0, byNumber };
}

export function cricketCountUpUiToResult(ui: CricketCountUpUi): CricketCountUpResult {
  const rounds: CricketCountUpResult['rounds'] = [];
  for (const key of CRICKET_NUMBER_KEYS) {
    const target = key === 'BULL' ? ('BULL' as const) : (Number(key) as 20 | 19 | 18 | 17 | 16 | 15);
    const { targeted, hit } = ui.byNumber[key];
    for (let i = 0; i < targeted; i++) {
      rounds.push({ target, hits: i < hit ? [target] : [] });
    }
  }
  return { score: ui.score, rounds };
}

export function CricketCountUpForm({ value, onChange }: { value: CricketCountUpUi; onChange: (v: CricketCountUpUi) => void }) {
  return (
    <div>
      <NumberField label="SCORE" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />
      <p className="text-xs text-ink-900/40 mb-2">ナンバーごとに「狙った回数」と「実際に命中した回数」を分けて記録します（§17）。</p>
      <NumberStatGrid
        numbers={CRICKET_NUMBER_KEYS}
        columns={[
          { key: 'targeted', label: '狙い' },
          { key: 'hit', label: '命中' },
        ]}
        renderRow={(num) => [
          {
            key: 'targeted',
            value: value.byNumber[num].targeted,
            onChange: (v) =>
              onChange({ ...value, byNumber: { ...value.byNumber, [num]: { ...value.byNumber[num], targeted: v } } }),
          },
          {
            key: 'hit',
            value: value.byNumber[num].hit,
            onChange: (v) =>
              onChange({
                ...value,
                byNumber: {
                  ...value.byNumber,
                  [num]: { ...value.byNumber[num], hit: Math.min(v, value.byNumber[num].targeted) },
                },
              }),
          },
        ]}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1501 NUMBER PRACTICE (§18) — ROUND方式(15→20) / GAME方式(20→15) を選択可能
// ---------------------------------------------------------------------------

const NUMBER_PRACTICE_MODE_OPTIONS: { value: NumberPracticeMode; label: string }[] = [
  { value: 'ROUND', label: '① ROUND (15→20)' },
  { value: 'GAME', label: '② GAME (20→15)' },
];

export function defaultNumberPracticeResult(mode: NumberPracticeMode = 'GAME'): NumberPracticeResult {
  return {
    mode,
    sets: NUMBER_PRACTICE_ORDER[mode].map((target) => ({ target, darts: 0, single: 0, double: 0, triple: 0, miss: 0 })),
  };
}

function withComputedDarts(set: NumberPracticeSet): NumberPracticeSet {
  return { ...set, darts: set.single + set.double + set.triple + set.miss };
}

export function NumberPracticeForm({
  value,
  onChange,
}: {
  value: NumberPracticeResult;
  onChange: (v: NumberPracticeResult) => void;
}) {
  function updateSet(idx: number, patch: Partial<NumberPracticeSet>) {
    const sets = value.sets.map((s, i) => (i === idx ? withComputedDarts({ ...s, ...patch }) : s));
    onChange({ ...value, sets });
  }
  function changeMode(mode: NumberPracticeMode) {
    if (mode === value.mode) return;
    const order = NUMBER_PRACTICE_ORDER[mode];
    const byTarget = new Map(value.sets.map((s) => [s.target, s]));
    const sets = order.map((target) => byTarget.get(target) ?? { target, darts: 0, single: 0, double: 0, triple: 0, miss: 0 });
    onChange({ mode, sets });
  }

  const totals = value.sets.reduce(
    (acc, s) => ({ darts: acc.darts + s.darts, single: acc.single + s.single, double: acc.double + s.double, triple: acc.triple + s.triple, miss: acc.miss + s.miss }),
    { darts: 0, single: 0, double: 0, triple: 0, miss: 0 },
  );
  const overallHits = totals.single + totals.double + totals.triple;
  const overallHitRate = totals.darts ? Math.round((overallHits / totals.darts) * 1000) / 10 : 0;

  return (
    <div>
      <SegmentedControl label="練習方式" value={value.mode} onChange={changeMode} options={NUMBER_PRACTICE_MODE_OPTIONS} />
      <p className="text-xs text-ink-900/40 mb-2">
        {value.mode === 'ROUND'
          ? '①1ROUNDごとにナンバーを15→20の順で変えていく方式です（§18）。'
          : '②1GAMEを20→15の順で通して投げる方式です。STATSは自動計算されます（§18）。'}
        BULL練は別メニューのため対象外です。
      </p>
      <NumberStatGrid
        numbers={value.sets.map((s) => s.target)}
        columns={[
          { key: 'single', label: 'S' },
          { key: 'double', label: 'D' },
          { key: 'triple', label: 'T' },
          { key: 'miss', label: 'MISS' },
        ]}
        renderRow={(num) => {
          const idx = value.sets.findIndex((s) => s.target === num);
          const set = value.sets[idx];
          return [
            { key: 'single', value: set.single, onChange: (v: number) => updateSet(idx, { single: v }) },
            { key: 'double', value: set.double, onChange: (v: number) => updateSet(idx, { double: v }) },
            { key: 'triple', value: set.triple, onChange: (v: number) => updateSet(idx, { triple: v }) },
            { key: 'miss', value: set.miss, onChange: (v: number) => updateSet(idx, { miss: v }) },
          ];
        }}
      />
      <div className="mt-3 rounded-lg bg-ink-900/[0.03] p-3">
        <div className="text-xs font-bold text-ink-900/50 uppercase mb-1.5">STATS（アプリ独自集計）</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            合計本数 <span className="font-extrabold text-ink-900">{totals.darts}</span>
          </div>
          <div>
            全体HIT RATE <span className="font-extrabold text-ink-900">{overallHitRate}%</span>
          </div>
        </div>
        <div className="mt-2 flex flex-col divide-y divide-ink-900/5">
          {value.sets.map((set) => {
            const stats = numberPracticeStats(set);
            return (
              <div key={set.target} className="flex items-center justify-between py-1 text-xs text-ink-900/60">
                <span className="font-bold text-ink-900/80">{set.target}</span>
                <span>HIT {stats.hitRate}% / TRIPLE {stats.tripleRate}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 01 (§19)
// ---------------------------------------------------------------------------

const ZERO_ONE_GAMES: ZeroOneGame[] = [301, 501, 701, 901, 1101, 1501];

export function defaultZeroOneResult(game: ZeroOneGame = 501): ZeroOneResult {
  return { game, darts: 0, ppd: 0, result: 'N_A', doubleOutSuccess: false, miss: 0 };
}

export function ZeroOneForm({
  value,
  onChange,
  fixedGame,
  showResult = true,
}: {
  value: ZeroOneResult;
  onChange: (v: ZeroOneResult) => void;
  /** LIVE MATCHでは701固定（§12）。 */
  fixedGame?: ZeroOneGame;
  showResult?: boolean;
}) {
  return (
    <div>
      {fixedGame ? (
        <div className="mb-2 inline-block rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
          {fixedGame} (LIVE MATCH固定)
        </div>
      ) : (
        <SegmentedControl
          label="GAME"
          value={value.game}
          onChange={(g) => onChange({ ...value, game: g })}
          options={ZERO_ONE_GAMES.map((g) => ({ value: g, label: String(g) }))}
        />
      )}
      <div className="grid grid-cols-2 gap-x-4">
        <NumberField label="DARTS" value={value.darts} onChange={(v) => onChange({ ...value, darts: v })} />
        <NumberField label="PPD" value={value.ppd} step={0.1} onChange={(v) => onChange({ ...value, ppd: v })} />
      </div>
      <Stepper label="MISS" value={value.miss} onChange={(v) => onChange({ ...value, miss: v })} />
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-ink-900/80">DOUBLE OUT成功</span>
        <button
          type="button"
          onClick={() => onChange({ ...value, doubleOutSuccess: !value.doubleOutSuccess })}
          className={
            'min-h-[40px] px-4 rounded-lg text-sm font-bold touch-manipulation ' +
            (value.doubleOutSuccess ? 'bg-good/15 text-good' : 'bg-ink-900/5 text-ink-900/40')
          }
        >
          {value.doubleOutSuccess ? '成功' : '未成功'}
        </button>
      </div>
      {showResult && (
        <SegmentedControl label="WIN / LOSS" value={value.result} onChange={(r) => onChange({ ...value, result: r })} options={RESULT_OPTIONS} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STANDARD CRICKET (§20) / HIDDEN CRICKET (§21)
// ---------------------------------------------------------------------------

export function defaultStandardCricketResult(): StandardCricketResult {
  return { mpr: 0, score: 0, result: 'N_A', numbers: emptyStandardCricketNumbers() };
}

export function StandardCricketForm({
  value,
  onChange,
  showResult = true,
}: {
  value: StandardCricketResult;
  onChange: (v: StandardCricketResult) => void;
  showResult?: boolean;
}) {
  function updateNumber(key: CricketNumberKey, patch: Partial<NumberStat>) {
    onChange({ ...value, numbers: { ...value.numbers, [key]: { ...value.numbers[key], ...patch } } });
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4">
        <NumberField label="MPR" value={value.mpr} step={0.01} onChange={(v) => onChange({ ...value, mpr: v })} />
        <NumberField label="SCORE" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />
      </div>
      {showResult && (
        <SegmentedControl label="WIN / LOSS" value={value.result} onChange={(r) => onChange({ ...value, result: r })} options={RESULT_OPTIONS} />
      )}
      <div className="mt-2">
        <div className="text-sm font-medium text-ink-900/80 mb-1.5">ナンバー別 S / D / T</div>
        <NumberStatGrid
          numbers={CRICKET_NUMBER_KEYS}
          columns={[
            { key: 'single', label: 'S' },
            { key: 'double', label: 'D' },
            { key: 'triple', label: 'T' },
          ]}
          renderRow={(num) => [
            { key: 'single', value: value.numbers[num].single, onChange: (v: number) => updateNumber(num, { single: v }) },
            { key: 'double', value: value.numbers[num].double, onChange: (v: number) => updateNumber(num, { double: v }) },
            { key: 'triple', value: value.numbers[num].triple, onChange: (v: number) => updateNumber(num, { triple: v }) },
          ]}
        />
      </div>
    </div>
  );
}

const HIDDEN_CRICKET_PICKABLE = [...Array.from({ length: 20 }, (_, i) => String(20 - i)), 'BULL'];

export function defaultHiddenCricketResult(): HiddenCricketResult {
  return { score: 0, entries: [] };
}

export function HiddenCricketForm({ value, onChange }: { value: HiddenCricketResult; onChange: (v: HiddenCricketResult) => void }) {
  function addEntry(number: string) {
    if (value.entries.some((e) => e.number === number)) return;
    onChange({ ...value, entries: [...value.entries, { number, single: 0, double: 0, triple: 0 }] });
  }
  function updateEntry(idx: number, patch: Partial<HiddenCricketEntry>) {
    onChange({ ...value, entries: value.entries.map((e, i) => (i === idx ? { ...e, ...patch } : e)) });
  }
  function removeEntry(idx: number) {
    onChange({ ...value, entries: value.entries.filter((_, i) => i !== idx) });
  }
  const pickedNumbers = new Set(value.entries.map((e) => e.number));

  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">
        HIDDEN CRICKETは対象ナンバーが分からないまま進行するゲームです。ナンバーが判明したら下から選んで追加してください。1GAMEは20ROUNDで終了します（§21）。
      </p>
      <NumberField label="SCORE" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />

      <div className="mt-2 mb-3">
        <div className="text-sm font-medium text-ink-900/80 mb-1.5">判明したナンバーを追加</div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7">
          {HIDDEN_CRICKET_PICKABLE.map((num) => (
            <button
              key={num}
              type="button"
              disabled={pickedNumbers.has(num)}
              onClick={() => addEntry(num)}
              className={
                'min-h-[40px] rounded-lg text-xs font-bold touch-manipulation ' +
                (pickedNumbers.has(num) ? 'bg-ink-900/[0.03] text-ink-900/20' : 'bg-brand-50 text-brand-700 active:bg-brand-100')
              }
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {value.entries.length === 0 ? (
        <p className="text-sm text-ink-900/40">まだ追加されたナンバーがありません。</p>
      ) : (
        <div className="flex flex-col divide-y divide-ink-900/5">
          {value.entries.map((entry, idx) => (
            <div key={entry.number} className="flex items-center gap-2 py-1.5">
              <span className="w-10 shrink-0 text-sm font-extrabold text-ink-900/80">{entry.number}</span>
              <TinyCounter label={`${entry.number} S`} value={entry.single} onChange={(v) => updateEntry(idx, { single: v })} />
              <TinyCounter label={`${entry.number} D`} value={entry.double} onChange={(v) => updateEntry(idx, { double: v })} />
              <TinyCounter label={`${entry.number} T`} value={entry.triple} onChange={(v) => updateEntry(idx, { triple: v })} />
              <button
                type="button"
                aria-label={`${entry.number} を削除`}
                onClick={() => removeEntry(idx)}
                className="ml-auto min-h-[32px] min-w-[32px] rounded-md bg-bad/10 text-bad text-sm font-bold touch-manipulation"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHOOT OUT (§22) — 各ナンバー1投のOK/NG + 命中時のS/D/T
// ---------------------------------------------------------------------------

const SHOOT_OUT_NUMBERS = [...Array.from({ length: 20 }, (_, i) => String(20 - i)), 'BULL'];

const SHOOT_OUT_HIT_TYPE_OPTIONS: { value: ShootOutHitType; label: string }[] = [
  { value: 'SINGLE', label: 'S' },
  { value: 'DOUBLE', label: 'D' },
  { value: 'TRIPLE', label: 'T' },
];

export function defaultShootOutResult(): ShootOutResult {
  const numbers: ShootOutResult['numbers'] = {};
  for (const n of SHOOT_OUT_NUMBERS) numbers[n] = { hit: false };
  return { numbers, finalScore: 0 };
}

export function ShootOutForm({ value, onChange }: { value: ShootOutResult; onChange: (v: ShootOutResult) => void }) {
  function update(num: string, patch: Partial<ShootOutResult['numbers'][string]>) {
    onChange({ ...value, numbers: { ...value.numbers, [num]: { ...value.numbers[num], ...patch } } });
  }
  const okCount = Object.values(value.numbers).filter((v) => v.hit).length;
  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">
        各ナンバーに1投。命中したらOK、外れたらNGを選び、OKの場合はS/D/Tを選択してください（§22）。
      </p>
      <div className="mb-2 text-xs font-bold text-ink-900/50">
        OK: <span className="text-ink-900">{okCount}</span> / {SHOOT_OUT_NUMBERS.length}
      </div>
      <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col divide-y divide-ink-900/5">
        {SHOOT_OUT_NUMBERS.map((num) => {
          const entry = value.numbers[num] ?? { hit: false };
          return (
            <div key={num} className="flex items-center justify-between gap-2 py-1.5">
              <span className="w-10 shrink-0 text-sm font-extrabold text-ink-900/80">{num}</span>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => update(num, { hit: true, hitType: entry.hitType ?? 'SINGLE' })}
                  className={
                    'min-h-[36px] px-3 rounded-lg text-xs font-bold touch-manipulation ' +
                    (entry.hit ? 'bg-good/15 text-good' : 'bg-ink-900/5 text-ink-900/40')
                  }
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => update(num, { hit: false, hitType: undefined })}
                  className={
                    'min-h-[36px] px-3 rounded-lg text-xs font-bold touch-manipulation ' +
                    (!entry.hit ? 'bg-bad/10 text-bad' : 'bg-ink-900/5 text-ink-900/40')
                  }
                >
                  NG
                </button>
              </div>
              <div className="flex gap-1 flex-1 justify-end">
                {entry.hit &&
                  SHOOT_OUT_HIT_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update(num, { hitType: opt.value })}
                      className={
                        'min-h-[32px] min-w-[32px] rounded-md text-xs font-bold touch-manipulation ' +
                        (entry.hitType === opt.value ? 'bg-brand-500 text-white' : 'bg-ink-900/5 text-ink-900/50')
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      <NumberField label="最終得点" value={value.finalScore} onChange={(v) => onChange({ ...value, finalScore: v })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// HALF-IT (§23) — 15,16,DOUBLE,17,18,TRIPLE,19,20,BULLの9ラウンド固定
// ---------------------------------------------------------------------------

const HALF_IT_TARGET_LABEL: Record<HalfItRound['target'], string> = {
  '15': '15',
  '16': '16',
  DOUBLE: 'DOUBLE (INBULL含む)',
  '17': '17',
  '18': '18',
  TRIPLE: 'TRIPLE',
  '19': '19',
  '20': '20',
  BULL: 'BULL',
};

export function defaultHalfItResult(): HalfItResult {
  return {
    rounds: HALF_IT_TARGETS.map((target) => ({ target, single: 0, double: 0, triple: 0, miss: 0, halved: false })),
    finalScore: 0,
  };
}

export function HalfItForm({ value, onChange }: { value: HalfItResult; onChange: (v: HalfItResult) => void }) {
  function updateRound(idx: number, patch: Partial<HalfItRound>) {
    const rounds = value.rounds.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange({ ...value, rounds });
  }
  const stats = halfItStats(value);
  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">
        15→16→DOUBLE(INBULL含む)→17→18→TRIPLE→19→20→BULLの9ラウンド固定です。狙いを外して得点が半分になった場合はHALFをONにしてください（§23）。
      </p>
      <div className="flex flex-col divide-y divide-ink-900/5">
        {value.rounds.map((round, idx) => (
          <div key={round.target} className="py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold text-ink-900/85">
                R{idx + 1}: {HALF_IT_TARGET_LABEL[round.target]}
              </span>
              <button
                type="button"
                onClick={() => updateRound(idx, { halved: !round.halved })}
                className={
                  'min-h-[36px] px-3 rounded-lg text-xs font-bold touch-manipulation ' +
                  (round.halved ? 'bg-bad/10 text-bad' : 'bg-ink-900/5 text-ink-900/40')
                }
              >
                HALF {round.halved ? 'あり' : 'なし'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <TinyCounter label={`${round.target} S`} value={round.single} onChange={(v) => updateRound(idx, { single: v })} />
              <TinyCounter label={`${round.target} D`} value={round.double} onChange={(v) => updateRound(idx, { double: v })} />
              <TinyCounter label={`${round.target} T`} value={round.triple} onChange={(v) => updateRound(idx, { triple: v })} />
              <TinyCounter label={`${round.target} MISS`} value={round.miss} onChange={(v) => updateRound(idx, { miss: v })} />
            </div>
          </div>
        ))}
      </div>
      <NumberField label="最終得点" value={value.finalScore} onChange={(v) => onChange({ ...value, finalScore: v })} />
      <div className="mt-2 rounded-lg bg-ink-900/[0.03] p-3 text-sm">
        <div className="text-xs font-bold text-ink-900/50 uppercase mb-1.5">STATS（アプリ独自集計）</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            合計本数 <span className="font-extrabold text-ink-900">{stats.totalDarts}</span>
          </div>
          <div>
            HIT RATE <span className="font-extrabold text-ink-900">{stats.hitRate}%</span>
          </div>
          <div className="col-span-2">
            HALF判定ラウンド数 <span className="font-extrabold text-ink-900">{stats.halvedRounds}</span> / 9
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FINISH TRAINER (§24)
// ---------------------------------------------------------------------------

export function defaultFinishTrainerResult(): FinishTrainerResult {
  return { attempts: [] };
}

export function FinishTrainerForm({
  value,
  onChange,
}: {
  value: FinishTrainerResult;
  onChange: (v: FinishTrainerResult) => void;
}) {
  const [remaining, setRemaining] = useState(40);
  const [targetOut, setTargetOut] = useState('D20');

  function addAttempt(success: boolean) {
    const attempt: FinishTrainerAttempt = { remaining, targetOut, success };
    onChange({ attempts: [...value.attempts, attempt] });
  }

  const successCount = value.attempts.filter((a) => a.success).length;

  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">残り点数・狙ったアウト・成功/失敗を記録します（§24）。</p>
      <div className="grid grid-cols-2 gap-x-4">
        <NumberField label="残り点数" value={remaining} onChange={setRemaining} />
        <label className="block py-2">
          <div className="text-sm font-medium text-ink-900/80 mb-1.5">狙ったアウト</div>
          <input
            className="w-full min-h-[48px] rounded-lg border border-ink-900/10 bg-white px-3 text-lg font-bold"
            value={targetOut}
            onChange={(e) => setTargetOut(e.target.value)}
            placeholder="例: D20"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-1">
        <button
          type="button"
          onClick={() => addAttempt(true)}
          className="min-h-[52px] rounded-xl bg-good/15 text-good font-bold touch-manipulation"
        >
          成功として記録
        </button>
        <button
          type="button"
          onClick={() => addAttempt(false)}
          className="min-h-[52px] rounded-xl bg-bad/10 text-bad font-bold touch-manipulation"
        >
          失敗として記録
        </button>
      </div>
      <div className="mt-3 text-sm text-ink-900/60">
        記録済み: {value.attempts.length}本（成功 {successCount}）
      </div>
      {value.attempts.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
          {value.attempts.map((a, i) => (
            <li key={i} className="flex items-center justify-between text-xs text-ink-900/60 bg-ink-900/[0.03] rounded px-2 py-1">
              <span>
                残り{a.remaining} → {a.targetOut}
              </span>
              <span className={a.success ? 'text-good font-bold' : 'text-bad font-bold'}>
                {a.success ? '成功' : '失敗'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LIVE MATCH (§12) — 01=701固定 / STANDARD CRICKET固定
// ---------------------------------------------------------------------------

export function defaultLiveMatchResult(): LiveMatchResult {
  return {
    zeroOne: defaultZeroOneResult(701),
    standardCricket: defaultStandardCricketResult(),
    overallResult: 'WIN',
  };
}

export function LiveMatchForm({ value, onChange }: { value: LiveMatchResult; onChange: (v: LiveMatchResult) => void }) {
  return (
    <div>
      <div className="mb-3 rounded-lg bg-ink-900/[0.04] px-3 py-2 text-xs text-ink-900/60">
        LIVE MATCH設定（固定）: 01=701 / CRICKET=STANDARD CRICKET / OPEN IN / DOUBLE OUT / FULL BULL / ハンディキャップなし（§12）
      </div>
      <div className="mb-2 text-sm font-bold text-ink-900/70">01 (701)</div>
      <ZeroOneForm fixedGame={701} value={value.zeroOne} onChange={(zeroOne) => onChange({ ...value, zeroOne })} showResult={false} />
      <div className="mt-4 mb-2 text-sm font-bold text-ink-900/70">STANDARD CRICKET</div>
      <StandardCricketForm value={value.standardCricket} onChange={(standardCricket) => onChange({ ...value, standardCricket })} showResult={false} />
      <div className="mt-4">
        <SegmentedControl
          label="総合結果"
          value={value.overallResult}
          onChange={(overallResult) => onChange({ ...value, overallResult })}
          options={[
            { value: 'WIN', label: 'WIN' },
            { value: 'LOSS', label: 'LOSS' },
          ]}
        />
      </div>
    </div>
  );
}
