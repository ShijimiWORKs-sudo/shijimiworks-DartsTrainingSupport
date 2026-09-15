import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { BigButton } from '../components/ui/BigButton';
import { getGameMaster, RATING_IMPACT_LABEL } from '../lib/gameMaster';
import type { GameId, GamePayload } from '../types';
import {
  BigBullForm,
  CountUpForm,
  CricketCountUpForm,
  EaglesEyeForm,
  FinishTrainerForm,
  HalfItForm,
  HiddenCricketForm,
  LiveMatchForm,
  NumberPracticeForm,
  ShootOutForm,
  StandardCricketForm,
  ZeroOneForm,
  cricketCountUpUiToResult,
  defaultBigBullResult,
  defaultCountUpResult,
  defaultCricketCountUpUi,
  defaultEaglesEyeResult,
  defaultFinishTrainerResult,
  defaultHalfItResult,
  defaultHiddenCricketResult,
  defaultLiveMatchResult,
  defaultNumberPracticeResult,
  defaultShootOutResult,
  defaultStandardCricketResult,
  defaultZeroOneResult,
} from '../components/games/GameForms';

const SELF_RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export function PlayPage() {
  const { sessionId, gameId } = useParams<{ sessionId: string; gameId: string }>();
  const navigate = useNavigate();
  const addGameResult = useStore((s) => s.addGameResult);
  const [memo, setMemo] = useState('');
  const [selfRating, setSelfRating] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);

  const id = gameId as GameId;
  const master = getGameMaster(id);
  const realSessionId = sessionId && sessionId !== 'none' ? sessionId : null;

  const [countUp, setCountUp] = useState(defaultCountUpResult());
  const [eaglesEye, setEaglesEye] = useState(defaultEaglesEyeResult());
  const [bigBull, setBigBull] = useState(defaultBigBullResult());
  const [cricketCountUp, setCricketCountUp] = useState(defaultCricketCountUpUi());
  const [numberPractice, setNumberPractice] = useState(defaultNumberPracticeResult());
  const [zeroOne, setZeroOne] = useState(defaultZeroOneResult());
  const [standardCricket, setStandardCricket] = useState(defaultStandardCricketResult());
  const [hiddenCricket, setHiddenCricket] = useState(defaultHiddenCricketResult());
  const [shootOut, setShootOut] = useState(defaultShootOutResult());
  const [halfIt, setHalfIt] = useState(defaultHalfItResult());
  const [finishTrainer, setFinishTrainer] = useState(defaultFinishTrainerResult());
  const [liveMatch, setLiveMatch] = useState(defaultLiveMatchResult());

  function buildPayload(): GamePayload {
    switch (id) {
      case 'COUNT_UP':
        return { gameId: 'COUNT_UP', data: countUp };
      case 'EAGLES_EYE':
        return { gameId: 'EAGLES_EYE', data: eaglesEye };
      case 'BIG_BULL':
        return { gameId: 'BIG_BULL', data: bigBull };
      case 'CRICKET_COUNT_UP':
        return { gameId: 'CRICKET_COUNT_UP', data: cricketCountUpUiToResult(cricketCountUp) };
      case 'NUMBER_PRACTICE':
        return { gameId: 'NUMBER_PRACTICE', data: numberPractice };
      case 'ZERO_ONE':
        return { gameId: 'ZERO_ONE', data: zeroOne };
      case 'STANDARD_CRICKET':
        return { gameId: 'STANDARD_CRICKET', data: standardCricket };
      case 'HIDDEN_CRICKET':
        return { gameId: 'HIDDEN_CRICKET', data: hiddenCricket };
      case 'SHOOT_OUT':
        return { gameId: 'SHOOT_OUT', data: shootOut };
      case 'HALF_IT':
        return { gameId: 'HALF_IT', data: halfIt };
      case 'FINISH_TRAINER':
        return { gameId: 'FINISH_TRAINER', data: finishTrainer };
      case 'LIVE_MATCH':
        return { gameId: 'LIVE_MATCH', data: liveMatch };
      default:
        throw new Error(`Unsupported gameId: ${id}`);
    }
  }

  function handleSave() {
    const payload = buildPayload();
    addGameResult(realSessionId, payload, { purpose: master.purpose, selfRating, memo: memo || undefined });
    navigate(realSessionId ? '/training' : '/history');
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">{master.nameJa}</h1>
        <p className="text-sm text-ink-900/50">
          {master.purpose} ・ {RATING_IMPACT_LABEL[master.ratingImpact]}
        </p>
      </header>

      <Card>
        {id === 'COUNT_UP' && <CountUpForm value={countUp} onChange={setCountUp} />}
        {id === 'EAGLES_EYE' && <EaglesEyeForm value={eaglesEye} onChange={setEaglesEye} />}
        {id === 'BIG_BULL' && <BigBullForm value={bigBull} onChange={setBigBull} />}
        {id === 'CRICKET_COUNT_UP' && <CricketCountUpForm value={cricketCountUp} onChange={setCricketCountUp} />}
        {id === 'NUMBER_PRACTICE' && <NumberPracticeForm value={numberPractice} onChange={setNumberPractice} />}
        {id === 'ZERO_ONE' && <ZeroOneForm value={zeroOne} onChange={setZeroOne} />}
        {id === 'STANDARD_CRICKET' && <StandardCricketForm value={standardCricket} onChange={setStandardCricket} />}
        {id === 'HIDDEN_CRICKET' && <HiddenCricketForm value={hiddenCricket} onChange={setHiddenCricket} />}
        {id === 'SHOOT_OUT' && <ShootOutForm value={shootOut} onChange={setShootOut} />}
        {id === 'HALF_IT' && <HalfItForm value={halfIt} onChange={setHalfIt} />}
        {id === 'FINISH_TRAINER' && <FinishTrainerForm value={finishTrainer} onChange={setFinishTrainer} />}
        {id === 'LIVE_MATCH' && <LiveMatchForm value={liveMatch} onChange={setLiveMatch} />}
      </Card>

      <Card>
        <SectionTitle>自己評価・メモ</SectionTitle>
        <div className="flex gap-2 mb-3">
          {SELF_RATING_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelfRating(n)}
              className={
                'h-10 w-10 rounded-full text-sm font-bold touch-manipulation ' +
                (selfRating === n ? 'bg-brand-500 text-white' : 'bg-ink-900/5 text-ink-900/50')
              }
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          className="w-full min-h-[72px] rounded-lg border border-ink-900/10 bg-white p-3 text-sm"
          placeholder="メモ（任意）"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </Card>

      <BigButton size="lg" onClick={handleSave}>
        結果を保存
      </BigButton>
    </div>
  );
}
