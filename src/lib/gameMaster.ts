import type { GameId, GameMasterEntry, MenuStep } from '../types';

/**
 * Master list of the 10 practice games plus the two special modes
 * (NUMBER_PRACTICE / LIVE_MATCH). See 開発指示書 §4, §13, §26, §28.
 *
 * `ratingImpact` reflects the user's own classification in the spec —
 * this app never infers or recomputes DARTSLIVE's real rating algorithm.
 */
export const GAME_MASTER: GameMasterEntry[] = [
  {
    id: 'COUNT_UP',
    nameJa: 'COUNT-UP',
    purpose: '総合的な得点力（ウォームアップ）',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'B_WARMUP',
  },
  {
    id: 'EAGLES_EYE',
    nameJa: "EAGLE'S EYE",
    purpose: 'BULL精度',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'C_BULL',
  },
  {
    id: 'BIG_BULL',
    nameJa: 'BIG BULL',
    purpose: 'BULL精度',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'C_BULL',
  },
  {
    id: 'CRICKET_COUNT_UP',
    nameJa: 'CRICKET COUNT-UP',
    purpose: 'クリケットナンバーへの対応力',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'D_CRICKET_NUMBER',
  },
  {
    id: 'NUMBER_PRACTICE',
    nameJa: '1501 NUMBER PRACTICE',
    purpose: '20〜15の技術練習（実戦ゲームではない）',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'D_CRICKET_NUMBER',
  },
  {
    id: 'SHOOT_OUT',
    nameJa: 'SHOOT OUT',
    purpose: '全ナンバー対応力',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'E_NUMBER_VARIETY',
  },
  {
    id: 'HALF_IT',
    nameJa: 'HALF-IT',
    purpose: 'プレッシャー下の狙い',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'E_NUMBER_VARIETY',
  },
  {
    id: 'FINISH_TRAINER',
    nameJa: 'FINISH TRAINER',
    purpose: 'フィニッシュ力',
    ratingImpact: 'PRACTICE_ONLY',
    step: 'F_FINISH',
  },
  {
    id: 'ZERO_ONE',
    nameJa: '01',
    purpose: '01実戦力',
    ratingImpact: 'RATING_TARGET',
    step: 'G_MATCH',
  },
  {
    id: 'STANDARD_CRICKET',
    nameJa: 'STANDARD CRICKET',
    purpose: 'クリケット実戦力',
    ratingImpact: 'RATING_TARGET',
    step: 'G_MATCH',
  },
  {
    id: 'HIDDEN_CRICKET',
    nameJa: 'HIDDEN CRICKET',
    purpose: '未知のナンバーへの対応力',
    ratingImpact: 'UNKNOWN',
    step: 'E_NUMBER_VARIETY',
  },
  {
    id: 'LIVE_MATCH',
    nameJa: 'LIVE MATCH',
    purpose: '実戦（01=701 / STANDARD CRICKET固定）',
    ratingImpact: 'RATING_TARGET',
    step: 'H_LIVE_MATCH',
  },
];

export function getGameMaster(id: GameId): GameMasterEntry {
  const entry = GAME_MASTER.find((g) => g.id === id);
  if (!entry) throw new Error(`Unknown gameId: ${id}`);
  return entry;
}

export const RATING_IMPACT_LABEL: Record<GameMasterEntry['ratingImpact'], string> = {
  PRACTICE_ONLY: '練習専用',
  RATING_TARGET: 'レーティング対象',
  UNKNOWN: '対象外/要確認',
};

export const MENU_STEP_LABEL: Record<MenuStep, string> = {
  A_MISSION: 'ミッション',
  B_WARMUP: 'ウォームアップ',
  C_BULL: 'BULL',
  D_CRICKET_NUMBER: 'CRICKET NUMBER',
  E_NUMBER_VARIETY: 'NUMBER VARIETY',
  F_FINISH: 'FINISH',
  G_MATCH: '実戦',
  H_LIVE_MATCH: 'LIVE MATCH',
};

export const MENU_STEP_ORDER: MenuStep[] = [
  'A_MISSION',
  'B_WARMUP',
  'C_BULL',
  'D_CRICKET_NUMBER',
  'E_NUMBER_VARIETY',
  'F_FINISH',
  'G_MATCH',
  'H_LIVE_MATCH',
];
