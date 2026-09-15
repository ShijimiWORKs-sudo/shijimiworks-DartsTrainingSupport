import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { BigButton } from '../components/ui/BigButton';
import { todayStr } from '../lib/dateUtils';
import type { MissionStatus } from '../types';

const OTHER = '__OTHER__';

const STATUS_LABEL: Record<MissionStatus, string> = {
  PENDING: '未達成',
  DONE: '達成',
  SKIPPED: 'スキップ',
};

export function MissionsPage() {
  const db = useStore((s) => s.db);
  const addCustomMission = useStore((s) => s.addCustomMission);
  const setMissionActive = useStore((s) => s.setMissionActive);
  const deleteMission = useStore((s) => s.deleteMission);
  const ensureTodaysMissions = useStore((s) => s.ensureTodaysMissions);
  const regenerateTodaysMissions = useStore((s) => s.regenerateTodaysMissions);
  const setMissionStatus = useStore((s) => s.setMissionStatus);

  const [selected, setSelected] = useState<string>(OTHER);
  const [customName, setCustomName] = useState('');

  const today = todayStr();
  const todaysEntries = db.dailyMissions.filter((e) => e.date === today);

  function handleSave() {
    if (selected === OTHER) {
      if (customName.trim()) {
        addCustomMission(customName.trim());
        setCustomName('');
      }
    }
    // Selecting an existing mission from the dropdown just confirms it's
    // already registered — nothing to save.
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">ミッション</h1>
        <p className="text-sm text-ink-900/50">今日のミッションの実施と、ミッション一覧の管理</p>
      </header>

      <Card>
        <SectionTitle
          action={
            <button
              className="text-xs font-bold text-brand-600"
              onClick={() => (todaysEntries.length ? regenerateTodaysMissions(3, 'RANDOM') : ensureTodaysMissions(3, 'RANDOM'))}
            >
              {todaysEntries.length ? '選び直す' : '今日のミッションを選ぶ'}
            </button>
          }
        >
          今日のミッション
        </SectionTitle>
        {todaysEntries.length === 0 ? (
          <p className="text-sm text-ink-900/50">まだ選ばれていません。「今日のミッションを選ぶ」を押してください。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todaysEntries.map((e) => {
              const mission = db.missionMaster.find((m) => m.id === e.missionId);
              return (
                <li key={e.id} className="flex items-center justify-between gap-2 rounded-lg bg-ink-900/[0.03] px-3 py-2.5">
                  <span className="text-sm font-medium text-ink-900/85">{mission?.name ?? '（削除済みミッション）'}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {(['DONE', 'SKIPPED', 'PENDING'] as MissionStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setMissionStatus(e.id, st)}
                        className={
                          'min-h-[36px] px-2.5 rounded-md text-xs font-bold touch-manipulation ' +
                          (e.status === st ? 'bg-brand-500 text-white' : 'bg-white text-ink-900/50 border border-ink-900/10')
                        }
                      >
                        {STATUS_LABEL[st]}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle>ミッションを追加</SectionTitle>
        <div className="flex flex-col gap-3">
          <select
            className="min-h-[48px] rounded-lg border border-ink-900/10 bg-white px-3 text-base"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {db.missionMaster.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
            <option value={OTHER}>その他（自由入力）</option>
          </select>
          {selected === OTHER && (
            <input
              className="min-h-[48px] rounded-lg border border-ink-900/10 bg-white px-3 text-base"
              placeholder="新しいミッションを入力"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          )}
          <BigButton onClick={handleSave} disabled={selected === OTHER && !customName.trim()}>
            ミッションとして保存
          </BigButton>
        </div>
      </Card>

      <Card>
        <SectionTitle>ミッション一覧</SectionTitle>
        <ul className="flex flex-col divide-y divide-ink-900/5">
          {db.missionMaster.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink-900/85 truncate">{m.name}</div>
                <div className="text-[11px] text-ink-900/35">{m.isCustom ? 'カスタム' : '初期ミッション'}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-1.5 text-xs text-ink-900/50">
                  <input
                    type="checkbox"
                    checked={m.active}
                    onChange={(e) => setMissionActive(m.id, e.target.checked)}
                    className="h-4 w-4"
                  />
                  有効
                </label>
                <button
                  onClick={() => deleteMission(m.id)}
                  className="text-xs font-bold text-bad px-2 py-1"
                  aria-label={`${m.name} を削除`}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
