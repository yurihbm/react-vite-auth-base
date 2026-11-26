---
name: api-service-scaffolder
description: Scaffolds a React Query service for a module (a query with a zod schema, or a mutation) over the @lib/api client, with a mockFetch test file and the services barrel export. Use when asked to add an API call, query or mutation hook to a module under src/modules.
---

# API Service Scaffolder

## Run the Script

```bash
node .claude/skills/api-service-scaffolder/scripts/scaffold.ts <ServiceName> --module <module> --kind <query|mutation> --path </endpoint>
```

`<ServiceName>` is PascalCase (`ListSessions`); the folder is `list-sessions`. The module must exist under `src/modules` with a `services/index.ts` barrel. It runs on Node's native TypeScript support, no dependencies.

For `ListSessions --module auth --kind query --path /auth/sessions` it creates `src/modules/auth/services/list-sessions/` with:

- `index.ts`: for a query, a zod schema placeholder, `request(Schema, client.get(path, { signal }))`, `listSessionsKey`, `LIST_SESSIONS_QUERY_OPTIONS` and `useListSessions`; for a mutation, a body interface placeholder, `client.post(path, { data })`, the key and `useListSessions` with `useMutation`
- `tests.ts`: `mockFetch` tests (success and `client.invalidResponse` for a query; request body and API error key for a mutation)
- the export line in `services/index.ts`, in alphabetical position

A mutation uses `POST`; edit the `client.<method>` call for `put`, `patch` or `delete`, and the `"POST /path"` keys in the tests with it. The result follows `.claude/rules/modules-services.md` and passes lint, typecheck and its own tests as generated, but the schema, body and test data are placeholders: replace them with the real contract (backend `docs/` and Swagger), starting with the test.

## Next Steps

```
- [ ] 1. Replace the schema or body type, doc comments and test data
- [ ] 2. Move the schema to the module's schemas/ folder if shared
- [ ] 3. Convert wire values (unix-second timestamps) in utils/ like toUser
- [ ] 4. Invalidate or update queries in onSuccess if cached data changes
- [ ] 5. New backend error keys: error-keys.ts and both errors.json files
- [ ] 6. pnpm lint, pnpm format --check, pnpm typecheck, the service test
```
