# Task Completion Workflow

## When Task is Completed

### Code Quality Checks
1. **Type checking**: `pnpm typecheck`
2. **Linting**: `pnpm lint` 
3. **Formatting**: `pnpm format`

### Testing
1. **Unit tests**: `pnpm test`
2. **Browser tests** (if UI changes): `pnpm test:browser`

### Build Verification
1. **Build check**: `pnpm build`

## TDD Workflow
1. Write test first
2. Run test (should fail)
3. Write minimal implementation to pass
4. Refactor if needed
5. Repeat

## Code Review Points
- Follow three-layer architecture
- Pure logic in core/ (no React/Jotai deps)
- Proper cross-feature imports via deps.ts
- English comments only
- Descriptive naming conventions