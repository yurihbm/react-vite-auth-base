# Contributing to React Vite Auth Base

Thank you for your interest in contributing to this project! I welcome contributions from the community. Please take a moment to review this document to ensure a smooth contribution process.

## 🏗️ Architecture

The source code lives under `src/` and is organized by responsibility:

- `src/lib`: app-agnostic libraries (`ui`, `i18n`, `api`, `tests`, `dev-tools`). Libraries never import from `src/modules`.
- `src/modules`: app features, one folder per module (`auth`, `users`, ...), plus `shared` for app-aware pieces shared across modules.
- `src/routes`: TanStack Router file-based routes. Routes compose modules and stay thin.

[AGENTS.md](AGENTS.md) describes the conventions in detail (module folder layout, naming, imports), written for AI agents but useful for humans too. This template consumes the API of [go-net-http-auth-base](https://github.com/yurihbm/go-net-http-auth-base).

## 💻 Code Standards and Conventions

- **Language**: TypeScript in `strict` mode; avoid `any`.
- **Linter**: Oxlint (`pnpm lint`). Ensure your code passes all lint checks.
- **Formatting**: Oxfmt (`pnpm format`), which also sorts imports and Tailwind classes.
- **Structure**: Follow the existing module layout (`components/`, `hooks/`, `services/`, `types/`, `utils/`, with barrel `index.ts` files).
- **Generated files**: Do not edit `src/routeTree.gen.ts` or `src/lib/i18n/generated` by hand. After changing translation keys, run `pnpm i18n` and commit the result (CI fails on drift).

## 📝 Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format: `<type>(<scope>): <description>`

Examples:

- `feat(auth): add google oauth button`
- `fix(users): fix password validation logic`
- `docs(readme): update installation instructions`
- `test(shared): add unit tests for text input`

## 🧪 Testing Requirements

- **Coverage**: We aim for **80%+ test coverage**.
- **Tests**: Write tests for all new components, hooks, services and utilities, co-located with the code in `tests.ts` / `tests.tsx`. Components also get Storybook stories (`stories.tsx`), which run as browser tests.
- **Running Tests**:
  ```bash
  pnpm exec playwright install chromium  # once, for the Storybook browser tests
  pnpm test                              # all tests
  pnpm test --project "unit/integration" # unit tests only
  pnpm test:coverage                     # coverage report, as posted by CI
  ```

## 🔄 Pull Request Process

1.  **Fork the repository** and create your branch from `main`.
2.  **Install dependencies**: Run `pnpm install`.
3.  **Make your changes** following the code standards.
4.  **Add tests** for your changes.
5.  **Run the checks**: `pnpm lint`, `pnpm format --check`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build` and `pnpm build-storybook`.
6.  **Check CI status** after pushing.
7.  **Update docs**: README and AGENTS.md when a convention, flow or command changes.
8.  **Commit your changes** using the conventional commit format.
9.  **Push to your fork** and submit a Pull Request.
10. **Description**: Provide a clear description of your changes and link to any relevant issues.

## 🪝 Git Hooks

`pnpm install` installs the Husky hooks (the `prepare` script). The `pre-commit` hook runs `lint-staged`, which runs Oxlint (with `--fix`) and Oxfmt on the staged files. Type-checking, tests and builds run in CI.

## ⚙️ Development Setup

Please refer to the [Getting Started](README.md#-getting-started) section in the `README.md` for detailed instructions on how to set up the project locally and start the application.

Thank you for contributing!
