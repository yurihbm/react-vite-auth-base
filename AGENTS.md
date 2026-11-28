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
- Styling: Tailwind CSS + `tailwind-variants`
- Testing: Vitest (`happy-dom`) + Storybook Vitest project
- Linting: Oxlint
- Formatting: Oxfmt + import sorting + Tailwind class sorting

Primary references:

- `README.md`
- `package.json`
- `oxlint.config.ts`
- `oxfmt.config.ts`
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
pnpm test --project "unit/integration" src/lib/ui/components/button/tests.tsx
pnpm test:watch --project "unit/integration" src/lib/ui/components/text-input/tests.tsx
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
- `src/modules/shared/`: app-aware pieces shared across modules (e.g.
  `ThemeToggle`, `LanguageSwitcher`, `ButtonLink`, `usePageTitle`).
- `src/lib/<lib-name>/`: app-agnostic libraries (`ui`, `charts`, `i18n`, `api`,
  `tests`, `dev-tools`). Libraries never import from `src/modules/`.

Import aliases: `@lib/*` (`src/lib`), `@modules/*` (`src/modules`) and `@src/*`
(`src`). Prefer them over relative parent (`../`) imports.

Current module folder structure (see `src/modules/<module-name>/*`; `src/lib/ui`
follows the same components/hooks/utils layout):

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

## UI composition and design tokens

Design tokens live in `src/main.css` (`@theme` plus per-theme `--theme-*`
variables). Use the Tailwind utilities they generate, never arbitrary values:

- Font `font-sans` (self-hosted Inter Variable) and the type scale `text-2xs`
  to `text-4xl`.
- Radius: `rounded-control` (buttons, fields, small icon buttons) and
  `rounded-surface` (cards, alerts, overlays, tables).
- Shadow: `shadow-raised` (small floating elements) and `shadow-overlay`
  (popovers, menus, dialogs, toasts).
- Color: semantic tokens only (`bg-surface` for cards and sections,
  `bg-scrim` behind dialogs, `border-border-control` for form controls and
  outline buttons, `text-foreground-muted`, `bg-primary`, ...).
- Chart color: categorical `chart-1` to `chart-5` (`text-chart-1`,
  `bg-chart-1`, ...), separate from the semantic colors and at least 3:1
  against `background` and `surface` in both themes. Pass them to `@lib/charts`
  as `className`. The `/charts` page shows the palette and sample charts.
- Focus: one global `:focus-visible` outline built from `--color-ring`; for
  composite controls use the `focus-outline` utility
  (`focus-within:focus-outline`, `peer-focus-visible:focus-outline`) instead
  of `ring-*` classes.

Building blocks in `@lib/ui`: `Heading` (level and size set separately) and
`Text`; `Container` (`narrow`, `default`, `wide`), `Stack` and `Inline`;
`PageHeader`, `Section` (`surface`, `tone="danger"`), `SettingRow`, `Divider`;
`EmptyState`, `InlineError`, `DescriptionList`; `Navbar`, `NavLink`,
`SkipLink`; `Button` variants `solid`, `outline` and `ghost`. App-aware ones:
`AuthLayout` (`@modules/auth`), `ButtonLink` and `usePageTitle`
(`@modules/shared`).

Page conventions:

- Every page renders one `h1`: `PageHeader` inside a `Container` (`Stack` with
  `py-6` for spacing), or `AuthLayout` for sign-in and recovery pages. Do not
  copy wrapper classes such as `mx-auto flex w-full flex-col gap-4
  sm:max-w-sm` into routes. `<main>` adds no padding of its own.
- Every page titles the tab with `usePageTitle(t("..."))` ("Page | App");
  `AuthLayout` does it from its `title`.
- Group related controls in `Section surface` cards; one setting per
  `SettingRow` (label and description left, control right, stacked on
  mobile). Buttons keep their own width (`self-end`) instead of `w-full`.
- Destructive actions go in a separate `Section surface tone="danger"`
  ("Danger zone") with a compact `color="danger"` button and a confirm
  `Dialog` whose Cancel is `variant="outline"`.
- Form-level errors use `Alert` (auth pages) or `InlineError`, both
  `role="alert"`; never bare red text. Forms focus the first invalid field
  after a failed submit with `useFocusFirstInvalid`.
