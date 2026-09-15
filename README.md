# Darts Training Support

DARTSLIVEでのレーティング向上を目的とした、個人用ダーツ練習管理Webアプリです。

「今日何を練習するべきか」→「実際に何をプレイしたか」→「RATING・01・CRICKET・COUNT-UPがどう変化したか」→「弱点は何か」→「次回何を練習するべきか」を一元管理します。

## 機能

- **ダッシュボード**: 現在のRATING / FLIGHT / 次ランク / 01 / CRICKET / COUNT-UP / BULL率と、前回からの変化を表示
- **ミッション**: 初期ミッション7種＋カスタムミッションの登録・管理、今日のミッションの選定（ランダム/未達成優先/最近出ていない優先）と達成/スキップ記録
- **練習メニュー自動生成**: 30/60/90/120分・体調（絶好調/普通/疲れている）に応じて、現在のFlightに合わせたSTEP A〜H構成の練習メニューを自動生成
- **10種の練習ゲーム記録**: COUNT-UP / CRICKET COUNT-UP / EAGLE'S EYE / SHOOT OUT / HALF-IT / FINISH TRAINER / BIG BULL / 01 / STANDARD CRICKET / HIDDEN CRICKET
- **1501 NUMBER PRACTICE**: 20〜15の技術練習専用モード（S/D/T/MISS、HIT RATE、TRIPLE RATEを記録）
- **LIVE MATCH**: 01=701 / STANDARD CRICKET固定のルールで実戦結果を記録
- **練習終了・自動比較**: DARTSLIVEの最新値を入力すると前回との差分（↑/↓/→）を自動計算
- **履歴・グラフ**: 日付ごとの記録一覧と、RATING/01/CRICKET/COUNT-UP/BULL率の7日・30日・90日・全期間グラフ
- **弱点分析**: NUMBER PRACTICE・CRICKET COUNT-UP・SHOOT OUTの記録から命中率の低いナンバーを抽出し、次の練習を提案
- **バックアップ**: 全データのJSONエクスポート・インポート
- **レスポンシブ**: PC（サイドバー＋横長ダッシュボード）/ iPhone（ボトムナビ＋大型タップ領域）両対応

### レーティングとの関係について（重要）

このアプリはDARTSLIVE公式のRATING値を推測・計算して上書きすることはありません。RATING / 01 / CRICKET / COUNT-UPは、ユーザーがDARTSLIVE本体で確認した値をそのまま入力する仕組みです。アプリが表示する「弱点」「おすすめ練習」「傾向」は、あくまで入力された記録に基づくアプリ独自の分析であり、公式のランク判定とは区別されます。

各ゲームには「練習専用 / レーティング対象 / 対象外・要確認」の区分を表示し、技術練習とレーティングに関わる実戦を混同しないようにしています。

