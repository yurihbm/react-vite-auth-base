---
paths:
  - "src/modules/**"
---

# Modules and Services (`src/modules/<name>/`)

- A module has `components/`, `hooks/`, `services/`, `utils/`, optional `schemas/` and `types/`, each with an `index.ts` barrel, and a root `index.ts` re-exporting them. Other code imports from the module root (`@modules/auth`) or its layer barrel (`@modules/auth/services`), never from a deeper folder of another module.
- A service is a folder `services/<kebab-name>/` with `index.ts` and `tests.ts`, exported from `services/index.ts`. Services are React Query hooks over `client` from `@lib/api`; never call `fetch`.
- Query service: `async function` that calls `request(Schema, client.get(path, { signal }))` and maps the result; export a `<name>Key` string, optionally `queryOptions({ queryKey: [key], queryFn })` (needed when a route guard calls `queryClient.fetchQuery`) and a `use<Name>` hook with `useQuery` (see `users/services/get-me`).
- Mutation service: `useMutation({ mutationKey: [key], mutationFn })`; invalidate or clear queries in `onSuccess` through `useQueryClient` when the session or cached data changes (see `auth/services/login`, `logout`). Keep the `mutationKey` before `mutationFn` (lint rule `mutation-property-order`).
- Lists paged by the API cursor use `useInfiniteQuery` with `placeholderData: keepPreviousData`, so the current rows stay on screen (dimmed by the component) while new filters load; the UI loads the next page from a "Load more" button (see `users/services/list-users`).
- Response shapes are zod schemas in `schemas/` (timestamps from the API are unix seconds; convert in `utils/`, as `toUser` does). Domain types live in `types/`.
- Tests (`tests.ts`): `vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080")` in `beforeEach`, `vi.unstubAllEnvs()` and `vi.unstubAllGlobals()` in `afterEach`, `mockFetch({ "GET /path": jsonResponse({ data, message }) })` and `createQueryClientWrapper()` from `@lib/tests`. Assert the request through `fetchMock.callsTo("POST /path")`, and for queries a malformed payload failing with `client.invalidResponse`.
- Show errors with `useApiErrorMessage(error)`, never `error.message`.
- Add a service with the `api-service-scaffolder` skill.