- Lists over the API's forward-only cursor use the "Load more" pattern: a
  filter toolbar card, the total, the results (a `Table` from `md`, cards
  below), `keepPreviousData` so rows stay dimmed while filters change, an
  `EmptyState` with "Clear filters", and a Load more button with "Showing X
  of Y". See `UsersList` and `AuditLogsList`.
- Targets: at least 24px for links and small buttons, 44px for icon buttons
  where the layout allows.

## Formatting, imports, and style conventions

From `.editorconfig` and `oxfmt.config.ts`:

- Use tabs (`indent_style = tab`, `tabWidth = 2`).
- Max line width: `80`.
- Use double quotes.
- Keep semicolons.
- Use `lf` line endings and final newline.

Import ordering is automated via Oxfmt; keep groups consistent:

1. Type imports (`import type`, node first)
2. Built-in modules
3. Third-party modules
4. `@modules/...`, `@lib/...`, `@src/...` imports
5. Relative imports

Additional conventions observed in code:

- Prefer `import type` for type-only symbols.
- Keep blank lines between import groups.
- Respect existing barrel-export boundaries.
- Let Oxfmt sort class names.

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

## API client

- Use `client` from `@lib/api`; never call `fetch` directly. Errors are
  `APIError` with a `key`; show them with `useApiErrorMessage(error)` (`errors`
  i18n namespace) instead of `error.message`.
- Validate response data with `request(schema, client.get(...))`.
- Session renewal (refresh on `auth.unauthorized`) is inside the client;
  register `client.onSessionExpired(cb)` at the app entry point, since libs
  never import modules.
- Dev integration: `VITE_API_BASE_URL=http://localhost:8080`, no proxy (refresh
  cookie `Path=/auth/refresh`), always `localhost`, never `127.0.0.1`. Backend
  env values are listed in `README.md`.
- In tests use `mockFetch` / `jsonResponse` from `@lib/tests`; no MSW.

## Skills and path-scoped rules

Prefer these project skills (`.claude/skills/`) over writing the boilerplate by hand:

- `react-component-scaffolder`: `node .claude/skills/react-component-scaffolder/scripts/scaffold.ts <ComponentName> [--module <name>]` creates `index.tsx`, `styles.ts`, `stories.tsx`, `tests.tsx` and the barrel export in `src/lib/ui` or a module.
- `api-service-scaffolder`: `node .claude/skills/api-service-scaffolder/scripts/scaffold.ts <ServiceName> --module <name> --kind <query|mutation> --path </endpoint>` creates a React Query service over `@lib/api` with a `mockFetch` test and the barrel export.
- `route-checklist`: checklist for adding a route (guard, services and components, i18n, route tree, tests).

Area-specific conventions live in `.claude/rules/`, loaded when matching files are read or edited:

| Topic                       | File                                | Loaded for                                                          |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Components, styles, stories | `.claude/rules/ui-components.md`    | `src/lib/ui/**`, `src/lib/charts/**`, `src/modules/*/components/**` |
| Modules and services        | `.claude/rules/modules-services.md` | `src/modules/**`                                                    |
| Routes and guards           | `.claude/rules/routes.md`           | `src/routes/**`                                                     |
| API client                  | `.claude/rules/api.md`              | `src/lib/api/**`                                                    |
| i18n                        | `.claude/rules/i18n.md`             | `src/lib/i18n/**`, `public/locales/**`                              |
| Tests and stories           | `.claude/rules/testing.md`          | `**/tests.ts(x)`, `**/stories.tsx`, `src/lib/tests/**`              |

## Generated files and non-editable artifacts

- `src/routeTree.gen.ts` is generated by TanStack Router tooling.
- Avoid manual edits to generated files unless tooling workflow requires it.

## Final checklist for agent-delivered changes

- Structure and naming follow existing repo patterns.
- Formatting/import/class sorting remain automated and clean.
- Tests are added/updated for behavior changes.
- `pnpm lint`, `pnpm typecheck`, and relevant test commands pass.
- Docs are updated when workflow/behavior changes.
- For UI changes, the PR's "Visual changes" section has screenshots: capture
  them with the Playwright MCP browser tools against `pnpm dev` or Storybook,
  then attach them with `gh pr create --attach '<file>#<alt text>'` (also
  `gh pr edit` and `gh pr comment`).

When uncertain, mimic nearby patterns in `src/routes` and
`src/lib/ui`.