## 技術構成

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [React Router](https://reactrouter.com/)（HashRouterでの静的ホスティングに対応）
- [Zustand](https://github.com/pmndrs/zustand)（状態管理）
- [Recharts](https://recharts.org/)（グラフ）
- [Tailwind CSS](https://tailwindcss.com/)（レスポンシブUI）
- [Vitest](https://vitest.dev/) + Testing Library（テスト）
- [Streamlit](https://streamlit.io/)（share.streamlit.ioへのデプロイ用の薄いラッパーのみ。UIはReact側がすべて担う）

## 起動方法

```bash
npm install
npm run dev
```

## 品質チェック

```bash
npm run typecheck   # TypeScriptの型チェック
npm run lint        # oxlint
npm test            # Vitestユニットテスト
npm run build        # ビルド（tsc -b && vite build）
```

## データ保存

すべてのデータはブラウザの `localStorage` に保存されます（キー: `darts-training-support/db`）。外部APIやサーバーは不要です。

データ構造は将来的にFirebase / Supabase / PostgreSQLなどへ移行しやすいよう、`src/types/index.ts` にドメインモデルとして定義し、`src/lib/storage.ts` に永続化ロジックを分離しています。

## バックアップ

「設定」画面から `darts-training-backup-YYYY-MM-DD.json` としてJSONエクスポート・インポートが可能です。

## share.streamlit.ioへのデプロイ

このアプリの本体はReact(Vite)製のSPAで、Streamlitとは仕組みが異なります。作り直すのではなく、
ビルド済みの1枚の自己完結HTML（`static/embed.html`）をStreamlitの静的ファイル配信機能で配り、
`streamlit_app.py`がそれをiframeとして表示するだけの薄いラッパー構成になっています
（Streamlit本体のUIパーツ・状態管理は使っていません）。

### 初回セットアップ

1. 埋め込み用HTMLをビルドする（Reactアプリを1枚のHTMLに固める。JS/CSSはすべてインライン化される）:
   ```bash
   npm run build:embed
   ```
   `static/embed.html` が生成される。このファイルは**必ずコミットする**（Streamlit Cloudは
   npm/viteを実行しないため、事前ビルドした結果をリポジトリに含める必要がある）。
2. `git add static/embed.html streamlit_app.py requirements.txt .streamlit/config.toml`
   → コミット → GitHubへpush。
3. https://share.streamlit.io にログインし、「New app」→ このリポジトリ・ブランチ`main`・
   Main file path に `streamlit_app.py` を指定してデプロイする。
4. `requirements.txt`（`streamlit`のみ）を読み込んでビルドされ、数分でURLが発行される。

### アプリを更新するたびに必要な手順

`src/` 配下を変更したら、Streamlit側の表示にも反映するために毎回:

```bash
npm run build:embed
git add static/embed.html
git commit -m "chore: rebuild streamlit embed"
git push
```

を実行する（Streamlit Cloudは自動でJS/CSSを再ビルドしない）。忘れると、Streamlit上の表示だけ
古いままになるので注意。

### なぜ `st.components.v1.html`（`srcdoc`）ではなく静的ファイル配信なのか

`st.components.v1.html()` は内部的に `<iframe srcdoc="...">` を使うが、`srcdoc` ドキュメントの
`window.location.href` は常に文字列 `"about:srcdoc"` になり、これはreact-routerが内部でURL解決の
ベースに使うため非階層スキームだとURL構築に失敗し、アプリ全体がクラッシュして真っ白になる
（実機で確認済みの既知の落とし穴）。回避策として、`.streamlit/config.toml` で
`enableStaticServing = true` を有効にし、`static/embed.html` を **`src=`（本物のGETリクエスト）**
でiframe読み込みすることで、`window.location.href` が通常のURLになり問題を回避している
（`streamlit_app.py` の `components.iframe(...)` 呼び出しを参照）。

## PC / iPhone対応

- PC: 左サイドバー＋横長ダッシュボード・グラフ
- iPhone: 下部タブナビゲーション＋大型ボタン・数字ステッパーによる片手操作
- ダーツを投げながらの操作を想定し、タップ領域を大きく確保しています

## ディレクトリ構成

```
src/
  types/        ドメインモデル（User/Settings/MissionMaster/PracticeSession/GameResult/DailyStats/...）
  lib/          storage（永続化）/ engine（ミッション選定・メニュー生成・差分計算・弱点分析）/ gameCalc（各ゲームの計算）
  store/        Zustandストア（UIから呼ぶアクションをここに集約）
  components/   ui（共通UIパーツ）/ layout（レスポンシブレイアウト）/ games（各ゲームの入力フォーム）
  pages/        ダッシュボード・ミッション・練習・履歴・グラフ・弱点分析・設定 の各画面

vite.singlefile.config.ts   npm run build:embed 用の別ビルド設定（1枚の自己完結HTMLを出力）
scripts/rename-embed.mjs    ビルド後にファイル名をembed.htmlへ変更するだけの小スクリプト
static/embed.html           npm run build:embedのビルド成果物（Streamlit用、コミット対象）
streamlit_app.py            Streamlit Cloud用の薄いラッパー（React本体をiframeで表示するだけ）
requirements.txt            Streamlit用のPython依存（streamlitのみ）
.streamlit/config.toml      Streamlitの静的ファイル配信・ツールバー設定
```

## 今後の拡張予定（初期実装では対応しない）

- DARTSLIVEデータ手入力の簡略化 / CSV import
- AIによる練習分析・翌日メニュー生成
- 投球動画・フォーム分析・ダーツ着地点記録
- 月間目標設定・Rating予測・BULL率予測
