---
name: route-checklist
description: Walks through adding a page route to this React app, from the route file and its guard to i18n, module components, tests and the regenerated route tree. Use when asked to add a page, route or screen under src/routes.
---

# Add a Route

Work through the checklist in order and keep it in your reply, ticking items as they are done. Start each code step with a failing test (TDD). Skip an item only when it does not apply, and say why.

```
- [ ] 1. Decide the file path and the access level
- [ ] 2. Services and module components, with tests
- [ ] 3. i18n keys in every language
- [ ] 4. The route file with its guard
- [ ] 5. Regenerate and commit routeTree.gen.ts
- [ ] 6. Navigation links
- [ ] 7. pnpm lint, pnpm format --check, pnpm typecheck, pnpm test
```

## 1. Path and Access

Pick the file under `src/routes/` (TanStack file-based routing, see `.claude/rules/routes.md`):

- Signed-in only: put it under `src/routes/_authenticated/` (the layout applies `privateRouteBeforeLoad`), e.g. `_authenticated/account/index.tsx` is `/account`.
- Signed-out only (login, register): `beforeLoad: publicOnlyRouteBeforeLoad`, usually in the `(auth)` group.
- Role-limited: `beforeLoad: requireRoleBeforeLoad("admin")` (all guards are exported by `@modules/auth`).
- Public for everyone (emailed revert links, OAuth callback): no guard.

## 2. Logic Outside the Route

Routes only compose. Data access goes in a module service (`api-service-scaffolder`), UI in a module or `@lib/ui` component (`react-component-scaffolder`). Test those, since routes are excluded from coverage and have no `tests.tsx`.

## 3. i18n

Use `useTranslate("<namespace>")`; add the keys to the namespace JSON of every language in `public/locales/` (reuse an existing namespace, or create one in every language folder), then run `pnpm i18n` and commit the regenerated `src/lib/i18n/generated/` types. See `.claude/rules/i18n.md`.

## 4. Route File

```tsx
export const Route = createFileRoute("/_authenticated/things/")({
	component: ThingsComponent,
});
```

The path string must match the file location. Search params are validated with `validateSearch`; any redirect target goes through `safeRedirect` (see `(auth)/login.tsx`). Use `useAuth<true>()` for the user inside private routes.

## 5. Route Tree

`src/routeTree.gen.ts` is generated, never edited by hand. Run `pnpm dev` (or `pnpm build`), let the router plugin rewrite it, and commit the change. Typecheck fails on a `Link to` or `createFileRoute` path that is missing from it.

## 6. Navigation

Add the link where users reach it (`src/routes/__root.tsx` nav, with a `nav.link.*` key in the `shared` namespace, or the page that leads there) using `Link` from `@tanstack/react-router`.

## 7. Validate

Run `pnpm lint`, `pnpm format --check`, `pnpm typecheck` and `pnpm test`; open the page with `pnpm dev` (backend on `localhost:8080`, see README) and check the guard redirect signed out and signed in.
