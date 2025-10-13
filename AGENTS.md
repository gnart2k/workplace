# AGENTS.md

## Build/Lint/Test Commands
- Build: `pnpm run build` (runs `turbo build` across monorepo)
- Lint: `pnpm run lint` (runs `biome check --write` in each app)
- Dev: `pnpm run dev` (runs `turbo dev` for development)
- No explicit test scripts; check CI workflows for testing setup. For single tests, use app-specific runners if available (e.g., Vitest in web app).

## Code Style Guidelines
- **Formatting**: Use Biome (biome.json) for linting and formatting; tabs for indentation, double quotes, organizes imports.
- **Naming**: kebab-case for files/directories (e.g., `create-task.ts`), PascalCase for React components (e.g., `TaskCard.tsx`).
- **Imports**: 1. External libraries, 2. Internal packages (@kaneo/libs), 3. Relative imports.
- **Types**: Use TypeScript strictly; interfaces for objects, types for unions, enums for constants.
- **Error Handling**: Follow API response format: `{ data: T, success: true }` or `{ error: string, success: false }`.
- **Architecture**: Backend uses domain-driven modules with controllers (e.g., `create-{resource}.ts`); frontend uses feature-based components and TanStack Query/Zustand for state.
- **Commits**: Follow Conventional Commits (feat:, fix:, etc.); see .cursor/rules/development-conventions.mdc for details.
- **Cursor Rules**: Incorporate .cursor/rules/*.mdc for backend API, database, deployment, frontend, and project overview patterns.