# React Vite Auth Base

A clean, modular React app template. Built with Vite and TanStack Router,
focused on maintainability, testability, and incremental feature growth.

This template is designed to integrate with the
[Go net/http Auth Base](https://github.com/yurihbm/go-net-http-auth-base)
backend template. The frontend architecture is intentionally flexible so it can
also be adapted to other backends.

## ✅ Current Status

The repository currently provides:

- Vite + React + TypeScript base setup
- File-based routing with TanStack Router
- Server-state foundation with TanStack React Query
- Tailwind CSS v4 setup
- Linting, formatting, and test tooling configuration

Planned template capabilities (incremental):

- Auth flow module (login, register, token/session handling)
- Global app state management patterns
- Reusable design system primitives and app layout
- Integration-ready API layer for `go-net-http-auth-base`

## 📂 Project Structure

The project follows a module-oriented structure and file-based routing.

### Directory Layout (goal)

```text
src/
├── lib/                    # App-agnostic libraries (@lib/*)
│   ├── api/                # HTTP client and error handling
│   ├── charts/             # Lazy-loaded Recharts wrappers
│   ├── dev-tools/          # Router/Query devtools
│   ├── i18n/               # Translation hooks, utils and types
│   ├── tests/              # Test helpers and setup
│   └── ui/                 # Design system components, hooks, utils
├── modules/                # App feature modules (@modules/*)
│   ├── auth/               # Auth pages, hooks, services, guards
│   ├── users/              # User management feature example
│   └── shared/             # App-aware components shared across modules
├── routes/                 # App routes and route-level composition
├── main.tsx                # Application entry point
├── main.css                # Global styles and Tailwind import
└── routeTree.gen.ts        # Auto-generated route tree
```

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Routing**: TanStack Router (file-based)
- **Server State**: TanStack React Query
- **Styling**: Tailwind CSS 4 + Tailwind Variants
- **Linting**: Oxlint
- **Formatting**: Oxfmt
- **Testing**: Vitest (`happy-dom` environment)

## 🚀 Getting Started

### Prerequisites

- Node.js 24 LTS or higher (see `.nvmrc`)
- `pnpm` (recommended package manager for this repository)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd react-vite-auth-base
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Run development server**

   ```bash
   pnpm dev
   ```

4. **Open application**

   ```text
   http://localhost:5173
   ```

## 📝 Available Commands

```bash
pnpm dev            # Start Vite dev server
pnpm build          # Type-check and build production bundle
pnpm preview        # Preview production build locally
pnpm test           # Run tests once
pnpm test:watch     # Run tests in watch mode
pnpm test:ci        # CI-oriented test run (bail on first failure)
pnpm test:coverage  # Generate coverage report
pnpm typecheck      # Run TypeScript type checks
pnpm lint           # Run Oxlint
pnpm format         # Format the codebase with Oxfmt
```

## 🔌 Backend Integration (`go-net-http-auth-base`)

This template is intended to consume the API provided by
`go-net-http-auth-base`.

Recommended local setup:

1. Start the backend on a defined port (e.g., `8080`).
2. Add frontend API configuration (when wiring API layer), for example:

   ```bash
   # .env.local
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. Configure the backend for the frontend origin:

   ```bash
   # backend .env
   API_ENV=development
   API_URL=http://localhost:8080
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
   OAUTH_CALLBACK_ALLOW_LIST=http://localhost:5173/oauth/callback
   EMAIL_CHANGE_REVERT_URL=http://localhost:5173/account/email/revert
   EMAIL_OAUTH_LINK_REVERT_URL=http://localhost:5173/account/oauth/revert
   ```

Notes:

- The frontend calls the backend directly; there is no Vite proxy. The refresh
  cookie is scoped to `Path=/auth/refresh`, which a prefixed proxy would break.
- Always use `localhost` (never `127.0.0.1`) for both servers, so the
  `SameSite=Strict` cookies are sent.

### API client (`src/lib/api`)

- `client.get/post/put/patch/delete` return the API envelope
  (`{ data, message, meta? }`). `meta.next_cursor` carries the next page cursor.
- Failures throw `APIError` with `status`, `key` (the backend message key, e.g.
  `auth.unauthorized`, or `http.<status>` / `client.network` /
  `client.timeout` / `client.invalidResponse`), optional `details` and, on 429,
  `retryAfter` seconds when the API sends `Retry-After`.
- A `401` with key `auth.unauthorized` triggers one `/auth/refresh` (shared
  across concurrent requests and tabs) and a single replay. If the API rejects
  the refresh, callbacks registered with `client.onSessionExpired(cb)` run.
- `request(schema, client.get(...))` validates `data` with zod and throws
  `client.invalidResponse` on mismatch.
- `useApiErrorMessage(error)` returns the translated message from the `errors`
  i18n namespace. Add new backend keys to `src/lib/api/error-keys.ts` and to
  both `errors.json` files.
- Tests can stub the network with `mockFetch({ "GET /path": jsonResponse(...) })`
  from `@lib/tests`.

## 🧪 Testing

The project uses Vitest with `happy-dom`.

- Add tests as features are implemented (`tests.ts` / `tests.tsx`)
- Keep tests close to modules or in dedicated test folders per domain
- Run `pnpm test` before opening PRs

## 🤝 Contributing

Contributions are welcome. Recommended baseline before submitting changes:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

When extending the template, please ensure to maintain the modular structure and
keep the `go-net-http-auth-base` contracts explicit in your documentation/PR notes.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the full process.

## 🧩 Using this template

Checklist after creating a repository from this template:

1. Update the copyright holder in `LICENSE`.
2. Add a `CODEOWNERS` file in `.github/`.
3. Fill in `SECURITY.md`: remove the template notice and the placeholders (contact, support policy, response times).
4. GitHub disables scheduled workflows after 60 days without repository activity; re-enable them in the Actions tab.
5. Finish with `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage` and `pnpm build`, then delete this whole section once every step is done. In the commit, state that the template phase is over.

### Leaving the template phase

While this is a template, the README, `CONTRIBUTING.md` and `AGENTS.md` describe the template itself. Leave the phase when you bootstrap the real application: replace the template wording in them (the title description and "Current Status" in this README) with the project's own, and keep the backend contract notes in sync with the API you actually consume.

### Recommended GitHub settings

- Branch protection on `main`: require a pull request, require signed commits and require these status checks, named after the jobs in `.github/workflows`: `lint`, `test`, `i18n-drift`, `build` and `audit`.
- `dependency-review` runs only on pull requests, so it is skipped on pushes. Require it only if you have enabled the dependency graph.
- Allow merge commits only. Rebase and squash merges are re-created by GitHub and produce unsigned commits on `main`.
- Enable Dependabot alerts and security updates, and private vulnerability reporting (see [SECURITY.md](SECURITY.md)).
- Enable secret scanning with push protection, and CodeQL default setup for JavaScript/TypeScript and GitHub Actions.
- Set the default `GITHUB_TOKEN` permissions to read-only and do not let Actions approve pull requests.
- In the `main` ruleset, block deletion and force pushes (non-fast-forward).

These are optional recommendations that mirror the companion backend's setup. Each derived project chooses its own settings. Secret scanning, push protection and code scanning are paid features for private repositories (GitHub Secret Protection and GitHub Code Security).
