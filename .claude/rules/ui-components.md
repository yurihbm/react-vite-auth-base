---
paths:
  - "src/lib/ui/**"
  - "src/lib/charts/**"
  - "src/modules/*/components/**"
---

# Components (`src/lib/ui`, `src/lib/charts`, module `components/`)

- Folder per component: `index.tsx` (component and exported `<Name>Props`), `styles.ts`, `stories.tsx`, `tests.tsx`; `types.ts` and `constants.ts` only when needed. Export it from the folder's `components/index.ts` barrel (`export { Badge, type BadgeProps } from "./badge";`, plus types from `./badge/types`).
- Styles are a `tv({ base, variants, defaultVariants })` from `tailwind-variants` in `styles.ts`; the component calls `styles({ className, ...variants })` and types its props with `VariantProps<typeof styles>`. There is no `tailwind-merge`, so conflicting classes are not deduplicated: express alternatives as variants or `compoundVariants` (see `Section` `tone`, `Button` `variant`) instead of overriding through `className`.
- Use the tokens from `src/main.css`, never arbitrary values or raw palette colors: semantic colors (`bg-surface` for cards, `bg-primary-subtle`, `text-foreground-muted`, `border-border-control` for form controls, `bg-scrim`), `rounded-control` for controls and `rounded-surface` for surfaces and overlays, `shadow-raised`/`shadow-overlay`, the `text-2xs` to `text-4xl` scale. Focus comes from the global `:focus-visible` outline; composite controls use `focus-within:focus-outline` or `peer-focus-visible:focus-outline`, not `ring-*`.
- Reuse the primitives before writing layout classes: `Heading`/`Text`, `Container`, `Stack`/`Inline`, `PageHeader`, `Section`, `SettingRow`, `Divider`, `EmptyState`, `InlineError`, `DescriptionList` (page conventions are in `DESIGN.md`, "Layout primitives and page patterns").
- Interactive targets are at least 24px; icon-only buttons are 44px (`size-11`) where the layout allows, with an `aria-label` and the icon `aria-hidden`.
- Polymorphic components take `as?: E` and `ComponentPropsWithRef<E>` (see `Badge`, `Button`).
- Components in `src/lib` are app-agnostic: no `@modules/*` imports and no app copy. Text comes from props; app-aware pieces belong in a module or in `src/modules/shared`.
- Import UI through the barrel (`import { Button } from "@lib/ui"`), not through a component folder.
- Stories: `Meta<Props>` default export with `args`/`argTypes`, then named `StoryObj` exports (`Default`, one per variant). The Storybook Vitest project runs them, so they must render without the real API: module stories that need a router or React Query use the `withAuthProviders` decorator (`@modules/auth/components/decorators`) and seed query data with `setQueryData` (see `UsersList`, `HomePage`).
- Tests: Testing Library `render` with `cleanup` in `afterEach`; assert roles, labels and classes, and use `toMatchSnapshot` only for the stable default render. Preserve accessibility semantics (`label`, `aria-*`, disabled).
- Add a component with the `react-component-scaffolder` skill.
