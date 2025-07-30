# Mermaid GUI 仕様書

## 概要
Mermaid GUIは、ビジュアルエディタでMermaidダイアグラムを作成・編集できるツールです。

## 機能仕様

### 1. パネル構成
- **GUIエディタパネル**: React Flowを使用したビジュアルエディタ
- **コードエディタパネル**: Mermaidコードを直接編集できるエディタ
- **プロパティパネル**: 選択したノードやエッジのプロパティを編集

### 2. 同期仕様
- **GUI → コード**: リアルタイム同期
- **コード → GUI**: リアルタイム同期
  - パースエラー時はトースト通知でエラー表示

### 3. ノード仕様

#### 基本形状
- Rectangle（四角形）
- Circle（円）
- Diamond（ひし形）
- Subgraph（サブグラフ）

#### データ構造
```typescript
interface Node {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'subgraph';
  parentId?: string;    // 親ノードのID
  childIds: string[];   // 子ノードのIDリスト
  position: { x: number; y: number };
  data: {
    label: string;
    // その他のプロパティ
  };
}
```

### 4. エッジ仕様

#### エッジの種類
- Normal（通常線）
- Normal with arrow（矢印付き通常線）
- Thick（太線）
- Thick with arrow（矢印付き太線）
- Dotted（点線）
- Dotted with arrow（矢印付き点線）

#### 接続ルール
- すべてのノード間で接続可能
- Subgraph間の接続可能
- Subgraph内外のノード間の接続可能
- Subgraphもノードの一種として扱う

### 5. 編集機能
- ノードの追加・削除・移動
- エッジの接続・削除
- テキスト編集
- プロパティパネルでの詳細編集

### 6. エラーハンドリング
- Mermaidコードのパースエラーはトースト通知で表示
- GUIの操作は継続可能

## 技術仕様

### ディレクトリ構造
```
src/
├── app/
│   ├── App.tsx
│   ├── MainLayout.tsx
│   ├── index.ts
│   └── deps.ts
├── gui-editor/
│   ├── GuiEditor.tsx
│   ├── atoms.ts
│   ├── useXXX.ts (hooks)
│   ├── index.ts
│   └── deps.ts
├── code-editor/
│   ├── CodeEditor.tsx
│   ├── atoms.ts
│   ├── useXXX.ts (hooks)
│   ├── index.ts
│   └── deps.ts
├── property-panel/
│   ├── PropertyPanel.tsx
│   ├── atoms.ts
│   ├── useXXX.ts (hooks)
│   ├── index.ts
│   └── deps.ts
├── flowchart/
│   ├── FlowchartXXX.tsx
│   ├── atoms.ts
│   ├── useXXX.ts (hooks)
│   ├── index.ts
│   └── deps.ts
├── core/
│   ├── mermaid-code-builder/
│   │   ├── nodeCodeBuilder.ts
│   │   ├── edgeCodeBuilder.ts
│   │   ├── flowchartCodeBuilder.ts
│   │   ├── index.ts
│   │   └── deps.ts
│   └── mermaid-parser/
│       ├── nodeParser.ts
│       ├── edgeParser.ts
│       ├── flowchartParser.ts
│       ├── index.ts
│       └── deps.ts
└── common/
    └── types/
        └── index.ts
```

### 実装方針
- TDD（Test-Driven Development）に従って実装
- 各機能は独立したfeatureとして管理
- コアロジックはReactやJotaiに依存しない純粋なTypeScriptで実装