# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mermaid GUI - A visual editor for Mermaid diagrams built with React Flow.

## 目的

marmaid を描画されたオブジェクトから出力する。
GUI で決められた形の図形を書くことができる。
移動、線をつなぐ、文字を入力することが可能。
作成された図形に対応した marmaid 記法のテキストが隣のカラムにリアルタイムに出力される。
出力された marmaid を編集することが可能。
図形は自由に並べることができるが、最終的な位置関係は marmaid のデフォルトの挙動にで上書きされる。

## 画面構成

- GUI パネル
  - 図形を書くことができるパネル
- Marmaid パネル
  - 図形に合わせて marmaid 記法のテキストが出力される。
  -

## Technology Stack

- **Package Manager**: pnpm
- **Build Tool**: Vite
- **Testing**: Vitest
- **UI Framework**: React with React Flow
- **State Management**: Jotai
- **Styling**: Tailwind CSS
- Oxlint
  - not use eslint
- tsgo
  - not use tsc

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

## Architecture

The project follows a three-layer architecture:

1. **TSX Components** - Pure UI components focused on presentation
2. **Hooks** - Business logic that connects TSX components with state
3. **Pure ts** - State management and core application logic
   1. jotai - state management
   2. core - under core dir, it is like package it means those code are separated from other code. Keep portability and no react and jotai dependencies
   3. code/mermaid-code-builder - convert linked components to mermaid code

mainly mermaid-code-builder is called in atom.
atom manage state and pure logic.
hooks is adopter between tsx and atom. hooks doesn't have logic basically.

## Project Structure Conventions

It is feature based directory strategy.

- flow-chart
  - xxx.tsx
  - atom.ts - jotai atoms and slice
  - useXXXX.ts - hooks
- state-manager
  - xxx.tsx
  - atom.ts
  - useXXX.ts
- core
  - mermaid-code-builder

### Directory Structure Rules

1. **No Subdirectories in Features** - Keep feature directories flat to avoid deep nesting
   - Components are .tsx files
   - Hooks start with "use" prefix
   - No components/ or hooks/ subdirectories

2. **Cross-Feature Imports** - Use deps.ts for external dependencies
   - Each feature directory can only import from other features via deps.ts
   - deps.ts can only import from other features' index.ts
   - Direct cross-feature imports are not allowed

3. **Export Management**
   - index.ts - Exports for external use
   - deps.ts - Imports from external features/modules

### Naming Conventions

- Use descriptive names that reflect the content (e.g., `nodeCodeBuilder` instead of just `nodeBuilder`)
- English comments only

## Mermaid Syntax Reference

Compressed syntax data files are available for efficient token usage:

- **Flowchart**: `src/data/mermaid/flowchart.json` - Node shapes, connections, directions, styling
- **Sequence Diagram**: `src/data/mermaid/sequence.json` - Participants, messages, control flow, notes
- **Class Diagram**: `src/data/mermaid/class.json` - Classes, relationships, visibility, annotations
- **State Diagram**: `src/data/mermaid/state.json` - States, transitions, composite states, special states

Each file contains compressed syntax patterns using short keys (e.g., `n` for nodes, `c` for connections) to minimize token usage while preserving all essential information for GUI implementation.

## Implementation policy

- Follow `t-wada` TDD style

## Playwright MCP使用ルール

### 絶対的な禁止事項

1. **いかなる形式のコード実行も禁止**
   - Python、JavaScript、Bash等でのブラウザ操作
   - MCPツールを調査するためのコード実行
   - subprocessやコマンド実行によるアプローチ

2. **利用可能なのはMCPツールの直接呼び出しのみ**
   - playwright:browser_navigate
   - playwright:browser_screenshot
   - 他のPlaywright MCPツール

3. **エラー時は即座に報告**
   - 回避策を探さない
   - 代替手段を実行しない
   - エラーメッセージをそのまま伝える

### Refer latest document

Use context7 via mcp. Before you use library first in a session, you should use context7 and see the lated library.

### Comment rule

Use English

## React Best Practices

### useEffect Usage
- **Only use useEffect for mount/unmount operations**
- For all other state synchronization, use Jotai atoms
- This prevents unnecessary re-renders and maintains cleaner state management
