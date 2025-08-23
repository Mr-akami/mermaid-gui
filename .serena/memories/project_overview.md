# Project Overview

## Purpose
Mermaid GUI - A visual editor for Mermaid diagrams built with React Flow.

The goal is to:
- Create diagrams using a GUI with predetermined shapes
- Allow movement, connecting lines, and text input
- Generate corresponding Mermaid syntax in real-time in an adjacent column
- Enable editing of the generated Mermaid code
- Support flexible positioning in GUI (though final layout follows Mermaid defaults)

## Tech Stack
- **Package Manager**: pnpm
- **Build Tool**: Vite  
- **Testing**: Vitest (including browser tests)
- **UI Framework**: React with React Flow
- **State Management**: Jotai
- **Styling**: Tailwind CSS
- **Linting**: Oxlint (not ESLint)
- **Type Checking**: tsgo (not tsc)

## Architecture
Three-layer architecture:
1. **TSX Components** - Pure UI components for presentation
2. **Hooks** - Business logic adapters connecting TSX to state 
3. **Pure TypeScript** - State management and core logic
   - jotai - state management
   - core - portable logic (under flowchart/core dir, no React/Jotai dependencies)
   - builders - convert components to Mermaid code

Flow: atoms manage state and pure logic → hooks adapt between TSX and atoms → hooks have minimal logic