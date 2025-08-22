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
   2. core - under flowchart/core dir, it is like package it means those code are separated from other code. Keep portability and no react and jotai dependencies
   3. builders - convert linked components to mermaid code

mainly builders is called in atom.
atom manage state and pure logic.
hooks is adopter between tsx and atom. hooks doesn't have logic basically.

### Recent Refactoring (2024-12)

#### Editor Architecture Refactoring
The editor has been refactored to support multiple diagram types:

1. **Generic Editor Components** (`src/editor/`)
   - `EditorContainer` - Main container that switches between diagram types
   - `BaseEditor` - Common wrapper with providers
   - `CodeEditor` - Generic code editor that works with any diagram type
   - Generic atoms: `rawCodeAtom`, `diagramTypeAtom`, `parseErrorAtom`, `isEditingAtom`

2. **Flowchart-Specific Components** (`src/flowchart/editor/`)
   - `FlowchartEditor` (formerly NodeEditorCore)
   - `FlowchartToolbar` (formerly NodeToolbar)
   - `FlowchartPropertyPanel` (formerly PropertyPanel)

#### Data Flow Architecture

**Code → GUI Sync:**
```
rawCodeAtom → syncRawCodeToFlowchartAtom → parseFlowchartCode → nodesAtom/edgesAtom → ReactFlow
```

**GUI → Code Sync:**
```
nodesAtom/edgesAtom → flowchartMermaidCodeAtom → syncFlowchartToRawCodeAtom → rawCodeAtom → CodeEditor
```

#### Sync Loop Prevention
To prevent infinite sync loops between Code and GUI:
- `isCodeUpdateRef` - Flag for code-initiated updates
- `isGUIUpdateRef` - Flag for GUI-initiated updates
- Each sync checks these flags to avoid circular updates

#### Key Atoms

**Generic Editor Atoms** (`src/editor/atoms.ts`):
- `rawCodeAtom` - The raw text content in the code editor
- `diagramTypeAtom` - Current diagram type (flowchart, sequence, etc.)
- `parseErrorAtom` - Parse error messages
- `isEditingAtom` - Whether user is currently editing code

**Flowchart Atoms** (`src/flowchart/atoms.ts`):
- `nodesAtom` - Flowchart nodes data
- `edgesAtom` - Flowchart edges data
- `flowchartMermaidCodeAtom` - Generated Mermaid code from GUI (formerly mermaidCodeAtom)
- `syncRawCodeToFlowchartAtom` - Write-only atom to sync code to GUI
- `syncFlowchartToRawCodeAtom` - Write-only atom to sync GUI to code
- `updateLayoutDirectionAtom` - Updates layout direction and edge handles

## Project Structure Conventions

It is feature based directory strategy.

### Current Structure (After Refactoring)

```
src/
├── editor/                 # Generic editor components
│   ├── common/            # Shared editor utilities
│   │   ├── BaseEditor.tsx
│   │   ├── EditorContainer.tsx
│   │   ├── Resizer.tsx
│   │   └── types.ts
│   ├── code/              # Code editor
│   │   └── CodeEditor.tsx
│   ├── node/              # Legacy node editor (being phased out)
│   │   └── NodeEditor.tsx
│   └── atoms.ts           # Generic editor atoms
│
├── flowchart/             # Flowchart-specific functionality
│   ├── components/        # React components
│   │   ├── FlowchartNode.tsx
│   │   ├── FlowchartEdge.tsx
│   │   ├── BiDirectionalEdge.tsx
│   │   └── ResizableSubgraph.tsx
│   ├── converters/        # Data format converters
│   ├── history/           # Undo/redo state management
│   ├── core/              # Pure logic (no React/Jotai)
│   │   ├── builders/      # Mermaid code generation
│   │   └── code-parser/   # Mermaid code parsing
│   ├── editor/            # Flowchart-specific editor components
│   │   ├── FlowchartEditor.tsx
│   │   ├── FlowchartToolbar.tsx
│   │   ├── FlowchartPropertyPanel.tsx
│   │   ├── UndoRedoButtons.tsx
│   │   ├── atoms.ts
│   │   └── deps.ts
│   ├── atoms.ts           # Flowchart state management
│   ├── types.ts           # TypeScript type definitions
│   ├── index.ts           # Public exports
│   └── deps.ts            # External dependencies
│
└── app/                   # Application entry point
    └── App.tsx
```

### Directory Structure Rules

1. **Feature Organization** - Features can have subdirectories for logical grouping
   - components/ for React components
   - core/ for pure logic without React/Jotai dependencies
   - Other subdirectories as needed for organization

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
