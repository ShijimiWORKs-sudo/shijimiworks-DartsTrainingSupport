import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, SectionTitle } from '../components/ui/Card';
import { BigButton } from '../components/ui/BigButton';
import { NumberField, SegmentedControl } from '../components/ui/Stepper';
import { backupFileName } from '../lib/storage';
import { RANK_ORDER } from '../types';

const FLIGHT_OPTIONS = RANK_ORDER.map((f) => ({ value: f, label: f }));
const MINUTE_OPTIONS = [30, 60, 90, 120].map((m) => ({ value: m as 30 | 60 | 90 | 120, label: `${m}分` }));

export function SettingsPage() {
  const db = useStore((s) => s.db);
  const updateSettings = useStore((s) => s.updateSettings);
  const exportBackup = useStore((s) => s.exportBackup);
  const importBackup = useStore((s) => s.importBackup);
  const resetAll = useStore((s) => s.resetAll);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const baseline = db.settings.baseline;

  function updateBaseline(patch: Partial<typeof baseline>) {
    updateSettings({ baseline: { ...baseline, ...patch } });
  }

  function handleExport() {
    const json = exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importBackup(String(reader.result));
      setImportMessage(result.ok ? 'インポートが完了しました。' : `インポートに失敗しました: ${result.error}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">設定</h1>
        <p className="text-sm text-ink-900/50">ベースライン値・デフォルト練習時間・バックアップ</p>
      </header>

      <Card>
        <SectionTitle>ベースライン（開始時点の値）</SectionTitle>
        <p className="text-xs text-ink-900/40 mb-2">
          アプリ利用開始時点のDARTSLIVE値です。ハードコードではなく、いつでも変更できます（§5）。
        </p>
        <NumberField label="RATING" value={baseline.rating} step={0.01} onChange={(v) => updateBaseline({ rating: v })} />
        <SegmentedControl label="FLIGHT" value={baseline.flight} onChange={(v) => updateBaseline({ flight: v })} options={FLIGHT_OPTIONS} />
        <NumberField label="01" value={baseline.zeroOne} step={0.01} onChange={(v) => updateBaseline({ zeroOne: v })} />
        <NumberField label="CRICKET" value={baseline.cricket} step={0.01} onChange={(v) => updateBaseline({ cricket: v })} />
        <NumberField label="COUNT-UP" value={baseline.countUp} step={0.1} onChange={(v) => updateBaseline({ countUp: v })} />
      </Card>

      <Card>
        <SectionTitle>デフォルト練習時間</SectionTitle>
        <SegmentedControl
          value={db.settings.defaultPracticeMinutes}
          onChange={(v) => updateSettings({ defaultPracticeMinutes: v })}
          options={MINUTE_OPTIONS}
        />
      </Card>

      <Card>
        <SectionTitle>バックアップ（JSON）</SectionTitle>
        <p className="text-xs text-ink-900/40 mb-3">全データをJSONファイルとして書き出し・読み込みできます（§40）。</p>
        <div className="flex flex-col gap-2.5">
          <BigButton onClick={handleExport}>JSONをエクスポート</BigButton>
          <BigButton variant="secondary" onClick={() => fileInputRef.current?.click()}>
            JSONをインポート
          </BigButton>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          {importMessage && <p className="text-xs text-ink-900/50">{importMessage}</p>}
        </div>
      </Card>

      <Card>
        <SectionTitle>データをリセット</SectionTitle>
        <p className="text-xs text-ink-900/40 mb-3">すべての記録を削除し、初期状態に戻します。元に戻せません。</p>
        <BigButton
          variant="danger"
          onClick={() => {
            if (confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
              resetAll();
            }
          }}
        >
          すべてリセット
        </BigButton>
      </Card>
    </div>
  );
}
