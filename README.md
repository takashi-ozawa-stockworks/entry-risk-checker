# FX Entry Risk Checker (MVP)

FXトレードにおける資金管理（2%ルール、RR比）をエントリー前に厳格にチェックするためのSPAアプリケーション。  
本ドキュメントは、AIアシスタントおよび開発者が実装を行うためのSingle Source of Truthとして機能する。

## 1. プロジェクト概要
- 目的: 感覚的なエントリーを防止し、資金管理ルールを遵守する。
- 主要機能: エントリー条件入力に対し、許容リスクに基づいた適正ロットとエントリー可否（判定）を返す。
- 対象: 個人利用、USD/JPY専用、サーバレス（Local Storage完結）。

## 2. 技術スタック (Tech Stack)
- Framework: Next.js 15+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React Hooks (Context API or Custom Hooks)
- Storage: Browser LocalStorage
- Deployment: Vercel (Static Export capable)

## 3. ディレクトリ構造 (推奨)
```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx           # エントリーチェック画面 (Main UI)
│   └── settings/
│       └── page.tsx       # リスク設定画面
├── components/
│   ├── ui/                # ボタン、入力フォーム等の汎用パーツ
│   └── features/          # ドメイン固有コンポーネント
│       ├── TradeForm.tsx
│       ├── ResultCard.tsx
│       └── RiskSummary.tsx
├── lib/
│   ├── types.ts           # 型定義
│   ├── constants.ts       # 定数 (初期値など)
│   ├── storage.ts         # LocalStorageラッパー
│   └── calculator.ts      # 資金管理計算ロジック (Core Business Logic)
└── hooks/
    └── useRiskSettings.ts # 設定読み書き用フック
```

## 4. データ構造 (TypeScript Interfaces)

### 4.1 設定データ (LocalStorage: entry_risk_checker_settings)
```ts
export interface RiskSettings {
  accountBalance: number;      // 口座残高 (例: 100000)
  riskPercentage: number;      // 許容リスク% (例: 2.0)
  pipsValuePerLot: number;     // 1Lotあたりの1pips損益 (例: 1000)
  minLot: number;              // 最小ロット (例: 0.01)
  lotStep: number;             // ロット刻み (例: 0.01)
  minRiskRewardRatio: number;  // 最低RR比 (例: 1.5)
}
```

### 4.2 トレード入力データ
```ts
export type TradeType = 'LONG' | 'SHORT';
export type InputMode = 'PRICE' | 'PIPS';

export interface TradeInput {
  tradeType: TradeType;
  entryPrice: number;
  stopLossMode: InputMode;
  stopLossPrice?: number;
  stopLossPips?: number;
  takeProfitMode: InputMode;
  takeProfitPrice?: number;
  takeProfitPips?: number;
}
```

### 4.3 計算結果データ
```ts
export type RiskStatus = 'ENTRY_OK' | 'CONDITIONS_NG' | 'ENTRY_FORBIDDEN';

export interface CalculationResult {
  status: RiskStatus;
  recommendedLot: number;    // 推奨ロット
  stopPips: number;          // 損切り幅(pips)
  takePips: number;          // 利確幅(pips)
  actualLoss: number;        // 想定損失額(円)
  actualRiskPercent: number; // 想定リスク(%)
  potentialProfit: number;   // 想定利益額(円)
  riskRewardRatio: number;   // RR比
  messages: string[];        // 判定理由/警告文
}
```

## 5. ビジネスロジック仕様 (Core Calculation)

lib/calculator.ts に実装すべきロジック。

### 5.1 定数
- TARGET_PAIR: "USD/JPY"
- JPY_PIPS_MULTIPLIER: 100 (USD/JPYにおいて 1pips = 0.01円)

### 5.2 計算手順
1. 許容損失額 (Max Loss)  
   `maxLoss = accountBalance * (riskPercentage / 100)`
2. Pips算出 (価格指定の場合)  
   - 損切り幅: `stopPips = abs(entryPrice - stopLossPrice) * 100`  
   - 利確幅: `takePips = abs(takeProfitPrice - entryPrice) * 100`  
   - ※ `stopPips <= 0` または `takePips <= 0` の場合はエラー(FORBIDDEN)
3. 理論ロット算出  
   - 1ロットあたり損失: `lossPerLot = stopPips * pipsValuePerLot`  
   - 理論最大ロット: `rawLot = maxLoss / lossPerLot`
4. 推奨ロット算出 (丸め処理)  
   `recommendedLot = floor(rawLot / lotStep) * lotStep`  
   - ※ JavaScriptの浮動小数点誤差に注意し、適切な精度処理を行うこと。
5. 判定ロジック  
   - ENTRY_FORBIDDEN (禁止)  
     - `recommendedLot < minLot` (最小ロットでもリスク超過)  
     - `actualRiskPercent > riskPercentage` (丸め誤差等で超過)  
   - CONDITIONS_NG (条件見直し)  
     - `riskRewardRatio < minRiskRewardRatio` (RR不足)  
   - ENTRY_OK (推奨)  
     - 上記以外

## 6. UI/UX ガイドライン
- 入力フォーム  
  - スマホ対応必須: `<input type="number" inputMode="decimal" />` を使用。  
  - 即時計算: 計算ボタン押下で実行（または入力完了時の useEffect 実行も可だが、MVPでは明示的なボタン推奨）。
- フィードバック  
  - 結果パネルはステータスに応じて色を変更する。  
  - OK: Green (bg-green-50/text-green-700)  
  - NG: Yellow (bg-yellow-50/text-yellow-700)  
  - FORBIDDEN: Red (bg-red-50/text-red-700)
- 設定ガード  
  - localStorage に設定がない場合、ルートページ(/)ではフォームを表示せず、設定ページ(/settings)への誘導リンクのみを表示する。

## 7. 開発ルール (For AI Agents)
- コンポーネント分割: UIロジックと計算ロジックを混在させない。
- エラーハンドリング: 数値計算における「0除算」や「NaN」を適切に処理する。
- シンプルさ優先: MVPのため、複雑なアニメーションや外部API連携は行わない。
- コメント: 計算ロジックのステップごとに簡単なコメントを記述する。
- let は基本的に使用しない。
