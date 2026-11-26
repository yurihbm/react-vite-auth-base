---
paths:
  - "src/lib/ui/**"
  - "src/lib/charts/**"
  - "src/modules/*/components/**"
---

# Components (`src/lib/ui`, `src/lib/charts`, module `components/`)

- Folder per component: `index.tsx` (component and exported `<Name>Props`), `styles.ts`, `stories.tsx`, `tests.tsx`; `types.ts` and `constants.ts` only when needed. Export it from the folder's `components/index.ts` barrel (`export { Badge, type BadgeProps } from "./badge";`, plus types from `./badge/types`).
- Styles are a `tv({ base, variants, defaultVariants })` from `tailwind-variants` in `styles.ts`; the component calls `styles({ className, ...variants })` and types its props with `VariantProps<typeof styles>`. Use the semantic color tokens already in use (`bg-primary-subtle`, `text-subtle-foreground`), not raw palette colors.
- Polymorphic components take `as?: E` and `ComponentPropsWithRef<E>` (see `Badge`, `Button`).
- Components in `src/lib` are app-agnostic: no `@modules/*` imports and no app copy. Text comes from props; app-aware pieces belong in a module or in `src/modules/shared`.
- Import UI through the barrel (`import { Button } from "@lib/ui"`), not through a component folder.
- Stories: `Meta<Props>` default export with `args`/`argTypes`, then named `StoryObj` exports (`Default`, one per variant). The Storybook Vitest project runs them, so they must render without a router or API.
- Tests: Testing Library `render` with `cleanup` in `afterEach`; assert roles, labels and classes, and use `toMatchSnapshot` only for the stable default render. Preserve accessibility semantics (`label`, `aria-*`, disabled).
- Add a component with the `react-component-scaffolder` skill.
