---
paths:
  - "**/tests.ts"
  - "**/tests.tsx"
  - "**/stories.tsx"
  - "src/lib/tests/**"
---

# Testing

- Vitest projects: `unit/integration` (`src/**/tests.{ts,tsx}`, `happy-dom`, `setup-i18n.ts`) and `storybook` (`stories.tsx` files). The file must be named exactly `tests.ts` or `tests.tsx` to be picked up, and sits next to the code it tests (`tests.tsx` for components, `tests.ts` for hooks, services and utils).
- Run one file: `pnpm test --project "unit/integration" <path>`; by name add `-t "<name>"`; stories only: `pnpm test --project "storybook"`.
- Imports from `vitest` are explicit (`describe`, `test`, `expect`, `vi`, `afterEach`); component tests call `cleanup()` in `afterEach`. `clearMocks` is on.
- Network: `mockFetch({ "METHOD /path": jsonResponse(body, status) })` from `@lib/tests` (an array answers successive calls; a function receives the request) and `vi.unstubAllGlobals()` afterwards. Hooks that use React Query render with `createQueryClientWrapper()`.
- Mock module dependencies with `vi.mock` (`@lib/api`'s `useApiErrorMessage`, `@tanstack/react-router`'s `useNavigate`, the module's services) as `login-form/tests.tsx` does.
- Name tests by behavior (`"renders correctly"`, `"fails with client.invalidResponse when ..."`); snapshots only for stable output. New logic and bug fixes start with a failing test.
