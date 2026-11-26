---
paths:
  - "src/lib/api/**"
---

# API Client (`src/lib/api/`)

- `client` (from `createAPIClient`) is the only HTTP entry point. `client.get/post/put/patch/delete` return the envelope `{ data, message, meta? }`; failures throw `APIError` with a `key` (backend message key, or `http.<status>`, `client.network`, `client.timeout`, `client.invalidResponse`).
- `request(schema, call)` validates `data` with zod and throws `client.invalidResponse` on mismatch. Use `apiEnvelopeSchema` and `apiResponseMetaSchema` for envelope-level schemas.
- A `401` with key `auth.unauthorized` triggers one shared `/auth/refresh` and one replay; `client.onSessionExpired(cb)` is registered at the app entry point because libs never import modules.
- Every backend error key is listed in `error-keys.ts` through `translationKey<"errors">("errors:...")` and must exist in both `public/locales/*/errors.json`. Keep the list in sync with the backend `docs/ERRORS.md`.
- Tests (`tests.ts`) use `mockFetch` and `jsonResponse` from `@lib/tests`, no MSW. `VITE_API_BASE_URL` is stubbed with `vi.stubEnv`.
