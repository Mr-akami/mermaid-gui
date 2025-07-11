# mermaid-gui

## TechSSack

- pnpm
- ReactFlow
- jotai
- tailwind
- vite
- vitest
- oval

## Architecture

UI should have logic for presentation, like color, sorting list, etc.
hooks doesn't have a meaningful logic.
jotai has some logic and call pure ts.
logic this is not related to ui, pure ts should have.

- There are three main parts
  - TSX
    - for only UI
  - hooks
    - adapter from ui to logic
  - jotai
    - like a interface of logic
  - logic
    - pure ts.
