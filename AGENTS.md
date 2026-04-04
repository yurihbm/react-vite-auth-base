# AGENTS.md

Guide for coding agents operating in `react-vite-auth-base`.

This repo is a modular React frontend template meant for maintainability,
testability, and incremental feature growth (especially with
[`go-net-http-auth-base`](https://github.com/yurihbm/go-net-http-auth-base)).

## Stack and canonical config files

- Package manager: `pnpm`
- Framework/build: React + Vite
- Language: TypeScript (`strict`)
- Routing: TanStack Router (file-based)
- Server state: TanStack React Query
- Styling: Tailwind CSS + `tailwind-variants` + `tailwind-merge`
- Testing: Vitest (`happy-dom`) + Storybook Vitest project
- Linting: ESLint flat config
- Formatting: Prettier + import sorting + Tailwind class sorting

Primary references:

- `README.md`
- `package.json`
- `eslint.config.ts`
- `prettier.config.ts`
- `vite.config.ts`
- `tsconfig.app.json`
- `.storybook/main.ts`

## Build, lint, typecheck, and test commands

Run from repository root.

```bash
pnpm build
pnpm build-storybook
pnpm dev
pnpm format
pnpm lint
pnpm preview
pnpm storybook
pnpm test
pnpm test:watch
pnpm test:ci
pnpm test:coverage
pnpm typecheck
```

Notes:

- `pnpm build` runs `tsc -b` then `vite build`.
- `pnpm test:ci` runs `vitest run --bail 1`.
- Vitest project names: `unit/integration`, `storybook`.

### Single-test execution (important)

Current unit/integration include pattern from `vite.config.ts`:

- `src/**/tests.{ts,tsx}`

Run a single test file:

```bash
pnpm test --project "unit/integration" src/modules/shared/components/button/tests.tsx
pnpm test:watch --project "unit/integration" src/modules/shared/components/text-input/tests.tsx
```

Run by test name:

```bash
pnpm test --project "unit/integration" -t "renders correctly"
```

Run Storybook tests only:

```bash
pnpm test --project "storybook"
```

## Required validation flow for changes

Before concluding any code change, run targeted tests to validate behavior.

Lint and formatting are automated via pre-commit hooks, but you can also run them manually to check.

## Project structure and placement patterns

Follow module-oriented layout under `src/`:

- `src/routes/`: route definitions and route composition.
- `src/modules/<module-name>/`: module-specific code.
- `src/modules/shared/`: reusable UI and shared utilities.

Current module folder structure (see `src/modules/<module-name>/*`):

- components/
  - \<component-name\>/
    - `constants.ts` for constants specific to the component (optional, only if needed).
    - `index.tsx` for component implementation and exported props.
    - `stories.tsx` for Storybook stories.
    - `styles.ts` for `tailwind-variants` style contracts.
    - `tests.tsx` for Vitest tests.
    - `types.ts` for any complex types or interfaces specific to the component (optional, only if needed).
  - `index.ts` for barrel exports of all components.
- hooks/
  - \<hook-name\>/
    - `index.ts` for hook implementation and exported types.
    - `tests.ts` for Vitest tests.
  - `index.ts` for barrel exports of all hooks.
- services/
  - \<service-name\>/
    - `index.ts` for service implementation and exported types.
    - `tests.ts` for Vitest tests.
  - `index.ts` for barrel exports of all services.
- types/
  - `<type-name>.ts`: for module-specific types and interfaces that are not tied to a single component, hook, service, or utility (optional, only if needed).
  - `index.ts` for barrel exports of all types.
- utils/
  - \<util-name\>/
    - `index.ts` for utility function implementation and exported types.
    - `tests.ts` for Vitest tests.
  - `index.ts` for barrel exports of all utilities.
- `index.ts` for barrel exports of all module code.

## Formatting, imports, and style conventions

From `.editorconfig` and `prettier.config.ts`:

- Use tabs (`indent_style = tab`, `tabWidth = 2`).
- Max line width: `80`.
- Use double quotes.
- Keep semicolons.
- Use `lf` line endings and final newline.

Import ordering is automated via Prettier plugin; keep groups consistent:

1. Type imports (`import type`, node first)
2. Built-in modules
3. Third-party modules
4. `@src/...` imports (if used)
5. Relative imports

Additional conventions observed in code:

- Prefer `import type` for type-only symbols.
- Keep blank lines between import groups.
- Respect existing barrel-export boundaries.
- Let `prettier-plugin-tailwindcss` sort class names.

## TypeScript, naming, and React guidance

- Keep strict typing; avoid `any`.
- Export explicit prop types/interfaces for public components.
- Reuse utility types (`ComponentPropsWithRef`, `VariantProps`) where useful.
- Keep components focused, functional, and composable.
- Prefer importing React APIs and types from 'react' instead of using React global.
- In route files, use TanStack route factories (`createRootRoute`,
  `createFileRoute`).

Naming:

- Components, types, interfaces: `PascalCase`.
- Variables, functions: `camelCase`.
- Route filenames follow TanStack conventions (`__root.tsx`, `index.tsx`).
- Shared constants: `UPPER_SNAKE_CASE`.

## Testing and error-handling expectations

- Use Vitest + Testing Library.
- Co-locate tests with function/component code.
- Keep `tests.tsx` naming to match current include pattern.
- Prefer behavior assertions; snapshots are acceptable when stable.
- For new logic/bug fixes, write or update tests first (TDD cycle).
- Do not swallow errors silently; handle async failures explicitly.
- Preserve accessibility semantics (`label`, `aria-*`, disabled behavior).

## Generated files and non-editable artifacts

- `src/routeTree.gen.ts` is generated by TanStack Router tooling.
- Avoid manual edits to generated files unless tooling workflow requires it.

## Final checklist for agent-delivered changes

- Structure and naming follow existing repo patterns.
- Formatting/import/class sorting remain automated and clean.
- Tests are added/updated for behavior changes.
- `pnpm lint`, `pnpm typecheck`, and relevant test commands pass.
- Docs are updated when workflow/behavior changes.

When uncertain, mimic nearby patterns in `src/routes` and
`src/modules/shared`.
