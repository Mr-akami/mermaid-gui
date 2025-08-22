# Code Style and Conventions

## General Conventions
- **Comments**: English only
- **Naming**: Use descriptive names (e.g., `nodeCodeBuilder` instead of `nodeBuilder`)
- **TDD**: Follow t-wada TDD style
- **Feature-based directory structure**

## TypeScript/React Conventions
- **Type definitions**: Use interfaces for object shapes
- **State management**: Jotai atoms for state, no useEffect for state sync
- **useEffect**: Only for mount/unmount operations
- **File organization**: Feature-based with subdirectories:
  - `components/` - React components
  - `core/` - Pure logic (no React/Jotai dependencies)
  - `editor/` - Editor-specific components
  - `atoms.ts` - State management
  - `types.ts` - Type definitions
  - `index.ts` - Public exports
  - `deps.ts` - External dependencies

## Cross-Feature Import Rules
- Features can only import from other features via `deps.ts`
- `deps.ts` can only import from other features' `index.ts`
- Direct cross-feature imports not allowed

## Testing Conventions
- Test files alongside implementation files
- Use vitest for testing
- Browser tests for complex UI interactions
- TDD approach: write tests first, then implementation