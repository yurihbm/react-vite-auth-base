---
name: react-component-scaffolder
description: Scaffolds a React component folder (index.tsx, styles.ts, stories.tsx, tests.tsx) from templates and adds its barrel export, either in the design system (src/lib/ui) or in a module (src/modules/<name>). Use when asked to create a new UI component; for services or routes use api-service-scaffolder or route-checklist.
---

# React Component Scaffolder

## Run the Script

```bash
node .claude/skills/react-component-scaffolder/scripts/scaffold.ts <ComponentName> [--module <name>]
```

`<ComponentName>` is PascalCase (`StatusPill`). The folder is its kebab-case form (`status-pill`). Without `--module` it targets `src/lib/ui/components`; with `--module auth` it targets `src/modules/auth/components`. It runs on Node's native TypeScript support (Node 24), no dependencies.

It creates:

- `<kebab>/index.tsx`: the component and `<Name>Props` (`ComponentPropsWithRef<"div">` plus `VariantProps`)
- `<kebab>/styles.ts`: a `tv()` contract with a `size` variant
- `<kebab>/stories.tsx`: `Meta`, `Default` and `Small` stories
- `<kebab>/tests.tsx`: Testing Library tests for the default render and the variant
- the export line in `components/index.ts`, in alphabetical position

The files follow `.claude/rules/ui-components.md` and pass lint, typecheck and their own tests as generated. They are placeholders: replace the markup, variants, doc comment, tests and stories with the real component, starting with a failing test for the real behavior.

## After Scaffolding

- A `src/lib` component takes text through props; a module component gets its text from a locale namespace (`pnpm i18n`) and its data from the module's `services/`.
- Check that the module root `index.ts` re-exports `./components` (the existing modules do).
- Finish with `pnpm lint`, `pnpm format --check`, `pnpm typecheck` and the component test.
