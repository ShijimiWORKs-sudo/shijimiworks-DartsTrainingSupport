import { useState } from 'react';
import { Stepper, SegmentedControl, NumberField, NumberStatGrid } from '../ui/Stepper';
import { CRICKET_NUMBER_KEYS } from '../../types';
import type {
  BigBullResult,
  CountUpResult,
  CricketCountUpResult,
  CricketNumberKey,
  EaglesEyeResult,
  FinishTrainerAttempt,
  FinishTrainerResult,
  HalfItResult,
  HiddenCricketResult,
  LiveMatchResult,
  MatchResult,
  NumberPracticeResult,
  NumberPracticeSet,
  NumberStat,
  PracticeNumber,
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

const PRACTICE_NUMBERS: PracticeNumber[] = [20, 19, 18, 17, 16, 15];

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
  return { bull: 0, miss: 0, score: 0, totalDarts: 24 };
}

export function BigBullForm({ value, onChange }: { value: BigBullResult; onChange: (v: BigBullResult) => void }) {
  return (
    <div>
      <NumberField label="SCORE" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />
      <NumberField label="総投球本数" value={value.totalDarts} onChange={(v) => onChange({ ...value, totalDarts: v })} />
      <Stepper label="BULL" value={value.bull} onChange={(v) => onChange({ ...value, bull: v })} />
      <Stepper label="MISS" value={value.miss} onChange={(v) => onChange({ ...value, miss: v })} />
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
// 1501 NUMBER PRACTICE (§18)
// ---------------------------------------------------------------------------

export function defaultNumberPracticeResult(): NumberPracticeResult {
  return {
    sets: PRACTICE_NUMBERS.map((target) => ({ target, darts: 0, single: 0, double: 0, triple: 0, miss: 0 })),
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
    onChange({ sets });
  }
  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">1人1501で20〜15を練習するモード。技術練習であり実戦ゲームではありません（§18）。</p>
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

export function defaultHiddenCricketResult(): HiddenCricketResult {
  return { score: 0, numbers: emptyStandardCricketNumbers() };
}

export function HiddenCricketForm({ value, onChange }: { value: HiddenCricketResult; onChange: (v: HiddenCricketResult) => void }) {
  const numbers = { ...emptyStandardCricketNumbers(), ...value.numbers };
  function updateNumber(key: CricketNumberKey, patch: Partial<NumberStat>) {
    onChange({ ...value, numbers: { ...numbers, [key]: { ...numbers[key], ...patch } } });
  }
  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">未知のナンバーへの対応力を確認する練習用ゲーム（§21）。</p>
      <NumberField label="SCORE" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />
      <NumberStatGrid
        numbers={CRICKET_NUMBER_KEYS}
        columns={[
          { key: 'single', label: 'S' },
          { key: 'double', label: 'D' },
          { key: 'triple', label: 'T' },
        ]}
        renderRow={(num) => [
          { key: 'single', value: numbers[num].single, onChange: (v: number) => updateNumber(num, { single: v }) },
          { key: 'double', value: numbers[num].double, onChange: (v: number) => updateNumber(num, { double: v }) },
          { key: 'triple', value: numbers[num].triple, onChange: (v: number) => updateNumber(num, { triple: v }) },
        ]}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHOOT OUT (§22)
// ---------------------------------------------------------------------------

const SHOOT_OUT_NUMBERS = [...Array.from({ length: 20 }, (_, i) => String(20 - i)), 'BULL'];

export function defaultShootOutResult(): ShootOutResult {
  const numbers: ShootOutResult['numbers'] = {};
  for (const n of SHOOT_OUT_NUMBERS) numbers[n] = { hit: 0, total: 0 };
  return { numbers };
}

export function ShootOutForm({ value, onChange }: { value: ShootOutResult; onChange: (v: ShootOutResult) => void }) {
  function update(num: string, patch: Partial<{ hit: number; total: number }>) {
    onChange({ ...value, numbers: { ...value.numbers, [num]: { ...value.numbers[num], ...patch } } });
  }
  return (
    <div>
      <p className="text-xs text-ink-900/40 mb-2">全ナンバーへの対応力。弱いナンバーの抽出に使われます（§22）。0のままでよいナンバーは未記入でOK。</p>
      <div className="max-h-[420px] overflow-y-auto pr-1">
        <NumberStatGrid
          numbers={SHOOT_OUT_NUMBERS}
          columns={[
            { key: 'hit', label: '命中' },
            { key: 'total', label: '投球数' },
          ]}
          renderRow={(num) => [
            { key: 'hit', value: value.numbers[num]?.hit ?? 0, onChange: (v: number) => update(num, { hit: v }) },
            { key: 'total', value: value.numbers[num]?.total ?? 0, onChange: (v: number) => update(num, { total: v }) },
          ]}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HALF-IT (§23)
// ---------------------------------------------------------------------------

export function defaultHalfItResult(): HalfItResult {
  return { score: 0, miss: 0, bull: 0, highScore: 0, rounds: Array(6).fill(0) };
}

export function HalfItForm({ value, onChange }: { value: HalfItResult; onChange: (v: HalfItResult) => void }) {
  return (
    <div>
      <NumberField label="SCORE" value={value.score} onChange={(v) => onChange({ ...value, score: v })} />
      <div className="grid grid-cols-2 gap-x-4">
        <Stepper label="MISS" value={value.miss} onChange={(v) => onChange({ ...value, miss: v })} />
        <Stepper label="BULL" value={value.bull} onChange={(v) => onChange({ ...value, bull: v })} />
      </div>
      <NumberField label="HIGH SCORE" value={value.highScore} onChange={(v) => onChange({ ...value, highScore: v })} />
      <div className="mt-2">
        <div className="text-sm font-medium text-ink-900/80 mb-1.5">各ラウンド</div>
        <div className="grid grid-cols-3 gap-2">
          {value.rounds.map((r, i) => (
            <NumberField
              key={i}
              label={`R${i + 1}`}
              value={r}
              onChange={(v) => {
                const rounds = [...value.rounds];
                rounds[i] = v;
                onChange({ ...value, rounds });
              }}
            />
          ))}
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
