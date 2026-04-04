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
├── modules/
│   ├── auth/               # Auth pages, hooks, services, guards
│   ├── dashboard/          # Private feature module example
│   ├── users/              # User management feature example
│   └── shared/             # Shared UI, hooks, utils, services
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
- **Styling**: Tailwind CSS 4 + Tailwind Variants + Tailwind Merge
- **Linting**: ESLint 10 + TypeScript ESLint
- **Formatting**: Prettier
- **Testing**: Vitest (`happy-dom` environment)

## 🚀 Getting Started

### Prerequisites

- Node.js `24.14.1` or higher
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
pnpm lint           # Run ESLint
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

3. Ensure CORS is configured on backend to allow frontend origin
   (typically `http://localhost:5173`)

## 🧪 Testing

The project uses Vitest with `happy-dom`.

- Add tests as features are implemented (`*.test.ts` / `*.test.tsx`)
- Keep tests close to modules or in dedicated test folders per domain
- Run `pnpm test` before opening PRs

## 🤝 Contributing

Contributions are welcome. Recommended baseline before submitting changes:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

When extending the template, please ensure to maintain the modular structure and
keep the `go-net-http-auth-base` contracts explicit in your documentation/PR notes.
