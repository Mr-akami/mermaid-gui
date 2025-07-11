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
3. **Jotai/Logic** - State management and core application logic

## Project Structure Conventions

- Place UI components in `src/components/`
- Custom hooks go in `src/hooks/`
- Jotai atoms and state logic in `src/store/`
- Utility functions in `src/utils/`

## Get specification

- To get a specification from web site, you can use `readability` MCP.
- Marmaid syntacs is here
  - https://mermaid.js.org/intro/syntax-reference.html

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
